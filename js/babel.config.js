/******************************************************************************
 *
 * Copyright (c) 2020, the ipyregulartable authors.
 *
 * This file is part of the ipyregulartable library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */

module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          chrome: "70",
          ios: "13",
        },
      },
    ],
  ],
  sourceType: "unambiguous",
  sourceMaps: true,
};