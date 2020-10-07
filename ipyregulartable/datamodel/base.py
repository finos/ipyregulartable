# *****************************************************************************
#
# Copyright (c) 2020, the ipyregulartable authors.
#
# This file is part of the jupyterlab_templates library, distributed under the terms of
# the Apache License 2.0.  The full license can be found in the LICENSE file.
#
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

    def rowheaders(self, x0, y0, x1, y1):
        '''return column headers for data'''
        return []
        
    def columnheaders(self, x0, y0, x1, y1):
        '''return column headers for data'''
        return []

    def write(self, x, y, value):
        '''write event'''
