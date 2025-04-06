// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

import { html } from 'lit-html';

import * as actions from '../domain/actions.js';
import { Container } from './components.js';

class TalkFormComponent extends Container {
  getView() {
    return html`
      <form @submit=${(e) => this.#formSubmitted(e)}>
        <h3>Submit a Talk</h3>
        <div class="mb-3">
          <label for="title" class="form-label">Title:</label>
          <input
            type="text"
            required
            id="title"
            name="title"
            class="form-control"
          />
        </div>
        <div class="mb-3">
          <label for="summary" class="form-label">Summary:</label>
          <textarea
            rows="6"
            cols="30"
            required
            id="summary"
            name="summary"
            class="form-control"
          ></textarea>
        </div>
        <button type="submit" class="btn btn-primary">Submit</button>
      </form>
    `;
  }

  /**
   * @param {SubmitEvent} event
   */
  #formSubmitted(event) {
    event.preventDefault();
    if (this.#validateForm(event.target)) {
      this.#submitTalk(event.target);
    }
  }

  /**
   * @param {HTMLFormElement} form
   * @returns {boolean}
   */
  #validateForm(form) {
    form.reportValidity();
    return form.checkValidity();
  }

  /**
   * @param {HTMLFormElement} form
   */
  #submitTalk(form) {
    const formData = new FormData(form);
    this.dispatch(
      actions.submitTalk(formData.get('title'), formData.get('summary')),
    );
    form.reset();
  }
}

window.customElements.define('s-talk-form', TalkFormComponent);
