// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

import { html } from 'lit-html';
import { Container } from '@muspellheim/shared/browser';

import { store } from '../application/store.js';
import * as actions from '../domain/actions.js';
import './talk-form.js';
import './talks.js';
import './user-field.js';
import './styles.scss';

class SkillSharingComponent extends Container {
  constructor() {
    super();
    this.className = 'd-block container py-4 px-3 mx-auto';
    Container.initStore(store);
  }

  connectedCallback() {
    super.connectedCallback();
    this.store.dispatch(actions.start());
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
