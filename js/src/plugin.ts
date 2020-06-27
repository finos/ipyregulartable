import {
  Application, IPlugin,
} from "@lumino/application";

import {
  Widget,
} from "@lumino/widgets";

import {
  IJupyterWidgetRegistry,
} from "@jupyter-widgets/base";

import * as widgetExports from "./widget";

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
    exports: widgetExports,
    name: "ipyregulartable",
    version: MODULE_VERSION,
  });
}
