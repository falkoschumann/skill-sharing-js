// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

import { html } from 'lit-html';
import { Container } from '@muspellheim/shared/browser';

import * as actions from '../domain/actions.js';

class TalkFormComponent extends Container {
  getView() {
    return html`
      <form @submit=${(e) => this.#formSubmitted(e)}>
        <h3>Submit a Talk</h3>
        <ul class="form">
          <li>
            <label for="title">Title:</label>
            <input type="text" required id="title" name="title" />
          </li>
          <li>
            <label for="summary">Summary:</label>
            <textarea
              rows="6"
              cols="30"
              required
              id="summary"
              name="summary"
            ></textarea>
          </li>
          <li>
            <button type="submit">Submit</button>
          </li>
        </ul>
      </form>
    `;
  }

  #formSubmitted(event) {
    event.preventDefault();
    if (this.#validateForm(event.target)) {
      this.#submitTalk(event.target);
    }
  }

  #validateForm(form) {
    form.reportValidity();
    return form.checkValidity();
  }

  #submitTalk(form) {
    const formData = new FormData(form);
    this.store.dispatch(
      actions.submitTalk(formData.get('title'), formData.get('summary')),
    );
    form.reset();
  }
}

window.customElements.define('s-talk-form', TalkFormComponent);
