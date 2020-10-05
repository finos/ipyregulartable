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
  public loadData: any;
  public isEditable: any;

  public render(): void {
    this.model.on("msg:custom", this._handle_msg, this);
    this.el.classList.add("ipyregulartable");
    this.el.style.height = `${this.model.get("height")}px`;

    this.model.on("change:height", this._handle_height, this);
    this.model.on("change:_data", this._handle_data, this);
    this.model.on("change:_editable", this._handle_editable, this);

    this.displayed.then(() => {
      this._render();
    });
  }

  public _handle_data(): void {
    if (this.loadData !== undefined) {
      this.loadData(this.model.get("_data"));
    }
  }

  public _handle_editable(): void {
    if (this.isEditable !== undefined) {
      this.isEditable(this.model.get("_editable"));
    }
  }

  public _handle_height(): void {
    this.el.style.height = `${this.model.get("height")}px`;
  }

  public _handle_msg(msg: any): void {
    if (msg.type === "draw") {
      this._handle_draw();
    }
  }

  public _handle_draw(): void {
    // TODO
    this.table.draw();
  }

  public _render(): void {
    // render a regular-table
    this.table = document.createElement("regular-table");
    this.el.appendChild(this.table);

    // hook data model into python
    this.table.setDataListener((x0: number, y0: number, x1: number, y1: number) => {
      new Promise((resolve) => {
        // send event to python
        this.send({event: "getDataSlice", value: [x0, y0, x1, y1]});
        this.loadData = resolve;
      });
    });

    // hook in click events
    this.table.addEventListener("click", (event: MouseEvent) => {
      const meta = this.table.getMeta(event.target);
      if (meta) {
        this.send({event: "click", value: [meta.x, meta.y]});
      }
    });

    // hook edit events into python
    this.table.addEventListener("click", (event: MouseEvent) => {
      const meta = this.table.getMeta(event.target);
      if (meta) {
        return new Promise((resolve) => {
          // send event to python
          this.send({event: "getEditable", value: [meta.x, meta.y]});
          this.isEditable = (target=event.target) => {
            if (this.model.get("_editable") === true){
              (target as HTMLElement).setAttribute("contenteditable", "true");
            }
            resolve();
          };
        });
      }
    });

    this.table.draw();
  }


}