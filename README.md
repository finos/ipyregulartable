<p align="center">
<img src="docs/img/logo.png" width="200">
</p>

# ipyregulartable

An [AnyWidget](https://anywidget.dev/) wrapper around
[`spaday-regular-table`](https://github.com/1kbgz/spaday-regular-table) for Jupyter.

[![Build Status](https://github.com/finos/ipyregulartable/actions/workflows/build.yaml/badge.svg?branch=main&event=push)](https://github.com/finos/ipyregulartable/actions/workflows/build.yaml)
[![codecov](https://codecov.io/gh/finos/ipyregulartable/branch/main/graph/badge.svg)](https://codecov.io/gh/finos/ipyregulartable)
[![License](https://img.shields.io/github/license/finos/ipyregulartable)](https://github.com/finos/ipyregulartable)
[![PyPI](https://img.shields.io/pypi/v/ipyregulartable.svg)](https://pypi.python.org/pypi/ipyregulartable)
[![FINOS Incubating](https://cdn.jsdelivr.net/gh/finos/contrib-toolbox@master/images/badge-incubating.svg)](https://community.finos.org/docs/governance/software-projects/stages/incubating)
[![Binder](https://mybinder.org/badge_logo.svg)](https://mybinder.org/v2/gh/finos/ipyregulartable/main?urlpath=lab)

## Installation

Install the Python package. AnyWidget supplies the Jupyter integration, so there is no labextension or
nbextension to install.

```bash
pip install ipyregulartable
```

Conda packages are available from conda-forge:

```bash
conda install -c conda-forge ipyregulartable
```

## Usage

Pass a NumPy array, pandas Series, pandas DataFrame, or `DataModel` to `RegularTableWidget`:

```python
import pandas as pd

from ipyregulartable import RegularTableWidget

table = RegularTableWidget(
    pd.DataFrame(
        {
            "symbol": ["AAPL", "MSFT"],
            "price": [201.5, 418.0],
        }
    )
)
table
```

The widget is a `spaday.Widget`. It renders the `spaday-regular-table` custom element and uses Spaday's
component tree and action runtime for browser behavior.

Register a click callback with the existing API:

```python
table.on_click(lambda widget, coordinates: print(coordinates))
```

Set table height and static CSS rules from Python:

```python
table.height = 400
table.css = {
    "theadth": "background: #f2f4f7; font-weight: 700",
    "td": "padding-inline: 0.75rem",
}
```

## Data models

Custom data models implement the abstract methods on `DataModel`:

```python
from abc import abstractmethod

from ipyregulartable import DataModel


class MyDataModel(DataModel):
    @abstractmethod
    def editable(self, x, y):
        """Return whether the cell at (x, y) is editable."""

    @abstractmethod
    def rows(self):
        """Return the total number of rows."""

    @abstractmethod
    def columns(self):
        """Return the total number of columns."""

    @abstractmethod
    def dataslice(self, x0, y0, x1, y1):
        """Return a data slice, inclusive of both coordinate pairs."""
```

`spaday-regular-table` keeps row records in the browser and virtualizes their DOM rendering. This
implementation materializes at most 1,000,000 cells when the widget is created or redrawn. Larger
models raise `ValueError` instead of sending an unbounded payload over the widget comm.

## Compatibility

The Spaday implementation supports:

- NumPy arrays, pandas Series, pandas DataFrames, and bounded custom `DataModel` objects;
- viewport-virtualized rendering through `spaday-regular-table`;
- `on_click`, `draw`, `setData`, `dataslice`, and `editable`;
- `height`, `virtual_mode`, and static `css` rules.

The following legacy features need a Python data-provider protocol in `spaday-regular-table` and are
not implemented:

- Python-backed viewport slices such as `TwoBillionRows`;
- in-cell editing and `on_edit` callbacks;
- expression-based `styler` rules.

## License

Licensed under the Apache License 2.0. See [LICENSE](LICENSE), [NOTICE](NOTICE), and
[AUTHORS](AUTHORS).

> [!NOTE]
> This library was generated using [Copier](https://copier.readthedocs.io/en/stable/) from the
> [Base Python Project Template](https://github.com/python-project-templates/base).
