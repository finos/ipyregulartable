import numpy as np
import pandas as pd
import pytest
from spaday import Widget

from ipyregulartable import RegularTableWidget, TwoBillionRows


def _find(node, tag):
    if isinstance(node, dict):
        if node.get("tag") == tag:
            return node
        for value in node.values():
            found = _find(value, tag)
            if found is not None:
                return found
    elif isinstance(node, list):
        for value in node:
            found = _find(value, tag)
            if found is not None:
                return found
    return None


def _untag(value):
    if not isinstance(value, dict):
        return value
    for name in ("Str", "Int", "Float", "Bool"):
        if name in value:
            return value[name]
    if "Null" in value:
        return None
    if "List" in value:
        return [_untag(item) for item in value["List"]]
    if "Map" in value:
        return {key: _untag(item) for key, item in value["Map"].items()}
    return {key: _untag(item) for key, item in value.items()}


def test_dataframe_renders_through_spaday_regular_table():
    widget = RegularTableWidget(pd.DataFrame({"symbol": ["AAPL", "MSFT"], "price": [201.5, 418.0]}, index=[10, 11]))

    assert isinstance(widget, Widget)
    table = _find(widget._tree, "spaday-regular-table")
    assert table is not None
    assert _untag(table["props"]["columns"]) == [
        {"key": "column-0", "label": "symbol"},
        {"key": "column-1", "label": "price"},
    ]
    assert _untag(table["props"]["rows"]) == [
        {"__index__": "10", "column-0": "AAPL", "column-1": 201.5},
        {"__index__": "11", "column-0": "MSFT", "column-1": 418.0},
    ]
    assert _untag(table["props"]["rowHeader"]) == "__index__"
    assert table["events"]["cell-click"]["value"] == {"expr": "event"}


def test_numpy_set_data_redraws_the_spaday_tree():
    widget = RegularTableWidget(np.array([[1, 2], [3, 4]]))
    before = widget._tree

    widget.setData(np.array([[5, 6], [7, 8]]))

    assert widget._tree != before
    table = _find(widget._tree, "spaday-regular-table")
    assert _untag(table["props"]["rows"])[0] == {"__index__": "0", "column-0": 5, "column-1": 6}


def test_click_intent_calls_legacy_handler_with_coordinates():
    widget = RegularTableWidget(np.array([[1, 2]]))
    seen = []
    widget.on_click(lambda owner, value: seen.append((owner, value)))

    widget._on_msg(
        widget,
        {
            "type": "spaday:patch",
            "detail": {"model": "ipyregulartable", "field": "click", "value": {"x": 1, "y": 0}},
        },
        [],
    )

    assert seen == [(widget, [1, 0])]


def test_height_and_css_are_authored_in_the_component_tree():
    widget = RegularTableWidget(np.array([[1]]))
    widget.height = 320
    widget.css = {"td": "color: red"}

    table = _find(widget._tree, "spaday-regular-table")
    style = _find(widget._tree, "style")
    assert _untag(table["props"]["style"]) == "height: 320px; width: 100%"
    assert "regular-table td { color: red }" in _untag(style["props"]["textContent"])


def test_unbounded_python_model_is_rejected_instead_of_materialized():
    with pytest.raises(ValueError, match="cannot materialize"):
        RegularTableWidget(TwoBillionRows())
