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

  public resolve: any = undefined;
  public reject: any = undefined;

  public editable_resolve: any = undefined;
  public editable_target: any = undefined;

  public selected = {x: 0, y: 0};
  public rows = 0;
  public columns = 0;


  public render(): void {
    this.model.on("msg:custom", this._handle_msg, this);
    this.el.classList.add("ipyregulartable");
    this.el.style.height = `${this.model.get("height")}px`;

    this.model.on("change:height", this._handle_height, this);
    // this.model.on("change:_data", this._handle_data, this);
    // this.model.on("change:_editable", this._handle_editable, this);

    this.displayed.then(() => {
      this._render();
      this.table.draw();
    });
  }

  public _handle_data(): void {
    if (this.resolve !== undefined && this.model.get("_data")) {
      const data = this.model.get("_data");
      this.resolve(data);
      this.rows = data.num_rows;
      this.columns = data.num_columns;
      this.resolve = undefined;
      this.reject = undefined;
    } else {
      this.reject();
      this.resolve = undefined;
      this.reject = undefined;
    }
  }

  public _handle_editable(): void {
    if (this.editable_resolve !== undefined && this.model.get("_editable")) {
      this.editable_resolve(true);
      this.editable_resolve = undefined;

      const target = this.editable_target;
      if (this.model.get("_editable") === true){
        target.setAttribute("contenteditable", "true");

        target.addEventListener("focusout", () => {
          const meta = this.table.getMeta(target);
          if (target.getAttribute("contenteditable") === "true"){
            this.send({event: "write",
              value: [meta.x, meta.y, target.textContent],
            });
          }
          target.setAttribute("contenteditable", "false");
        });

        target.addEventListener("keydown", (event: KeyboardEvent) => {
          if (event.keyCode === 13 && !event.shiftKey) {
            event.preventDefault();
            event.stopPropagation();
            const meta = this.table.getMeta(target);

            if (target.getAttribute("contenteditable") === "true"){
              this.send({event: "write",
                value: [meta.x, meta.y, target.textContent],
              });
            }
            target.setAttribute("contenteditable", "false");
          }
        });
      }

      this.editable_target = undefined;

    } else {
      this.editable_resolve(false);
      this.editable_resolve = undefined;
      this.editable_target = undefined;
    }
  }

  public _handle_height(): void {
    this.el.style.height = `${this.model.get("height")}px`;
    this._handle_draw();
  }

  public _handle_msg(msg: any): void {
    if (msg.type === "draw") {
      this._handle_draw();
    } else if (msg.type === "data") {
      this._handle_data();
    } else if (msg.type === "editable") {
      this._handle_editable();
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
    this.table.setDataListener((x0: number, y0: number, x1: number, y1: number) => new Promise((resolve, reject) => {
      if (this.resolve !== undefined) {
        // existing outstanding promise
        this.reject();
        this.resolve = undefined;
        this.reject = undefined;
      }

      // send event to python
      this.resolve = resolve;
      this.reject = reject;
      this.send({event: "dataslice", value: [x0, y0, x1, y1]});
    }));

    // hook in click events
    this.table.addEventListener("click", (event: MouseEvent) => {
      const meta = this.table.getMeta(event.target);
      this.selected.x = meta.x;
      this.selected.y = meta.y;
      this.updateFocus();
      this.send({event: "click", value: [meta.x, meta.y]});
    });

    // hook edit events into python
    this.table.addEventListener("dblclick", (event: MouseEvent) => {
      const meta = this.table.getMeta(event.target);
      event.preventDefault();
      event.stopPropagation();
      return new Promise((resolve) => {

        if (this.editable_resolve !== undefined) {
          // existing outstanding promise
          this.editable_resolve(false);
          this.editable_resolve = undefined;
          this.editable_target = undefined;
        }

        this.editable_resolve = resolve;
        this.editable_target = event.target;

        // send event to python
        this.send({event: "editable", value: [meta.x, meta.y]});
      });
    });

    this.table.addEventListener("keydown", (event: KeyboardEvent) => {
      switch (event.keyCode) {
      // tab
      case 9:
        event.preventDefault();
        if (event.shiftKey) {
          this.moveSelection(-1, 0);
        } else {
          this.moveSelection(1, 0);
        }
        break;
        // left arrow
      case 37:
        event.preventDefault();
        this.moveSelection(-1, 0);
        break;
        // up arrow
      case 38:
        event.preventDefault();
        this.moveSelection(0, -1);
        break;
        // right arrow
      case 39:
        event.preventDefault();
        this.moveSelection(1, 0);
        break;
        // down arrow
      case 40:
        event.preventDefault();
        this.moveSelection(0, 1);
        break;
      }
    });

    this.table.addEventListener("keyup", (event: KeyboardEvent) => {
      this.updateFocus();
      event.preventDefault();
    });
  }

  public moveSelection(dx: number, dy: number) {
    const target = this.findActive();
    if (!target){
      return;
    }

    const meta = this.table.getMeta(target);

    if (target.getAttribute("contenteditable") === "true"){
      target.setAttribute("contenteditable", "false");
    }

    const SCROLL_AHEAD = 4;

    if (dx !== 0) {
      if (meta.x + dx < this.columns && 0 <= meta.x + dx) {
        this.selected.x = meta.x + dx;
      }
      if (meta.x1 <= this.selected.x + SCROLL_AHEAD) {
        this.table.scrollToCell(meta.x0 + 2, meta.y0, this.columns, this.rows);
      } else if (this.selected.x - SCROLL_AHEAD < meta.x0) {
        if (0 < meta.x0 - 1) {
          this.table.scrollToCell(meta.x0 - 1, meta.y0, this.columns, this.rows);
        } else {
          this.table.scrollToCell(0, meta.y0, this.columns, this.rows);
        }
      }
    }

    if (dy !== 0) {
      if (meta.y + dy < this.rows && 0 <= meta.y + dy) {
        this.selected.y = meta.y + dy;
      }
      if (meta.y1 <= this.selected.y + SCROLL_AHEAD) {
        this.table.scrollToCell(meta.x0, meta.y0 + 1, this.columns, this.rows);
      } else if (this.selected.y - SCROLL_AHEAD + 2 < meta.y0) {
        if (0 < meta.y0 - 1) {
          this.table.scrollToCell(meta.x0, meta.y0 - 1, this.columns, this.rows);
        } else {
          this.table.scrollToCell(meta.x0, 0, this.columns, this.rows);
        }
      }
    }
  }

  public findActive() {
    const tds = this.table.querySelectorAll("td");
    for (const td of tds) {
      const meta = this.table.getMeta(td);
      if (meta.x === this.selected.x && meta.y === this.selected.y) {
        return td;
      }
    }
  }

  public updateFocus() {
    const tds = this.table.querySelectorAll("td");
    for (const td of tds) {
      const meta = this.table.getMeta(td);
      if (meta.x === this.selected.x && meta.y === this.selected.y) {
        td.focus();
        td.classList.add("highlight");
      } else {
        td.classList.remove("highlight");
      }
    }
  }

}
