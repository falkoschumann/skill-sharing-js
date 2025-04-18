// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { html } from "lit-html";

import { Component } from "./components.js";
import "./comments.js";

class TalksComponent extends Component {
  #talks;

  get talks() {
    return this.#talks;
  }

  set talks(value) {
    this.#talks = value;
    this.updateView();
  }

  getView() {
    return html`${this.talks.map((talk) => this.#talkTemplate(talk))}`;
  }

  #talkTemplate(talk) {
    return html`
      <section class="mb-4">
        <h2>
          ${talk.title}
          <button
            class="btn btn-secondary btn-sm"
            @click=${() =>
              this.dispatchEvent(
                new CustomEvent("talkDeleted", {
                  detail: { title: talk.title },
                }),
              )}
          >
            Delete
          </button>
        </h2>
        <div>by <strong>${talk.presenter}</strong></div>
        <p>${talk.summary}</p>
        <s-comments
          .talk=${talk}
          @commentAdded=${(event) =>
            this.dispatchEvent(
              new CustomEvent(event.type, { detail: event.detail }),
            )}
        ></s-comments>
      </section>
    `;
  }
}

window.customElements.define("s-talks", TalksComponent);
