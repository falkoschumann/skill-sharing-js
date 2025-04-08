// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { html, render } from "lit-html";

import { store } from "../application/store.js";

export class Component extends HTMLElement {
  connectedCallback() {
    this.updateView();
  }

  disconnectedCallback() {}

  updateView() {
    if (!this.isConnected) {
      // Skip rendering, e.g. when setting properties before inserting into DOM.
      return;
    }

    render(this.getView(), this.getRenderTarget());
  }

  getView() {
    return html``;
  }

  getRenderTarget() {
    return this;
  }
}

export class Container extends Component {
  #unsubscribeStore;

  constructor() {
    super();
    this.state = {};
  }

  dispatch(action) {
    store.dispatch(action);
  }

  connectedCallback() {
    this.#unsubscribeStore = store.subscribe(() => this.updateView());
    super.connectedCallback();
  }

  disconnectedCallback() {
    this.#unsubscribeStore();
    super.disconnectedCallback();
  }

  updateView() {
    this.state = this.extractState(store.getState());
    super.updateView();
  }

  extractState(state) {
    return state;
  }
}
