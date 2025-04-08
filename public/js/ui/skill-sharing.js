// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { html } from "lit-html";

import { start } from "../application/talks_slice.js";
import { Container } from "./components.js";
import "./talk-form.js";
import "./talks.js";
import "./user-field.js";

// TODO Refactor into ATOM architecture

class SkillSharingComponent extends Container {
  constructor() {
    super();
    this.className = "d-block container py-4 px-3 mx-auto";
  }

  connectedCallback() {
    super.connectedCallback();
    this.dispatch(start());
  }

  getView() {
    return html`
      <h1>Skill Sharing</h1>
      <s-user-field></s-user-field>
      <s-talks></s-talks>
      <s-talk-form></s-talk-form>
    `;
  }
}

window.customElements.define("s-skill-sharing", SkillSharingComponent);
