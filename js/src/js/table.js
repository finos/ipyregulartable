import "regular-table";
import css from "../less/index.less";

const ELEMENT_NAME = "regular-table-extras";

const _ar = new Array(26).fill(0);

const DATA = [
    _ar.map((val, index) => index),
    "QWERTYUIOPASDFGHJKLZXCVBNM",
    _ar.map(() => Math.random() > .5),
    _ar.map(() => Math.random()),
    "QWERTYUIOPASDFGHJKLZXCVBNM",
    _ar.map(() => Math.random() > .5),
    _ar.map(() => Math.random()),
];

function getDataSlice(x0, y0, x1, y1) {
    console.log(x0, y0, x1, y1);
    return {
        num_rows: DATA[0].length,
        num_columns: DATA.length,
        row_headers: DATA[0].map(rec => [`Row ${rec}`]),
        column_headers: [1, 2, 3, 4, 5, 6, 7].map(rec => [`Col ${rec}`]),
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
}

const KEYCODES = {
  ENTER: 13,
  ESC: 27,
  CTRL: 17,
  ALT: 18,
  META: 91,
  LEFT: 37,
  RIGHT: 39,
  UP: 38,
  DOWN: 40,
  BACKSPACE: 8,
  DELETE: 46,
  // METARIGHT: 93
}
export class TableElement extends HTMLElement {
    constructor() {
      super();
      // create main element
      this.createMountpoint();

      // inject CSS into shadow dom
      this.injectCSS();

      // setup state tracking
      // position of the cursor
      this.state = {}
      this.state.cursor = {};
      this.state.editing = {
        active: {},
        target: null,
        original: null,
      }
      this.state.selection = {};
      this.state.selections = [];

      // setup config
      this.config = JSON.parse(this.getAttribute("config") || JSON.stringify(DEFAULT_CONFIG));
    }
  
    createMountpoint() {
      this.shadow = this.attachShadow({mode: "open"});
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
      const tds = this.table.querySelectorAll("tbody tr:nth-of-type(1) td");
      const meta = this.table.getMeta(tds[0]);
  
      if (meta) {
        // stripes
        if (this.getAttribute("stripes")) {
          this.stripes(meta);
        }
      }
    }

    handleClick(event) {
      const meta = this.table.getMeta(event.target);

      if (this.getAttribute("cursor") && meta) {
        this.state.cursor.x = meta.x;
        this.state.cursor.y = meta.y;
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
        this.state.cursor.x = meta.x;
        this.state.cursor.y = meta.y;

        // set editing and track original value
        this.state.editing.active = {x: meta.x, y: meta.y};
        console.log("here1");
        this.state.editing.target = target;
        this.state.editing.original = target.textContent;

        // allow editable
        target.setAttribute("contenteditable", true);

        // write on loss of focus
        // target.addEventListener("focusout", (focusOutEvent) => {
        target.onfocusout = (focusOutEvent) => {
          // stop event propagation
          focusOutEvent.preventDefault();
          focusOutEvent.stopPropagation();

          // TODO fire write
          this.doneEditing();
        };
        // });
      } else {
        this.state.cursor = {};
        this.doneEditing();
      }
      this.updateFocus();
    }

    isEditing(meta) {
      return !(meta && meta.x === this.state.editing.active.x && meta.y === this.state.editing.active.y);
    }

    doneEditing(restore) {
      if (restore) {
        // restore original content
        this.state.editing.target.textContent = this.state.editing.original;
      }

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
      if (!this.isEditing(meta)) {
        // TODO fire write
        this.doneEditing();
      }

      this.state.selection = {};

      if (this.getAttribute("selection")) {
        
        if (meta && meta.x !== undefined && meta.y !== undefined) {
          this.state.selection = {
            x: meta.x,
            y: meta.y
          };
        }
        
        if (!event.ctrlKey && !event.metaKey) {
          this.state.selections = [];
        }
      }
    }

    handleKeydown(event) {
      const meta = this.table.getMeta(event.target);

      //   event.preventDefault();
      //   event.stopPropagation();
      if (!this.isEditing(meta)) {
          if (event.keyCode === KEYCODES.ENTER && !event.shiftKey) {
            event.preventDefault();
            event.stopPropagation();

            // TODO fire write
            this.doneEditing();
          } else if (event.keyCode === KEYCODES.ESC) {
            event.preventDefault();
            event.stopPropagation();

            // restore prior state
            this.doneEditing(true);
          }
      }
    }

    handleMouseover(event) {
      if (this.state.selection && this.state.selection.x !== undefined) {
        const meta = this.table.getMeta(event.target);
    
        if (meta && meta.x !== undefined && meta.y !== undefined) {
          const potentialSelection = {
            x0: Math.min(meta.x, this.state.selection.x),
            x1: Math.max(meta.x, this.state.selection.x),
            y0: Math.min(meta.y, this.state.selection.y),
            y1: Math.max(meta.y, this.state.selection.y)
          };
          this.selectArea(this.state.selections.concat([potentialSelection]));
        }
      }
    }

    handleMouseup(event) {
      const meta = this.table.getMeta(event.target);

      if (this.state.selection && this.state.selection.x !== undefined && meta.x !== undefined && meta.y !== undefined) {
        const selection = {
          x0: Math.min(meta.x, this.state.selection.x),
          x1: Math.max(meta.x, this.state.selection.x),
          y0: Math.min(meta.y, this.state.selection.y),
          y1: Math.max(meta.y, this.state.selection.y)
        };
        this.state.selections.push(selection);
        this.selectArea();
      }
    
      this.state.selection = {};
    }

    selectArea(selections) {
      const tds = this.table.querySelectorAll("tbody td");
      const tdsToHighlight = new Set();

      (selections || this.state.selections).forEach(({x0, x1, y0, y1}) => {
        if ([x0, x1, y0, y1].every((val) => val !== undefined)) {
          for (const td of tds) {
            const meta = this.table.getMeta(td);
            if (x0 <= meta.x && meta.x <= x1 && y0 <= meta.y && meta.y <= y1) {
              tdsToHighlight.add(td);
            }
          }
        }
      });

      tds.forEach((td) => {
        if(tdsToHighlight.has(td)) {
          td.classList.add(this.config.SELECTION);
        } else {
          td.classList.remove(this.config.SELECTION);
        }
      });
    };

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

    stripes(meta) {
      if (meta.y0 % 2 === 0) {
        this.table.classList.remove(this.config.ODD_STRIPE);
        this.table.classList.add(this.config.EVEN_STRIPE);
      } else {
        this.table.classList.remove(this.config.EVEN_STRIPE);
        this.table.classList.add(this.config.ODD_STRIPE);
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
};

