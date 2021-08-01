import * as React from "react";
import * as ReactDOM from "react-dom";
import * as retargetEvents from "react-shadow-dom-retarget-events";
import css from "../../less/index.less";

console.log(css);
import {RegularTableComponent} from "./table";

const ELEMENT_NAME = "regular-table-extras";

export class TableElement extends HTMLElement {
    constructor() {
      super();
      this.shadow = this.attachShadow({mode: "open"});
      this.mountPoint = document.createElement("div");
      this.mountPoint.classList.add("table-mountpoint");
      this.shadow.appendChild(this.mountPoint);

      this.injectCSS();
    }
  
    injectCSS() {
      const style = document.createElement("style");
      this.styleMount = style;
      style.innerHTML = `${css}`;
      this.shadow.appendChild(style);
    }
  
    createComponent() {
      return React.createElement(RegularTableComponent, {...this._getArgs()}, React.createElement("slot"));
    }

    connectedCallback() {
      this.component = this.createComponent();
      ReactDOM.render(this.component, this.mountPoint);
      this.retargetEvents();
    }

    get observedAttributes() {
      return [];
    }
  
    _getArgs() {
      const args = {mountPoint: this.mountPoint, styleMount: this.styleMount};
      // eslint-disable-next-line no-return-assign
      this.observedAttributes.forEach((name) => (args[name] = this.getAttribute(name)));
      return args;
    }
  
    attributeChangedCallback(name, oldValue, newValue) {
      this[name] = newValue;
      this.component = this.createComponent();
      ReactDOM.render(this.component, this.mountPoint);
      this.retargetEvents();
    }

    retargetEvents() {
      retargetEvents(this.shadowRoot);
    }
}

if (document.createElement(ELEMENT_NAME).constructor === HTMLElement) {
  window.customElements.define(ELEMENT_NAME, TableElement);
  console.log(`Registering custom element ${ELEMENT_NAME}`);
};

