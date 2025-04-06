// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

import { html } from 'lit-html';
import { Component } from './components.js';

/**
 * @typedef {import('../../shared/talks.js').Talk} Talk
 */
import { store } from '../application/store.js';
import * as actions from '../domain/actions.js';

class CommentsComponent extends Component {
  /** @type {Talk|undefined} */
  #talk;

  get talk() {
    return this.#talk;
  }

  set talk(value) {
    this.#talk = value;
    this.updateView();
  }

  getView() {
    if (!this.talk) {
      return html``;
    }

    return html`
      <ul class="list-group mb-3">
        ${this.talk.comments.map(
          (comment) => html`
            <li class="list-group-item">
              <strong>${comment.author}</strong>: ${comment.message}
            </li>
          `,
        )}
      </ul>
      <form @submit=${(e) => this.#formSubmitted(e)} class="form">
        <div class="mb-3">
          <input
            type="text"
            hidden
            name="talkTitle"
            value="${this.talk.title}"
          />
          <input type="text" required name="comment" class="form-control" />
        </div>
        <button type="submit" class="btn btn-primary">Add comment</button>
      </form>
    `;
  }

  #formSubmitted(event) {
    event.preventDefault();
    if (this.#validateForm(event.target)) {
      this.#addComment(event.target);
    }
  }

  #validateForm(form) {
    form.reportValidity();
    return form.checkValidity();
  }

  #addComment(form) {
    const formData = new FormData(form);
    store.dispatch(
      actions.addComment(formData.get('talkTitle'), formData.get('comment')),
    );
    form.reset();
  }
}

window.customElements.define('s-comments', CommentsComponent);
