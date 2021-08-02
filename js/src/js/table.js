import "regular-table";
import css from "../less/index.less";

const ELEMENT_NAME = "regular-table-extras";

const _ar = new Array(26).fill(0);

const DATA = [
  _ar.map((val, index) => index),
  "QWERTYUIOPASDFGHJKLZXCVBNM",
  _ar.map(() => Math.random() > 0.5),
  _ar.map(() => Math.random()),
  "QWERTYUIOPASDFGHJKLZXCVBNM",
  _ar.map(() => Math.random() > 0.5),
  _ar.map(() => Math.random()),
];

function getDataSlice(x0, y0, x1, y1) {
  console.log(x0, y0, x1, y1);
  return {
    num_rows: DATA[0].length,
    num_columns: DATA.length,
    row_headers: DATA[0].map((rec) => [`Row ${rec}`]),
    column_headers: [1, 2, 3, 4, 5, 6, 7].map((rec) => [`Col ${rec}`]),
    data: DATA.slice(x0, x1).map((col) => col.slice(y0, y1)),
  };
}

const DEFAULT_CONFIG = {
  // stripes
  ODD_STRIPE: "stripes",
  EVEN_STRIPE: "reverse-stripes",

  // cursor
  CURSOR: "cursor",

  // selection
  SELECTION: "mouse-selected-area",

  // SCROLL
  SCROLL_AHEAD: 4,
};

const KEYCODES = {
  ENTER: 13,
  TAB: 9,

  ESC: 27,
  BACKSPACE: 8,
  DELETE: 46,

  ALT: 18,
  CTRL: 17,
  META: 91,
  // METARIGHT: 93

  // arrows
  LEFT: 37,
  RIGHT: 39,
  UP: 38,
  DOWN: 40,
};
export class TableElement extends HTMLElement {
  constructor() {
    super();
    // create main element
    this.createMountpoint();

    // inject CSS into shadow dom
    this.injectCSS();

    // setup state tracking
    // position of the cursor
    this.state = {};
    this.state.cursor = {};
    this.state.editing = {
      active: {},
      target: null,
      original: null,
    };
    this.state.selection = {};
    this.state.selections = [];

    // setup config
    this.config = JSON.parse(
      this.getAttribute("config") || JSON.stringify(DEFAULT_CONFIG)
    );

    // FIXME
    this.num_rows = DATA[0].length;
    this.num_columns = DATA.length;
  }

  createMountpoint() {
    this.shadow = this.attachShadow({ mode: "open" });
    this.mountPoint = document.createElement("div");
    this.mountPoint.classList.add("table-mountpoint");
    this.shadow.appendChild(this.mountPoint);
  }

  injectCSS() {
    const style = document.createElement("style");
    this.styleMount = style;
    style.innerHTML = `${css}`;
    this.shadow.appendChild(style);
  }

  connectedCallback() {
    // create regular-table element
    this.table = document.createElement("regular-table");

    // attach to DOM
    this.mountPoint.appendChild(this.table);

    // set data listener
    this.table.setDataListener(getDataSlice);

    // render
    this.table.draw();

    // setup renderers
    this.table.addStyleListener(this.styleListener.bind(this));

    // event listeners
    this.table.addEventListener("click", this.handleClick.bind(this));
    this.table.addEventListener("dblclick", this.handleDblClick.bind(this));
    this.table.addEventListener("mousedown", this.handleMousedown.bind(this));
    this.table.addEventListener("mouseover", this.handleMouseover.bind(this));
    this.table.addEventListener("mouseup", this.handleMouseup.bind(this));
    this.table.addEventListener("keydown", this.handleKeydown.bind(this));
  }

  styleListener() {
    if (this.getAttribute("stripes")) {
      this.stripes();
    }
  }

  handleClick(event) {
    const meta = this.table.getMeta(event.target);

    if (this.getAttribute("cursor") && meta) {
      this.moveCursor(meta);
    } else {
      this.state.cursor = {};
    }
    this.updateFocus();
  }

  handleDblClick(event) {
    const target = event.target;
    const meta = this.table.getMeta(target);

    // stop propagation
    event.preventDefault();
    event.stopPropagation();

    // if allowing editing
    // TODO per column/row
    if (meta && this.getAttribute("editable")) {
      // update cursor
      this.moveCursor(meta);

      // set editing and track original value
      this.state.editing.active = { x: meta.x, y: meta.y };
      console.log("here1");
      this.state.editing.target = target;
      this.state.editing.original = target.textContent;

      // allow editable
      target.setAttribute("contenteditable", true);

      // write on loss of focus
      // only one, so dont do this:
      //   target.addEventListener("focusout", (focusOutEvent) => {
      target.onfocusout = (focusOutEvent) => {
        // stop event propagation
        focusOutEvent.preventDefault();
        focusOutEvent.stopPropagation();

        // TODO fire write
        this.doneEditing();
      };
    } else {
      this.state.cursor = {};
      this.doneEditing();
    }
    this.updateFocus();
  }

  isEditing(meta) {
    return (
      meta &&
      meta.x === this.state.editing.active.x &&
      meta.y === this.state.editing.active.y
    );
  }

  /**
   * Turn off `contenteditable` and either fire write
   * or restore old value
   * @param {boolean} restore
   */
  doneEditing(restore) {
    if (restore) {
      // restore original content
      this.state.editing.target.textContent = this.state.editing.original;
    }

    // TODO fire final write

    // disable editing
    this.state.editing.target.removeAttribute("contenteditable");

    // blank out state
    this.state.editing.active = {};
    this.state.editing.target = null;
    this.state.editing.original = null;
  }

  handleMousedown(event) {
    const meta = this.table.getMeta(event.target);

    // handle edits in flight
    if (this.isEditing(meta)) {
      // TODO fire write
      this.doneEditing();
    }

    // remove current selection start
    this.state.selection = {};

    // if selection allowed
    if (this.getAttribute("selection")) {
      // if sensible for selection
      if (meta && meta.x !== undefined && meta.y !== undefined) {
        this.state.selection = {
          x: meta.x,
          y: meta.y,
        };
      }

      // blank out existing selections unless ctrl
      if (!event.ctrlKey && !event.metaKey) {
        this.state.selections = [];
      }
    }
  }

  handleKeydown(event) {
    const meta = this.table.getMeta(event.target);

    //   event.preventDefault();
    //   event.stopPropagation();
    if (this.isEditing(meta)) {
      if (event.keyCode === KEYCODES.ENTER && !event.shiftKey) {
        event.preventDefault();
        event.stopPropagation();
        this.doneEditing();
      } else if (event.keyCode === KEYCODES.ESC) {
        event.preventDefault();
        event.stopPropagation();
        // restore prior state
        this.doneEditing(true);
      } else {
        // TODO fire write
      }
    }
    console.log(event.keyCode);
    // handle cursor moves, etc
    switch (event.keyCode) {
      // tab
      case KEYCODES.TAB:
        event.preventDefault();
        if (event.shiftKey) {
          this.moveSelection(-1, 0);
        } else {
          this.moveSelection(1, 0);
        }
        break;
      // left arrow
      case KEYCODES.LEFT:
        event.preventDefault();
        this.moveSelection(-1, 0);
        break;
      // up arrow
      case KEYCODES.UP:
        event.preventDefault();
        this.moveSelection(0, -1);
        break;
      // right arrow
      case KEYCODES.RIGHT:
        event.preventDefault();
        this.moveSelection(1, 0);
        break;
      // down arrow
      case KEYCODES.DOWN:
        event.preventDefault();
        this.moveSelection(0, 1);
        break;
    }
    this.updateFocus();
  }

  handleMouseover(event) {
    // mouse selection
    if (this.state.selection && this.state.selection.x !== undefined) {
      const meta = this.table.getMeta(event.target);

      if (meta && meta.x !== undefined && meta.y !== undefined) {
        this.selectArea(this.state.selections.concat([this.getSelection(meta)]));
      }
    }
  }

  getSelection(meta) {
    return {
      x0: Math.min(meta.x, this.state.selection.x),
      x1: Math.max(meta.x, this.state.selection.x),
      y0: Math.min(meta.y, this.state.selection.y),
      y1: Math.max(meta.y, this.state.selection.y),
    };
  }

  handleMouseup(event) {
    const meta = this.table.getMeta(event.target);

    if (
      this.state.selection &&
      this.state.selection.x !== undefined &&
      meta.x !== undefined &&
      meta.y !== undefined
    ) {
      this.state.selections.push(this.getSelection(meta));
      this.selectArea();
    }

    this.state.selection = {};
  }

  selectArea(selections) {
    const tds = this.table.querySelectorAll("tbody td");
    const tdsToHighlight = new Set();

    (selections || this.state.selections).forEach(({ x0, x1, y0, y1 }) => {
      if ([x0, x1, y0, y1].every((val) => val !== undefined)) {
        for (const td of tds) {
          const meta = this.table.getMeta(td);
          if (x0 <= meta.x && meta.x <= x1 && y0 <= meta.y && meta.y <= y1 && (x0 !== x1 || y0 !== y1)) {
            tdsToHighlight.add(td);
          }
        }
      }
    });

    tds.forEach((td) => {
      if (tdsToHighlight.has(td)) {
        td.classList.add(this.config.SELECTION);
      } else {
        td.classList.remove(this.config.SELECTION);
      }
    });
  }

  updateFocus() {
    if (this.state.cursor) {
      const tds = this.table.querySelectorAll("td");
      for (const td of tds) {
        const meta = this.table.getMeta(td);
        if (meta.x === this.state.cursor.x && meta.y === this.state.cursor.y) {
          td.focus();
          td.classList.add(this.config.CURSOR);
        } else {
          td.classList.remove(this.config.CURSOR);
        }
      }
    }
  }

  stripes() {
    // grab td
    const tds = this.table.querySelectorAll("tbody tr:nth-of-type(1) td");
    const meta = this.table.getMeta(tds[0]);

    // check if even or odd row, flip back and forth
    // based on what is in view
    if (meta.y0 % 2 === 0) {
      this.table.classList.remove(this.config.ODD_STRIPE);
      this.table.classList.add(this.config.EVEN_STRIPE);
    } else {
      this.table.classList.remove(this.config.EVEN_STRIPE);
      this.table.classList.add(this.config.ODD_STRIPE);
    }
  }

  moveCursor({x, y} = {}) {
    if (x !== undefined) {
      this.state.cursor.x = x;
    }
    if (y !== undefined) {
      this.state.cursor.y = y;
    }
    console.log("here");
    console.log(this.state.selection);
    console.log(this.state.selection.x);
    if (this.state.selection && this.state.selection.x !== undefined) {
      this.selectArea(this.state.selections.concat([this.getSelection(this.state.cursor)]));
    }

  }

  findActive({x, y} = {}) {
    x = x !== undefined ? x : this.state.cursor.x;
    y = y !== undefined ? y : this.state.cursor.y;

    const tds = this.table.querySelectorAll("td");
    for (const td of tds) {
      const meta = this.table.getMeta(td);
      if (meta.x === x && meta.y === y) {
        return td;
      }
    }
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

    if (dx !== 0) {
      // move cursor
      if (meta.x + dx < this.num_columns && 0 <= meta.x + dx) {
        this.moveCursor({x: meta.x + dx});
      }

      // scroll
      if (meta.x1 <= this.state.cursor.x + this.config.SCROLL_AHEAD) {
        this.table.scrollToCell(meta.x0 + 2, meta.y0, this.num_columns, this.num_rows);
      } else if (this.state.cursor.x - this.config.SCROLL_AHEAD < meta.x0) {
        if (0 < meta.x0 - 1) {
          this.table.scrollToCell(
            meta.x0 - 1,
            meta.y0,
            this.num_columns,
            this.num_rows
          );
        } else {
          this.table.scrollToCell(0, meta.y0, this.num_columns, this.num_rows);
        }
      }
    }

    if (dy !== 0) {
      // move cursor
      if (meta.y + dy < this.num_rows && 0 <= meta.y + dy) {
        this.moveCursor({y: meta.y + dy});
      }

      // scroll
      if (meta.y1 <= this.state.cursor.y + this.config.SCROLL_AHEAD) {
        this.table.scrollToCell(meta.x0, meta.y0 + 1, this.num_columns, this.num_rows);
      } else if (this.state.cursor.y - this.config.SCROLL_AHEAD + 2 < meta.y0) {
        if (0 < meta.y0 - 1) {
          this.table.scrollToCell(
            meta.x0,
            meta.y0 - 1,
            this.num_columns,
            this.num_rows
          );
        } else {
          this.table.scrollToCell(meta.x0, 0, this.num_columns, this.num_rows);
        }
      }
    }
  }

  get observedAttributes() {
    return ["stripes"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this[name] = newValue;
  }
}

if (document.createElement(ELEMENT_NAME).constructor === HTMLElement) {
  window.customElements.define(ELEMENT_NAME, TableElement);
  console.log(`Registering custom element ${ELEMENT_NAME}`);
}
