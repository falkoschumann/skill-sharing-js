// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

import { html } from 'lit-html';
import { Container } from '@muspellheim/shared/browser';

import * as actions from '../domain/actions.js';

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
    this.store.dispatch(actions.changeUser(event.target.value));
  }
}

window.customElements.define('s-user-field', UserFieldComponent);
