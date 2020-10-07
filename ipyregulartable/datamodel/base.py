from abc import ABCMeta, abstractmethod
from six import with_metaclass


class DataModel(with_metaclass(ABCMeta)):
    @abstractmethod
    def editable(self, x, y):
        '''Given an (x,y) coordinate, return if its editable or not'''

    @abstractmethod
    def rows(self):
        '''return total number of rows'''

    @abstractmethod
    def columns(self):
        '''return total number of columns'''

    @abstractmethod
    def dataslice(self, x0, y0, x1, y1):
        '''get slice of data from (x0, y0) to (x1, y1) inclusive'''

    def write(self, x, y, value):
        '''write event'''
