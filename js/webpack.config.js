/******************************************************************************
 *
 * Copyright (c) 2020, the ipyregulartable authors.
 *
 * This file is part of the ipyregulartable library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
const path = require("path");
const {version} = require("./package.json");

// Custom webpack rules
const rules = [
  {test: /\.ts$/, loader: "babel-loader"},
  {test: /\.js$/, loader: "source-map-loader"},
  {test: /\.css$/, use: ["style-loader", "css-loader"]},
];

// Packages that shouldn't be bundled but loaded at runtime
const externals = ["@jupyter-widgets/base"];

const resolve = {
  // Add '.ts' and '.tsx' as resolvable extensions.
  extensions: [".webpack.js", ".web.js", ".js"],
};

module.exports = [
  /**
   * Notebook extension
   *
   * This bundle only contains the part of the JavaScript that is run on load of
   * the notebook.
   */
  {
    entry: "./src/extension.js",
    output: {
      filename: "index.js",
      path: path.resolve(__dirname, "..", "ipyregulartable", "nbextension", "static"),
      libraryTarget: "amd",
    },
    module: {
      rules,
    },
    devtool: "source-map",
    externals,
    resolve,
  },
  {
    // Bundle for the notebook containing the custom widget views and models
    //
    // This bundle contains the implementation for the custom widget views and
    // custom widget.
    // It must be an amd module
    //
    entry: "./lib/index.js",
    devtool: "source-map",
    resolve,
    output: {
      filename: "index.js",
      path: path.resolve(__dirname, "..", "ipyregulartable", "nbextension", "static"),
      libraryTarget: "amd",
    },
    module: {
      rules,
    },
    externals: ["@jupyter-widgets/base"],
  },
  /**
   * Embeddable ipyregulartable bundle
   *
   * This bundle is almost identical to the notebook extension bundle. The only
   * difference is in the configuration of the webpack public path for the
   * static assets.
   *
   * The target bundle is always `dist/index.js`, which is the path required by
   * the custom widget embedder.
   */
  {
    entry: "./src/index.js",
    output: {
      filename: "index.js",
      path: path.resolve(__dirname, "dist"),
      libraryTarget: "amd",
      library: "ipyregulartable",
      publicPath: `https://unpkg.com/ipyregulartable@${version}/dist/`,
    },
    devtool: "source-map",
    module: {
      rules,
    },
    externals,
    resolve,
  },
];
