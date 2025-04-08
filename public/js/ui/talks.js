// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { html } from "lit-html";

import { deleteTalk, selectTalks } from "../application/talks_slice.js";
import { Container } from "./components.js";
import "./comments.js";

class TalksComponent extends Container {
  extractState(state) {
    return selectTalks(state);
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
            @click=${() => this.dispatch(deleteTalk({ title: talk.title }))}
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
}

window.customElements.define("s-talks", TalksComponent);
