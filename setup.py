# *****************************************************************************
#
# Copyright (c) 2020, the ipyregulartable authors.
#
# This file is part of the ipyregulartable library, distributed under the terms of
# the Apache License 2.0.  The full license can be found in the LICENSE file.
#
from codecs import open
from os import path

from jupyter_packaging import (
    combine_commands,
    create_cmdclass,
    ensure_targets,
    get_version,
    install_npm,
)
from setuptools import find_packages, setup

pjoin = path.join
name = "ipyregulartable"
here = path.abspath(path.dirname(__file__))
jshere = path.abspath(pjoin(path.dirname(__file__), "js"))
version = get_version(pjoin(here, name, "_version.py"))

with open(path.join(here, "README.md"), encoding="utf-8") as f:
    long_description = f.read().replace("\r\n", "\n")

requires = [
    "ipywidgets>=7.5.1",
    "numpy",
    "pandas>=0.22",
]

requires_dev = requires + [
    "black>=20.8b1",
    "bump2version>=1.0.0",
    "flake8>=3.7.8",
    "flake8-black>=0.2.1",
    "jupyter_packaging",
    "mock",
    "pytest>=4.3.0",
    "pytest-cov>=2.6.1",
    "Sphinx>=1.8.4",
    "sphinx-markdown-builder>=0.5.2",
]

nb_path = pjoin(here, name, "nbextension", "static")
lab_path = pjoin(here, name, "labextension")

# Representative files that should exist after a successful build
jstargets = [
    pjoin(jshere, "lib", "index.js"),
]

package_data_spec = {name: ["nbextension/static/*.*js*", "labextension/*.tgz"]}

data_files_spec = [
    ("share/jupyter/nbextensions/ipyregulartable", nb_path, "*.js*"),
    ("share/jupyter/lab/extensions", lab_path, "*.tgz"),
    ("etc/jupyter/nbconfig/notebook.d", here, "ipyregulartable.json"),
]


cmdclass = create_cmdclass(
    "jsdeps", package_data_spec=package_data_spec, data_files_spec=data_files_spec
)
cmdclass["jsdeps"] = combine_commands(
    install_npm(jshere, build_cmd="build:all"),
    ensure_targets(jstargets),
)


setup(
    name=name,
    version=version,
    description="ipywidgets wrapper around regular-table",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/jpmorganchase/ipyregulartable",
    author="Tim Paine",
    author_email="t.paine154@gmail.com",
    license="Apache 2.0",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Framework :: Jupyter",
    ],
    platforms="Linux, Mac OS X, Windows",
    keywords=[
        "Jupyter",
        "Jupyterlab",
        "Widgets",
        "IPython",
        "Table",
        "Grid",
        "Datagrid",
    ],
    cmdclass=cmdclass,
    packages=find_packages(
        exclude=[
            "tests",
        ]
    ),
    install_requires=requires,
    extras_require={
        "dev": requires_dev,
    },
    include_package_data=True,
    data_files=[
        (
            "share/jupyter/nbextensions/ipyregulartable",
            [
                "ipyregulartable/nbextension/static/extension.js",
                "ipyregulartable/nbextension/static/index.js",
                "ipyregulartable/nbextension/static/index.js.map",
            ],
        ),
        ("etc/jupyter/nbconfig/notebook.d", ["ipyregulartable.json"]),
    ],
    zip_safe=False,
    python_requires=">=3.7",
)
