// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { html } from "lit-html";

import {
  addComment,
  changeUser,
  deleteTalk,
  start,
  submitTalk,
} from "../application/talks_slice.js";
import { Container } from "./components.js";
import "./talk_form.js";
import "./talks.js";
import "./user_field.js";

class SkillSharingComponent extends Container {
  constructor() {
    super();
    this.className = "d-block container py-4 px-3 mx-auto";
  }

  connectedCallback() {
    super.connectedCallback();
    this.dispatch(start());
  }

  extractState(state) {
    return state.talks;
  }

  getView() {
    return html`
      <h1>Skill Sharing</h1>
      <s-user-field
        .username=${this.state.user}
        @nameChanged=${(event) => this.dispatch(changeUser(event.detail))}
      ></s-user-field>
      <s-talks
        .talks=${this.state.talks}
        @commentAdded=${(event) => this.dispatch(addComment(event.detail))}
        @talkDeleted=${(event) => this.dispatch(deleteTalk(event.detail))}
      ></s-talks>
      <s-talk-form
        @talkSubmitted=${(event) => this.dispatch(submitTalk(event.detail))}
      ></s-talk-form>
    `;
  }
}

window.customElements.define("s-skill-sharing", SkillSharingComponent);
