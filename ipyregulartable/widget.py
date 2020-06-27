# coding: utf-8
import string
from ipywidgets import DOMWidget, CallbackDispatcher
from traitlets import observe, Unicode, Instance, Dict
from functools import wraps
from random import choice, sample, randint, random
from ._version import __version__

def _generateRandomData(n_rows=100, n_cols=10):
    coltypes = [choice((int, str, float, bool)) for _ in range(n_cols)]
    return [
        [
            {
                int: randint(0, 100),
                str: ''.join(sample(string.ascii_lowercase, 5)),
                float: random() * 100,
                bool: choice((True, False))
            }.get(coltypes[_]) for _ in range(n_cols)
        ] for _ in range(n_rows)
    ]


class SimpleDataModel(object):
    def __init__(self, data=None):
        self._data = data or _generateRandomData()

    def editable(self, x0, y0, x1, y1):
        pass

    def getDataSlice(self, x0, y0, x1, y1):
        return {'num_rows': len(self._data),
                'num_columns': len(self._data[0]) if self._data else 0,
                'row_headers': list(range(x0, x1+1)),
                'column_headers': list(range(y0, y1+1)),
                'data': [col[y0: y1+1] for col in self._data[x0:x1+1]]
                }


class RegularTableWidget(DOMWidget):
    _model_name = Unicode('RegularTableModel').tag(sync=True)
    _model_module = Unicode("ipyregulartable").tag(sync=True)
    _model_module_version = Unicode("^" + __version__).tag(sync=True)
    _view_name = Unicode('RegularTableView').tag(sync=True)
    _view_module = Unicode("ipyregulartable").tag(sync=True)
    _view_module_version = Unicode("^" + __version__).tag(sync=True)

    def __init__(self, datamodel=None):
        super(RegularTableWidget, self).__init__()

        # install data model
        self._datamodel = datamodel or SimpleDataModel()

        # for click events
        self._click_handlers = CallbackDispatcher()
        self.on_msg(self._handle_click_msg)

    def on_click(self, callback, remove=False):
        self._click_handlers.register_callback(callback, remove=remove)

    def click(self, value):
        self._click_handlers(self, value)

    def _handle_click_msg(self, _, content, buffers):
        if content.get('event', '') == 'click':
            self.click(content.get('value', ''))

    def post(self, msg):
        self.send(msg)
