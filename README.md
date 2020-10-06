<p align="center">
<img src="docs/img/logo.png" width=200></img>
</p>

<p align="center">
<a href="https://dev.azure.com/tpaine154/jupyter/_build/latest?definitionId=34&branchName=master"><img alt="Build Status" src="https://dev.azure.com/tpaine154/jupyter/_apis/build/status/timkpaine.ipyregulartable?branchName=master"></a>
<a href="https://dev.azure.com/tpaine154/jupyter/_build?definitionId=34&_a=summary"><img alt="Coverage" src="https://img.shields.io/azure-devops/coverage/tpaine154/jupyter/34/master"></a>

<a href="https://pypi.python.org/pypi/ipyregulartable"><img alt="PyPI Version" src="https://img.shields.io/pypi/v/ipyregulartable.svg?color=brightgreen&style=flat-square"></a>
<a href="https://www.npmjs.com/package/regular-table"><img alt="NPM Version" src="https://img.shields.io/npm/v/ipyregulartable.svg?color=brightgreen&style=flat-square"></a>

<a href="https://github.com/timkpaine/ipyregulartable"><img alt="License" src="https://img.shields.io/github/license/timkpaine/ipyregulartable?color=brightgreen&style=flat-square"></a>
</p>

# 

An [ipywidgets](https://github.com/jupyter-widgets/ipywidgets) wrapper of [regular-table](https://github.com/jpmorganchase/regular-table/blob/master/README.md) for Jupyter.



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
