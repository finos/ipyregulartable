<p align="center">
<img src="docs/img/logo.png" width=200></img>
</p>

<p align="center">
<a href="https://dev.azure.com/tpaine154/jupyter/_build/latest?definitionId=35&branchName=main"><img alt="Build Status" src="https://dev.azure.com/tpaine154/jupyter/_apis/build/status/timkpaine.ipyregulartable?branchName=main"></a>
<a href="https://dev.azure.com/tpaine154/jupyter/_build?definitionId=35&_a=summary"><img alt="Coverage" src="https://img.shields.io/azure-devops/coverage/tpaine154/jupyter/35/main"></a>
<a href="https://pypi.python.org/pypi/ipyregulartable"><img alt="PyPI Version" src="https://img.shields.io/pypi/v/ipyregulartable.svg?color=brightgreen&style=flat-square"></a>
<a href="https://www.npmjs.com/package/regular-table"><img alt="NPM Version" src="https://img.shields.io/npm/v/ipyregulartable.svg?color=brightgreen&style=flat-square"></a>
<a href="https://github.com/jpmorganchase/ipyregulartable"><img alt="License" src="https://img.shields.io/github/license/jpmorganchase/ipyregulartable?color=brightgreen&style=flat-square"></a>
</p>

# 

An [ipywidgets](https://github.com/jupyter-widgets/ipywidgets) wrapper of [regular-table](https://github.com/jpmorganchase/regular-table) for Jupyter.


## Examples
### Two Billion Rows
[Notebook](https://raw.githubusercontent.com/jpmorganchase/ipyregulartable/main/docs/examples/two_billion.ipynb)

![](https://raw.githubusercontent.com/jpmorganchase/ipyregulartable/main/docs/img/twobillion.gif)

### Click Events
[Notebook](https://raw.githubusercontent.com/jpmorganchase/ipyregulartable/main/docs/examples/click_events.ipynb)

![](https://raw.githubusercontent.com/jpmorganchase/ipyregulartable/main/docs/img/click_events.gif)

### Edit Events
[Notebook](https://raw.githubusercontent.com/jpmorganchase/ipyregulartable/main/docs/examples/edit_events.ipynb)

![](https://raw.githubusercontent.com/jpmorganchase/ipyregulartable/main/docs/img/edit_events.gif)

### Styling
[Notebook](https://raw.githubusercontent.com/jpmorganchase/ipyregulartable/main/docs/examples/styling.ipynb)

![](https://raw.githubusercontent.com/jpmorganchase/ipyregulartable/main/docs/img/style.gif)

### Pandas Data Model
For interactive/streaming sorting/pivoting/aggregation, take a look at [Perspective](https://github.com/finos/perspective), *Streaming pivot visualization via WebAssembly*, which also leverages [`regular-table`](https://github.com/jpmorganchase/regular-table).

[Notebook](https://raw.githubusercontent.com/jpmorganchase/ipyregulartable/main/docs/examples/pandas.ipynb)

#### Series
![](https://raw.githubusercontent.com/jpmorganchase/ipyregulartable/main/docs/img/pd_series.png)

#### DataFrame
![](https://raw.githubusercontent.com/jpmorganchase/ipyregulartable/main/docs/img/pd_df.png)

#### DataFrame - Row Pivots
![](https://raw.githubusercontent.com/jpmorganchase/ipyregulartable/main/docs/img/pd_rpivot.png)

#### DataFrame - Column Pivots
![](https://raw.githubusercontent.com/jpmorganchase/ipyregulartable/main/docs/img/pd_cpivot.png)

#### DataFrame - Pivot Table
![](https://raw.githubusercontent.com/jpmorganchase/ipyregulartable/main/docs/img/pd_pt.png)

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


## Development

See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.


## License

This software is licensed under the Apache 2.0 license. See the
[LICENSE](LICENSE) and [AUTHORS](AUTHORS) files for details.
