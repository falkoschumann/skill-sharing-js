// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { html } from "lit-html";

import { Component } from "./components.js";

class UserFieldComponent extends Component {
  #username;

  get username() {
    return this.#username;
  }

  set username(value) {
    this.#username = value;
    this.updateView();
  }

  constructor() {
    super();
    this.className = "d-block mb-4";
  }

  getView() {
    return html`
      <div class="mb-3">
        <label for="username" class="form-label">Your name</label>
        <input
          type="text"
          id="username"
          name="username"
          autocomplete="username"
          class="form-control"
          .value="${this.username}"
          @change=${(event) =>
            this.dispatchEvent(
              new CustomEvent("nameChanged", {
                detail: { username: event.target.value },
              }),
            )}
        />
      </div>
    `;
  }
}

window.customElements.define("s-user-field", UserFieldComponent);
