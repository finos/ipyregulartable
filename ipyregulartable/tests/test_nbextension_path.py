# *****************************************************************************
#
# Copyright (c) 2020, the ipyregulartable authors.
#
# This file is part of the jupyterlab_templates library, distributed under the terms of
# the Apache License 2.0.  The full license can be found in the LICENSE file.
#


def test_nbextension_path():
    # Check that magic function can be imported from package root:
    from ipyregulartable import _jupyter_nbextension_paths
    # Ensure that it can be called without incident:
    path = _jupyter_nbextension_paths()
    # Some sanity checks:
    assert len(path) == 1
    assert isinstance(path[0], dict)
