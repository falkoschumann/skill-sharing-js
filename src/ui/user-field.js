// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

import { html } from 'lit-html';
import { Container } from '@muspellheim/shared/browser';

import * as actions from '../domain/actions.js';

class UserFieldComponent extends Container {
  constructor() {
    super();
    this.state = '';
  }

  extractState(state) {
    return state.user;
  }

  getView() {
    return html`
      <ul class="form">
        <li>
          <label for="username">Your name:</label>
          <input
            type="text"
            id="username"
            name="username"
            autocomplete="username"
            .value="${this.state}"
            @change=${(e) => this.#changeUser(e.target.value)}
          />
        </li>
      </ul>
    `;
  }

  #changeUser(username) {
    this.store.dispatch(actions.changeUser(username));
  }
}

window.customElements.define('s-user-field', UserFieldComponent);
