/******************************************************************************
 *
 * Copyright (c) 2020, the ipyregulartable authors.
 *
 * This file is part of the ipyregulartable library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
import {IJupyterWidgetRegistry} from "@jupyter-widgets/base";

import {MODULE_VERSION} from "./version";

const EXTENSION_ID = "ipyregulartable";

/**
 * Activate the widget extension.
 */
function activateWidgetExtension(app, registry) {
  registry.registerWidget({
    // eslint-disable-next-line no-return-await
    exports: async () => await import(/* webpackChunkName: "ipyregulartable" */ "./widget"),
    name: "ipyregulartable",
    version: MODULE_VERSION,
  });
}

/**
 * The example plugin.
 */
const examplePlugin = {
  activate: activateWidgetExtension,
  autoStart: true,
  id: EXTENSION_ID,
  requires: [IJupyterWidgetRegistry],
};

export default examplePlugin;
