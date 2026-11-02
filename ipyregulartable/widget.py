# *****************************************************************************
#
# Copyright (c) 2020, the ipyregulartable authors.
#
# This file is part of the ipyregulartable library, distributed under the terms of
# the Apache License 2.0.  The full license can be found in the LICENSE file.
#
import base64
import math
import numbers
from datetime import date, datetime
from pathlib import Path
from typing import Literal, cast
from uuid import uuid4

import numpy as np
import pandas as pd
import spaday.widget as spaday_widget
from ipywidgets import CallbackDispatcher
from spaday import SendPatch, Widget, element, event_value
from spaday_regular_table import RegularTable, package
from traitlets import Dict, TraitError, Unicode, observe, validate

from .datamodel import DataFrameDataModel, DataModel, NumpyDataModel, SeriesDataModel

_MAX_MATERIALIZED_CELLS = 1_000_000
_STYLER_KEYS = ("table", "thead", "tr", "th", "td", "theadtr", "theadth", "tbody", "tbodytr", "tbodyth")
_SELECTORS = {
    "table": "table",
    "thead": "thead",
    "tr": "tr",
    "th": "th",
    "td": "td",
    "theadtr": "thead tr",
    "theadth": "thead th",
    "tbody": "tbody",
    "tbodytr": "tbody tr",
    "tbodyth": "tbody th",
}


def _asset(path: Path) -> str:
    if not path.is_file():
        raise RuntimeError(f"Required widget asset is missing: {path}")
    return path.read_text(encoding="utf-8")


def _widget_esm() -> str:
    regular_table = _asset(package.assets_dir / "cdn" / "index.js")
    encoded = base64.b64encode(regular_table.encode()).decode()
    spaday_source = _asset(Path(spaday_widget.__file__).parent / "extension" / "cdn" / "widget.js")
    return (
        f'const __ipyregulartableUrl = URL.createObjectURL(new Blob([atob("{encoded}")], {{type: "text/javascript"}}));\n'
        "try { await import(__ipyregulartableUrl); } finally { URL.revokeObjectURL(__ipyregulartableUrl); }\n" + spaday_source
    )


def _widget_css() -> str:
    return "\n".join(
        (
            _asset(package.assets_dir / "css" / "material.css"),
            _asset(package.assets_dir / "css" / "theme.css"),
            ".ipyregulartable { display: block; min-height: 200px; }",
            ".ipyregulartable table th { font-weight: bold; background-color: rgba(0, 0, 0, 0.1); }",
            ".ipyregulartable table td.highlight { background-color: rgba(0, 0, 155, 0.1); }",
        )
    )


def _label(value) -> str:
    if isinstance(value, (tuple, list)):
        return " / ".join(str(part) for part in value)
    return str(value)


def _json_value(value):
    if isinstance(value, np.generic):
        value = value.item()
    if value is None or isinstance(value, (str, bool, int)):
        return value
    if isinstance(value, float):
        return value if math.isfinite(value) else None
    if isinstance(value, (date, datetime)):
        return value.isoformat()
    try:
        if bool(pd.isna(value)):
            return None
    except (TypeError, ValueError):
        pass
    return str(value)


def _materialize(datamodel: DataModel):
    num_rows = datamodel.rows()
    num_columns = datamodel.columns()
    if num_rows * num_columns > _MAX_MATERIALIZED_CELLS:
        raise ValueError(
            f"spaday-regular-table cannot materialize {num_rows:,} × {num_columns:,} cells; "
            "Python-backed viewport slices require a future data-provider protocol"
        )

    if isinstance(datamodel, NumpyDataModel):
        values = datamodel._data.T.tolist()
        column_labels = [str(index) for index in range(num_columns)]
        row_labels = [str(index) for index in range(num_rows)]
    elif isinstance(datamodel, SeriesDataModel):
        values = [datamodel._data.tolist()]
        column_labels = [str(datamodel._data.name)]
        row_labels = [_label(value) for value in datamodel._data.index]
    elif isinstance(datamodel, DataFrameDataModel):
        values = datamodel._data.values.T.tolist()
        column_labels = [_label(value) for value in datamodel._data.columns]
        row_labels = [_label(value) for value in datamodel._data.index]
    elif num_rows and num_columns:
        values = datamodel.dataslice(0, 0, num_columns - 1, num_rows - 1)
        column_labels = [_label(value) for value in datamodel.columnheaders(0, 0, num_columns - 1, num_rows - 1)]
        row_labels = [_label(value) for value in datamodel.rowheaders(0, 0, num_columns - 1, num_rows - 1)]
    else:
        values, column_labels, row_labels = [], [], []

    columns = [{"key": f"column-{index}", "label": label} for index, label in enumerate(column_labels)]
    rows = []
    for row_index in range(num_rows):
        row = {"__index__": row_labels[row_index] if row_index < len(row_labels) else str(row_index)}
        for column_index in range(num_columns):
            column = values[column_index] if column_index < len(values) else []
            row[f"column-{column_index}"] = _json_value(column[row_index] if row_index < len(column) else None)
        rows.append(row)
    return columns, rows


class CSSHeight(Unicode):
    def validate(self, obj, value):
        if isinstance(value, numbers.Number):
            value = f"{value}px"
        return super().validate(obj, value)


class RegularTableWidget(Widget):
    """A Spaday anywidget rendering ``spaday-regular-table`` from Python data."""

    _esm = _widget_esm()
    _css = _widget_css()

    virtual_mode = Unicode("both")
    height = CSSHeight(default_value="250px")
    css = Dict(default_value={})
    styler = Dict(default_value={})

    def __init__(self, datamodel=None, log_js_errors=True):
        super().__init__(element("div"))
        self._initialized = False
        self._element_id = f"ipyregulartable-{uuid4().hex}"
        self._datamodel = self._coerce_datamodel(datamodel)
        self._datamodel._setWidget(self)
        self._click_handlers = CallbackDispatcher()
        self._log_js_errors = log_js_errors
        self.on_intent(self._handle_intent)
        self._initialized = True
        self.draw()

    @staticmethod
    def _coerce_datamodel(datamodel):
        if datamodel is None:
            return NumpyDataModel()
        if isinstance(datamodel, DataModel):
            return datamodel
        if isinstance(datamodel, np.ndarray):
            return NumpyDataModel(datamodel)
        if isinstance(datamodel, pd.Series):
            return SeriesDataModel(datamodel)
        if isinstance(datamodel, pd.DataFrame):
            return DataFrameDataModel(datamodel)
        raise TypeError(f"Unsupported data model: {datamodel}")

    @property
    def datamodel(self):
        return self._datamodel

    @datamodel.setter
    def datamodel(self, value):
        self._datamodel = self._coerce_datamodel(value)
        self._datamodel._setWidget(self)
        if self._initialized:
            self.draw()

    def _component(self):
        columns, rows = _materialize(self.datamodel)
        virtual_mode = cast(Literal["both", "horizontal", "vertical", "none"], self.virtual_mode)
        table = RegularTable(
            columns=columns,
            rows=rows,
            row_header="__index__",
            virtual_mode=virtual_mode,
            id=self._element_id,
            style=f"height: {self.height}; width: 100%",
        ).on("cell-click", SendPatch("ipyregulartable", "click", event_value()))
        return element(
            "div",
            element("style").text(self._custom_css()),
            table,
            class_="ipyregulartable",
            style=f"height: {self.height}",
        )

    def _custom_css(self) -> str:
        return "\n".join(
            f"#{self._element_id} regular-table {_SELECTORS[key]} {{ {declaration} }}" for key, declaration in self.css.items() if declaration
        )

    def _handle_intent(self, content):
        detail = content.get("detail", {})
        if detail.get("model") != "ipyregulartable" or detail.get("field") != "click":
            return
        value = detail.get("value", {})
        self.click([value.get("x"), value.get("y")])

    def on_click(self, callback, remove=False):
        self._click_handlers.register_callback(callback, remove=remove)

    def on_edit(self, callback, remove=False):
        raise NotImplementedError("editing requires a Python data-provider protocol in spaday-regular-table")

    def click(self, value):
        self._click_handlers(self, value)

    def dataslice(self, x0, y0, x1, y1):
        return {
            "num_rows": self.datamodel.rows(),
            "num_columns": self.datamodel.columns(),
            "column_headers": self.datamodel.columnheaders(x0, y0, x1, y1),
            "row_headers": self.datamodel.rowheaders(x0, y0, x1, y1),
            "data": self.datamodel.dataslice(x0, y0, x1, y1),
        }

    def editable(self, x, y):
        return self.datamodel.editable(x, y)

    def draw(self):
        self.update(self._component())

    def setData(self, data):
        self.datamodel.setData(data)
        self.draw()

    @observe("virtual_mode", "height", "css")
    def _display_changed(self, change):
        if getattr(self, "_initialized", False):
            self.draw()

    @validate("virtual_mode")
    def _validate_virtual_mode(self, proposal):
        if proposal["value"] not in {"both", "horizontal", "vertical", "none"}:
            raise TraitError(f"Unknown virtual mode: {proposal['value']}")
        return proposal["value"]

    @validate("css")
    def _validate_css(self, proposal):
        for key, value in proposal["value"].items():
            if key not in _STYLER_KEYS:
                raise TraitError(f"Unrecognized key: {key}")
            if not isinstance(value, str):
                raise TraitError("css values need to be strings")
        return proposal["value"]

    @validate("styler")
    def _validate_styler(self, proposal):
        if proposal["value"]:
            raise TraitError("expression-based styler rules are not supported by spaday-regular-table")
        return proposal["value"]
