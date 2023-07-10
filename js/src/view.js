/******************************************************************************
 *
 * Copyright (c) 2020, the ipyregulartable authors.
 *
 * This file is part of the ipyregulartable library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
/* eslint-disable default-case */
/* eslint-disable no-underscore-dangle */
import {DOMWidgetView} from "@jupyter-widgets/base";
import {evaluate} from "mathjs";

import "regular-table";
import "regular-table/dist/css/material.css";

// Import the CSS
import "../style/index.css";

export class RegularTableView extends DOMWidgetView {
  table;

  resolve = undefined;

  reject = undefined;

  editable_resolve = undefined;

  editable_target = undefined;

  selected = {x: 0, y: 0};

  rows = 0;

  columns = 0;

  render() {
    this.model.on("msg:custom", this._handle_msg, this);
    this.el.classList.add("ipyregulartable");

    this.model.on("change:height", this._handle_height, this);

    this.model.on("change:styler", this._handle_styler, this);
    this.model.on("change:css", this._handle_css, this);

    this.displayed.then(() => {
      this._render();
    });
  }

  processPhosphorMessage(msg) {
    super.processPhosphorMessage(msg);
    switch (msg.type) {
      case "resize":
      case "after-show":
        if (this.pWidget.isVisible) {
          this._handle_height();
          break;
        }
    }
  }

  _handle_styler() {
    const styler = this.model.get("styler");

    this.table.addStyleListener(() => {
      let errors = "";
      let key;
      Object.keys(styler).forEach((elemkey) => {
        switch (elemkey) {
          case "table":
          case "thead":
          case "tbody":
          case "tr":
          case "th":
          case "td": {
            key = elemkey;
            break;
          }
          case "theadtr": {
            key = "thead tr";
            break;
          }
          case "theadth": {
            key = "thead th";
            break;
          }
          case "tbodytr": {
            key = "tbody tr";
            break;
          }
          case "tbodyth": {
            key = "tbody th";
            break;
          }
        }

        if (!styler[elemkey].expression) {
          return;
        }
        this.table.querySelectorAll(key).forEach((elem) => {
          let i = 0;

          while (styler[elemkey].expression[i]) {
            const meta = key !== "table" ? this.table.getMeta(elem) : {x: 0, y: 0};
            const expression = styler[elemkey].expression[i].replace(/x/g, meta.x).replace(/y/g, meta.y).replace(/data/g, `"${elem.textContent}"`);
            try {
              if (evaluate(expression)) {
                if (!elem.style.cssText) {
                  // eslint-disable-next-line no-param-reassign
                  elem.style.cssText = "";
                }

                // add new class
                // eslint-disable-next-line no-param-reassign
                elem.style.cssText += styler[elemkey].style[i];
              }
            } catch (error) {
              errors += `Expression: ${expression}\n`;
              errors += `${error}\n`;
            }
            i++;
          }
        });
      });
      if (errors !== "") {
        // eslint-disable-next-line no-console
        console.log(errors);
        this.send({event: "errors", value: errors});
      }
    });
    this.table.draw();
  }

  _handle_css() {
    const css = this.model.get("css");
    let key;
    let errors = "";
    Object.keys(css).forEach((elemkey) => {
      switch (elemkey) {
        case "table":
        case "thead":
        case "tbody":
        case "tr":
        case "th":
        case "td": {
          key = elemkey;
          break;
        }
        case "theadtr": {
          key = "thead tr";
          break;
        }
        case "theadth": {
          key = "thead th";
          break;
        }
        case "tbodytr": {
          key = "tbody tr";
          break;
        }
        case "tbodyth": {
          key = "tbody th";
          break;
        }
      }
      if (!css[elemkey]) {
        return;
      }
      if (key) {
        this.table.querySelectorAll(key).forEach((elem) => {
          try {
            // eslint-disable-next-line no-param-reassign
            elem.style.cssText = css[elemkey];
          } catch (error) {
            errors += `${error}\n`;
          }
        });
      }
    });
    this.table.draw();
    if (errors !== "") {
      // eslint-disable-next-line no-console
      console.log(errors);
      this.send({event: "errors", value: errors});
    }
  }

  _handle_data() {
    if (this.resolve !== undefined && this.model.get("_data")) {
      const data = this.model.get("_data");
      this.resolve(data);
      this.rows = data.num_rows;
      this.columns = data.num_columns;
      this.resolve = undefined;
      this.reject = undefined;
    } else {
      if (this.reject !== undefined) {
        this.reject();
      }
      this.resolve = undefined;
      this.reject = undefined;
    }
  }

  _handle_editable() {
    if (this.editable_resolve !== undefined && this.model.get("_editable")) {
      this.editable_resolve(true);
      this.editable_resolve = undefined;

      const target = this.editable_target;
      if (this.model.get("_editable") === true) {
        target.setAttribute("contenteditable", "true");

        target.addEventListener("focusout", () => {
          const meta = this.table.getMeta(target);
          if (target.getAttribute("contenteditable") === "true") {
            this.send({event: "write", value: [meta.x, meta.y, target.textContent]});
          }
          target.setAttribute("contenteditable", "false");
        });

        target.addEventListener("keydown", (event) => {
          if (event.keyCode === 13 && !event.shiftKey) {
            event.preventDefault();
            event.stopPropagation();
            const meta = this.table.getMeta(target);

            if (target.getAttribute("contenteditable") === "true") {
              this.send({event: "write", value: [meta.x, meta.y, target.textContent]});
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

  _handle_height() {
    this.el.style.height = this.model.get("height");
    this.table.style.height = this.model.get("height");
    this._handle_draw();
  }

  _handle_msg(msg) {
    if (msg.type === "draw") {
      this._handle_draw();
    } else if (msg.type === "data") {
      this._handle_data();
    } else if (msg.type === "editable") {
      this._handle_editable();
    }
  }

  _handle_draw() {
    // TODO
    this.table.draw();
  }

  _render() {
    // render a regular-table
    this.table = document.createElement("regular-table");
    this.el.appendChild(this.table);

    // hook data model into python
    this.table.setDataListener(
      (x0, y0, x1, y1) =>
        new Promise((resolve, reject) => {
          if (this.resolve !== undefined) {
            // existing outstanding promise
            if (this.reject !== undefined) {
              this.reject();
            }
            this.resolve = undefined;
            this.reject = undefined;
          }

          // send event to python
          this.resolve = resolve;
          this.reject = reject;
          this.send({event: "dataslice", value: [x0, y0, x1, y1]});
        }),
      {virtual_mode: this.model.get("virtual_mode")},
    );

    // hook in click events
    this.table.addEventListener("click", (event) => {
      const meta = this.table.getMeta(event.target);
      if (meta !== undefined) {
        this.selected.x = meta.x;
        this.selected.y = meta.y;
        this.updateFocus();
        this.send({event: "click", value: [meta.x, meta.y]});
      }
    });

    // hook edit events into python
    this.table.addEventListener("dblclick", (event) => {
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

    this.table.addEventListener("keydown", (event) => {
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

    this.table.addEventListener("keyup", (event) => {
      this.updateFocus();
      event.preventDefault();
    });
  }

  moveSelection(dx, dy) {
    const target = this.findActive();
    if (!target) {
      return;
    }

    const meta = this.table.getMeta(target);

    if (target.getAttribute("contenteditable") === "true") {
      target.setAttribute("contenteditable", "false");
    }

    const SCROLL_AHEAD = 4;

    if (dx !== 0) {
      if (meta.x + dx < this.columns && meta.x + dx >= 0) {
        this.selected.x = meta.x + dx;
      }
      if (meta.x1 <= this.selected.x + SCROLL_AHEAD) {
        this.table.scrollToCell(meta.x0 + 2, meta.y0, this.columns, this.rows);
      } else if (this.selected.x - SCROLL_AHEAD < meta.x0) {
        if (meta.x0 - 1 > 0) {
          this.table.scrollToCell(meta.x0 - 1, meta.y0, this.columns, this.rows);
        } else {
          this.table.scrollToCell(0, meta.y0, this.columns, this.rows);
        }
      }
    }

    if (dy !== 0) {
      if (meta.y + dy < this.rows && meta.y + dy >= 0) {
        this.selected.y = meta.y + dy;
      }
      if (meta.y1 <= this.selected.y + SCROLL_AHEAD) {
        this.table.scrollToCell(meta.x0, meta.y0 + 1, this.columns, this.rows);
      } else if (this.selected.y - SCROLL_AHEAD + 2 < meta.y0) {
        if (meta.y0 - 1 > 0) {
          this.table.scrollToCell(meta.x0, meta.y0 - 1, this.columns, this.rows);
        } else {
          this.table.scrollToCell(meta.x0, 0, this.columns, this.rows);
        }
      }
    }
  }

  findActive() {
    const tds = this.table.querySelectorAll("td");
    let ret;
    tds.forEach((td) => {
      const meta = this.table.getMeta(td);
      if (meta.x === this.selected.x && meta.y === this.selected.y) {
        ret = td;
      }
    });
    return ret;
  }

  updateFocus() {
    const tds = this.table.querySelectorAll("td");
    tds.forEach((td) => {
      const meta = this.table.getMeta(td);
      if (meta.x === this.selected.x && meta.y === this.selected.y) {
        td.focus();
        td.classList.add("highlight");
      } else {
        td.classList.remove("highlight");
      }
    });
  }
}
