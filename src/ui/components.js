// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

/**
 * @typedef {import('redux').Unsubscribe} Unsubscribe
 * @typedef {import('redux').Action} Action
 */

import { html, render } from 'lit-html';

import { store } from '../application/store.js';

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
  /** @type {Unsubscribe} */
  #unsubscribeStore;

  constructor() {
    super();
    this.state = {};
  }

  /**
   * @param action {Action}
   */
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

  /**
   * @param state {any}
   * @returns {any}
   */
  extractState(state) {
    return state;
  }
}
