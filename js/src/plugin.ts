/******************************************************************************
 *
 * Copyright (c) 2020, the ipyregulartable authors.
 *
 * This file is part of the jupyterlab_templates library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
import {
  Application, IPlugin,
} from "@lumino/application";

import {
  Widget,
} from "@lumino/widgets";

import {
  IJupyterWidgetRegistry,
} from "@jupyter-widgets/base";


import {
  MODULE_VERSION,
} from "./version";

const EXTENSION_ID = "ipyregulartable";

/**
 * The example plugin.
 */
const examplePlugin: IPlugin<Application<Widget>, void> = {
  activate: activateWidgetExtension,
  autoStart: true,
  id: EXTENSION_ID,
  requires: [IJupyterWidgetRegistry],
};

export default examplePlugin;


/**
 * Activate the widget extension.
 */
function activateWidgetExtension(app: Application<Widget>, registry: IJupyterWidgetRegistry): void {
  registry.registerWidget({
    exports: async () => await import(/* webpackChunkName: "ipyregulartable" */ "./widget"),
    name: "ipyregulartable",
    version: MODULE_VERSION,
  });
}
