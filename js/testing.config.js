/******************************************************************************
 *
 * Copyright (c) 2021, the ipyregulartable authors.
 *
 * This file is part of the ipyregulartable library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
 const path = require('path');
 const HtmlWebpackPlugin = require('html-webpack-plugin');
 
 // Custom webpack rules
 const rules = [
   { test: /\.js(x?)$/, loader: 'babel-loader' },
   { test: /\.less$/, use: ['css-loader', 'less-loader']},
   { test: /\.css$/, use: ['css-loader']}
 ];
 
 const resolve = {
   extensions: [".js", ".jsx"]
 };
 
 module.exports = [
   {
     mode: "development",
     entry: './src/testing.js',
     output: {
       filename: 'index.js',
       path: path.resolve(__dirname, "dist", "testing"),
       libraryTarget: 'umd'
     },
     plugins: [
        new HtmlWebpackPlugin({
          title: 'Development',
        }),
      ],
     module: {
       rules: rules
     },
     devtool: 'inline-source-map',
     devServer: {
       contentBase: "./dist/testing",
       watchContentBase: true,
       port: process.env.PORT || 9993,
     },
     resolve,
   },
 ];
 