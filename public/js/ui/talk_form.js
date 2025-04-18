// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { html } from "lit-html";

import { Component } from "./components.js";

class TalkFormComponent extends Component {
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
    this.dispatchEvent(
      new CustomEvent("talkSubmitted", {
        detail: {
          title: formData.get("title"),
          summary: formData.get("summary"),
        },
      }),
    );
    form.reset();
  }
}

window.customElements.define("s-talk-form", TalkFormComponent);
