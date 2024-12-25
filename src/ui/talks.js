// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

import { html } from 'lit-html';
import { Container } from '@muspellheim/shared/browser';

import * as actions from '../domain/actions.js';

class TalksComponent extends Container {
  extractState(state) {
    return state.talks;
  }

  getView() {
    return html`${this.state.map((talk) => this.#talkTemplate(talk))}`;
  }

  #talkTemplate(talk) {
    return html`
      <section class="talk mb-4">
        <h2>
          ${talk.title}
          <button class="btn btn-secondary btn-sm"
                  @click=${() => this.#deleteTalk(talk.title)}>Delete
          </button>
        </h2>
        <div>by <strong>${talk.presenter}</strong></div>
        <p>${talk.summary}</p>
        <!-- TODO Extract Comments component -->
        ${this.#commentsTemplate(talk.comments)}
        <form @submit=${(e) => this.#formSubmitted(e)} class="form">
          <div class="mb-3">
            <input
              type="text"
              hidden
              name="talkTitle"
              value="${talk.title}"
            />
            <input type="text" required name="comment" class="form-control" />
          </div>
          <button type="submit" class="btn btn-primary">Add comment
          </button>
      </section>
    `;
  }

  #commentsTemplate(comments) {
    return html`
      <ul class="list-group mb-3">
        ${comments.map(
          (comment) => html`
            <li class="comment list-group-item">
              <strong>${comment.author}</strong>: ${comment.message}
            </li>
          `,
        )}
      </ul>
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

  #deleteTalk(title) {
    this.store.dispatch(actions.deleteTalk(title));
  }

  #addComment(form) {
    const formData = new FormData(form);
    this.store.dispatch(
      actions.addComment(formData.get('talkTitle'), formData.get('comment')),
    );
    form.reset();
  }
}

window.customElements.define('s-talks', TalksComponent);
