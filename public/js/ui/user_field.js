// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { html } from "lit-html";

import { changeUser, selectUser } from "../application/talks_slice.js";
import { Container } from "./components.js";

class UserFieldComponent extends Container {
  constructor() {
    super();
    this.className = "d-block mb-4";
    this.state = "";
  }

  extractState(state) {
    return selectUser(state);
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
          .value="${this.state}"
          @change=${(event) =>
            this.dispatch(changeUser({ username: event.target.value }))}
        />
      </div>
    `;
  }
}

window.customElements.define("s-user-field", UserFieldComponent);
