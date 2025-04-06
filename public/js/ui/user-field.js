// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { html } from 'lit-html';

import * as actions from '../domain/actions.js';
import { Container } from './components.js';

class UserFieldComponent extends Container {
  constructor() {
    super();
    this.className = 'd-block mb-4';
    this.state = '';
  }

  extractState(state) {
    return state.user;
  }

  getView() {
    return html`
      <div class="mb-3">
        <label for="username" class="form-label">Your name</label>
        <input
          type="text"
          id="username"
          name="username"
          autocomplete="username"
          class="form-control"
          .value="${this.state}"
          @change=${(e) => this.#changeUser(e)}
        />
      </div>
    `;
  }

  /**
   * @param {InputEvent} event
   */
  #changeUser(event) {
    this.dispatch(actions.changeUser(event.target.value));
  }
}

window.customElements.define('s-user-field', UserFieldComponent);
