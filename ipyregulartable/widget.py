# coding: utf-8
import string
from ipywidgets import DOMWidget, CallbackDispatcher
from traitlets import observe, Unicode, Instance, Dict, Bool, Integer
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

    def getEditable(self, x, y):
        return True

    def getNumRows(self):
        return len(self._data)

    def getNumColumns(self):
        return len(self._data[0]) if self._data else 0

    def getDataSlice(self, x0, y0, x1, y1):
        return [row[x0: x1+1] for row in self._data[y0:y1+1]]


class RegularTableWidget(DOMWidget):
    _model_name = Unicode('RegularTableModel').tag(sync=True)
    _model_module = Unicode("ipyregulartable").tag(sync=True)
    _model_module_version = Unicode("^" + __version__).tag(sync=True)
    _view_name = Unicode('RegularTableView').tag(sync=True)
    _view_module = Unicode("ipyregulartable").tag(sync=True)
    _view_module_version = Unicode("^" + __version__).tag(sync=True)

    height = Integer(default_value=200).tag(sync=True)
    _data = Dict(default_value={}).tag(sync=True)
    _editable = Bool(default_value=False).tag(sync=True)

    def __init__(self, datamodel=None):
        # super
        super(RegularTableWidget, self).__init__()

        # install data model
        self._datamodel = datamodel or SimpleDataModel()
        
        # for click events
        self._click_handlers = CallbackDispatcher()

        # for edit events
        self._edit_handlers = CallbackDispatcher()

        # hook in custom messages
        self.on_msg(self._handle_custom_msg)

    def on_click(self, callback, remove=False):
        self._click_handlers.register_callback(callback, remove=remove)

    def on_edit(self, callback, remove=False):
        self._edit_handlers.register_callback(callback, remove=remove)

    def click(self, value):
        self._click_handlers(self, value)

    def _handle_custom_msg(self, content, buffers=None):
        print(content)
        if content.get('event', '') == 'click':
            self.click(content.get('value', ''))
        elif content.get('event', '') == 'getDataSlice':
            self.getDataSlice(*content.get('value', []))
        elif content.get('event', '') == 'getEditable':
            self.getEditable(*content.get('value', []))

    def getDataSlice(self, x0, y0, x1, y1):
        print('setting data')
        self._data = {"num_rows": self._datamodel.getNumRows(),
                      "num_columns": self._datamodel.getNumColumns(),
                      "data": self._datamodel.getDataSlice(x0, y0, x1, y1)}
        self.post({"type": "data"})
        return self._data

    def getEditable(self, x, y):
        self._editable = self._datamodel.getEditable(x, y)
        return self._editable

    def post(self, msg):
        self.send(msg)

    def draw(self):
        self.send({"type": "draw"})
