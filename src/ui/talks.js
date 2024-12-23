// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

import { html } from 'lit-html';
import { Container } from '@muspellheim/shared/browser';

import * as actions from '../domain/actions.js';
import './talks.css';

class TalksComponent extends Container {
  extractState(state) {
    return state.talks;
  }

  getView() {
    return html`${this.state.map((talk) => this.#talkTemplate(talk))}`;
  }

  #talkTemplate(talk) {
    return html`
      <section class="talk">
        <h2>
          ${talk.title}
          <button @click=${() => this.#deleteTalk(talk.title)}>Delete</button>
        </h2>
        <div>by <strong>${talk.presenter}</strong></div>
        <p>${talk.summary}</p>
        ${this.#commentsTemplate(talk.comments)}
        <form @submit=${(e) => this.#formSubmitted(e)} class="form">
          <ul>
            <li>
              <input
                type="text"
                hidden
                name="talkTitle"
                value="${talk.title}"
              />
              <input type="text" required name="comment" />
            </li>
            <li>
              <button type="submit">Add comment</button>
            </li>
          </ul>
        </form>
      </section>
    `;
  }

  #commentsTemplate(comments) {
    return html`
      <ul class="comments">
        ${comments.map(
          (comment) => html`
            <li class="comment">
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
