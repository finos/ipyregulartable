# *****************************************************************************
#
# Copyright (c) 2020, the ipyregulartable authors.
#
# This file is part of the ipyregulartable library, distributed under the terms of
# the Apache License 2.0.  The full license can be found in the LICENSE file.
#
from ._version import __version__  # noqa: F401
from .nbextension import _jupyter_nbextension_paths  # noqa: F401

from .datamodel import *  # noqa: F401, F403
from .widget import RegularTableWidget  # noqa: F401
