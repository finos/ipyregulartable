/******************************************************************************
 *
 * Copyright (c) 2020, the ipyregulartable authors.
 *
 * This file is part of the ipyregulartable library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
module.exports = {
  transform: {
      "^.+\\.ts?$": "ts-jest",
      "^.+\\.js$": "babel-jest",
      ".+\\.(css|styl|less|sass|scss)$": "jest-transform-css"
  },
  "moduleNameMapper":{
       "\\.(css|less|sass|scss)$": "<rootDir>/tests/styleMock.js",
       "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$": "<rootDir>/tests/fileMock.js"
  },
  preset: 'ts-jest',
  "transformIgnorePatterns": [
    "/node_modules/(?!@jupyter*)",
  ]
};
