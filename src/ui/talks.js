// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

import { html } from 'lit-html';
import { Container } from '@muspellheim/shared/browser';

import * as actions from '../domain/actions.js';
import './comments.js';

class TalksComponent extends Container {
  extractState(state) {
    return state.talks;
  }

  getView() {
    return html`${this.state.map((talk) => this.#talkTemplate(talk))}`;
  }

  #talkTemplate(talk) {
    return html`
      <section class="mb-4">
        <h2>
          ${talk.title}
          <button
            class="btn btn-secondary btn-sm"
            @click=${() => this.#deleteTalk(talk.title)}
          >
            Delete
          </button>
        </h2>
        <div>by <strong>${talk.presenter}</strong></div>
        <p>${talk.summary}</p>
        <s-comments .talk=${talk}></s-comments>
      </section>
    `;
  }

  #deleteTalk(title) {
    this.store.dispatch(actions.deleteTalk(title));
  }
}

window.customElements.define('s-talks', TalksComponent);
