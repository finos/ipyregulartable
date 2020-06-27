/* eslint-disable @typescript-eslint/explicit-function-return-type */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/unbound-method */
import {DOMWidgetView} from "@jupyter-widgets/base";
import "regular-table";
import "regular-table/dist/css/material.css";


// Import the CSS
import "../css/widget.css";


export
class RegularTableView extends DOMWidgetView {
  public table: any;

  public render(): void {
    this.model.on("msg:custom", this._handle_message, this);
    this.el.classList.add("ipyregulartable");
    this._render();
  }

  public _handle_message(msg: any): void {
  }

  async public _getDataSlice(x0, y0, x1, y1): any {
    
  }

  public _render(): void {
    this.table = document.createElement("regular-table");
    this.el.appendChild(this.table);
  }
}
