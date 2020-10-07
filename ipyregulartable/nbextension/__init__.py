# *****************************************************************************
#
# Copyright (c) 2020, the ipyregulartable authors.
#
# This file is part of the jupyterlab_templates library, distributed under the terms of
# the Apache License 2.0.  The full license can be found in the LICENSE file.
#


def _jupyter_nbextension_paths():
    return [{
        'section': 'notebook',
        'src': 'nbextension/static',
        'dest': 'ipyregulartable',
        'require': 'ipyregulartable/extension'
    }]
