import numpy as np
import string
from random import choice, sample, randint, random

from .base import DataModel


def _generateRandomData(n_rows=100, n_cols=10):
    coltypes = [choice((int, str, float, bool)) for _ in range(n_cols)]

    return np.array([
        ([_] + [
            {
                int: randint(0, 100),
                str: ''.join(sample(string.ascii_lowercase, 5)),
                float: random() * 100,
                bool: choice((True, False))
            }.get(coltypes[_]) for _ in range(n_cols - 1)
        ]) for _ in range(n_rows)
    ])


class NumpyDataModel(DataModel):
    def __init__(self, data=None):
        if isinstance(data, np.ndarray):
            self._data = data
        elif data is not None:
            self._data = np.array(data)
        else:
            self._data = _generateRandomData()

    def editable(self, x, y):
        return True

    def rows(self):
        return len(self._data)

    def columns(self):
        return len(self._data[0]) if (self._data is not None and len(self._data) > 0) else 0

    def dataslice(self, x0, y0, x1, y1):
        return self._data[y0:y1 + 1, x0:x1 + 1].T.tolist() if (x0, y0, x1, y1) != (0, 0, 0, 0) else []

    def write(self, x, y, value):
        self._data[y, x] = value
