# *****************************************************************************
#
# Copyright (c) 2020, the ipyregulartable authors.
#
# This file is part of the jupyterlab_templates library, distributed under the terms of
# the Apache License 2.0.  The full license can be found in the LICENSE file.
#
import pandas as pd
from .base import DataModel


class SeriesDataModel(DataModel):
    def __init__(self, data=None):
        if not isinstance(data, pd.Series):
            raise Exception('Data must be pandas Series for SeriesDataModel, got: {}'.format(type(data)))
        self._data = data

    def editable(self, x, y):
        return True

    def rows(self):
        return len(self._data)

    def columns(self):
        return 1

    def rowheaders(self, x0, y0, x1, y1):
        '''return column headers for data'''
        return [[str(_)] for _ in self._data.index.values[y0:y1 + 1]]

    def columnheaders(self, x0, y0, x1, y1):
        '''return column headers for data'''
        return [[str(self._data.name)] for _ in range(x0, x1)]

    def dataslice(self, x0, y0, x1, y1):
        return [self._data.iloc[y0:y1 + 1].T.tolist()] if (x0, y0, x1, y1) != (0, 0, 0, 0) else []

    def write(self, x, y, value):
        self._data.iloc[y] = value

    def setData(self, data):
        if isinstance(data, pd.Series):
            self._data = data
        else:
            raise Exception('Cannot set non-pandas series data for pandas series data model')
        self.draw()


class DataFrameDataModel(DataModel):
    def __init__(self, data=None):
        if not isinstance(data, pd.DataFrame):
            raise Exception('Data must be pandas DataFrame for DataFrameDataModel, got: {}'.format(type(data)))
        self._data = data

    def editable(self, x, y):
        return True

    def rows(self):
        return len(self._data)

    def columns(self):
        return len(self._data.iloc[0]) if (self._data is not None and len(self._data) > 0) else 0

    def rowheaders(self, x0, y0, x1, y1):
        '''return column headers for data'''
        if isinstance(self._data.index, pd.MultiIndex):
            return self._data.index.values[y0:y1 + 1].tolist()
        return [[str(_)] for _ in self._data.index.values[y0:y1 + 1]]

    def columnheaders(self, x0, y0, x1, y1):
        '''return column headers for data'''
        if isinstance(self._data.columns, pd.MultiIndex):
            return self._data.columns.values[x0:x1 + 1].tolist()
        return [[str(c)] for c in self._data.columns]

    def dataslice(self, x0, y0, x1, y1):
        return self._data.iloc[y0:y1 + 1, x0:x1 + 1].values.T.tolist() if (x0, y0, x1, y1) != (0, 0, 0, 0) else []

    def write(self, x, y, value):
        self._data.iloc[y, x] = value

    def setData(self, data):
        if isinstance(data, pd.DataFrame):
            self._data = data
        else:
            raise Exception('Cannot set non-pandas series data for pandas series data model')
