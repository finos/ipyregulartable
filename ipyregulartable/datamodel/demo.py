# *****************************************************************************
#
# Copyright (c) 2020, the ipyregulartable authors.
#
# This file is part of the jupyterlab_templates library, distributed under the terms of
# the Apache License 2.0.  The full license can be found in the LICENSE file.
#
from .base import DataModel


class TwoBillionRows(DataModel):
    def editable(self, x, y):
        return True

    def rows(self):
        return 2_000_000_000

    def columns(self):
        return 1_000

    def rowheaders(self, x0, y0, x1, y1):
        '''return column headers for data'''
        return [[str(_)] for _ in range(y0, y1)]

    def columnheaders(self, x0, y0, x1, y1):
        '''return column headers for data'''
        return [[str(_)] for _ in range(x0, x1)]

    def dataslice(self, x0, y0, x1, y1):
        return [
            [_ + x for _ in range(y0, y1 + 1)]
            for x in range(x0, x1 + 1)
        ] if (x0, y0, x1, y1) != (0, 0, 0, 0) else []
