// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

import { html } from 'lit-html';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/dist/js/bootstrap.esm.js';

import * as actions from '../domain/actions.js';
import { Container } from './components.js';
import './talk-form.js';
import './talks.js';
import './user-field.js';

class SkillSharingComponent extends Container {
  constructor() {
    super();
    this.className = 'd-block container py-4 px-3 mx-auto';
  }

  connectedCallback() {
    super.connectedCallback();
    this.dispatch(actions.start());
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

window.customElements.define('s-skill-sharing', SkillSharingComponent);
