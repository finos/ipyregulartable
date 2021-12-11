/******************************************************************************
 *
 * Copyright (c) 2020, the ipyregulartable authors.
 *
 * This file is part of the ipyregulartable library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
const path = require("path");

module.exports = {
  process(src, filename) {
    return `module.exports = ${JSON.stringify(path.basename(filename))};`;
  },
};
