<p align="center">
<img src="docs/img/logo.png" width=200></img>
</p>

An [ipywidgets](https://github.com/jupyter-widgets/ipywidgets) wrapper of [regular-table](https://github.com/jpmorganchase/regular-table/blob/master/README.md) for Jupyter.

[![Build Status](https://dev.azure.com/tpaine154/jupyter/_apis/build/status/timkpaine.ipyregulartable?branchName=master)](https://dev.azure.com/tpaine154/jupyter/_build/latest?definitionId=34&branchName=master)
[![Coverage](https://img.shields.io/azure-devops/coverage/tpaine154/jupyter/34/master)](https://dev.azure.com/tpaine154/jupyter/_build?definitionId=34&_a=summary)
[![PyPI](https://img.shields.io/pypi/l/ipyregulartable.svg)](https://pypi.python.org/pypi/ipyregulartable)
[![PyPI](https://img.shields.io/pypi/v/ipyregulartable.svg)](https://pypi.python.org/pypi/ipyregulartable)
[![npm](https://img.shields.io/npm/v/ipyregulartable.svg)](https://www.npmjs.com/package/ipyregulartable)


## Two Billion Rows
![](https://raw.githubusercontent.com/timkpaine/ipyregulartable/main/docs/img/twobillion.gif)

## Installation

You can install using `pip`:

```bash
pip install ipyregulartable
```

Or if you use jupyterlab:

```bash
pip install ipyregulartable
jupyter labextension install @jupyter-widgets/jupyterlab-manager
```

If you are using Jupyter Notebook 5.2 or earlier, you may also need to enable
the nbextension:
```bash
jupyter nbextension enable --py [--sys-prefix|--user|--system] ipyregulartable
```
