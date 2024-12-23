// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

/**
 * @typedef {import('@muspellheim/shared').Store} Store
 * @typedef {import('../infrastructure/api.js').TalksUpdatedEvent} TalksUpdatedEvent
 */

import { createStore } from '@muspellheim/shared';

import {
  AddCommentCommand,
  DeleteTalkCommand,
  SubmitTalkCommand,
} from '../../shared/messages.js';
import { Comment } from '../../shared/talks.js';
import * as actions from '../domain/actions.js';
import { reducer } from '../domain/reducer.js';
import { Api } from '../infrastructure/api.js';
import { Repository } from '../infrastructure/repository.js';
import { User } from '../domain/users.js';

// TODO Handle errors
// TODO Add logging
// TODO Add validation
// TODO Add metrics

export class Service {
  /** @type {Service} */ static #instance;

  static get() {
    // TODO Move configuration to main or app
    if (Service.#instance == null) {
      Service.#instance = new Service(
        createStore(reducer),
        Repository.create(),
        Api.create(),
      );
    }

    return Service.#instance;
  }

  /** @type {Store} */
  #store;

  /** @type {Repository} */
  #repository;

  /** @type {Api} */
  #api;

  /**
   * @param {Store} store
   * @param {Repository} repository
   * @param {Api} api
   */
  constructor(store, repository, api) {
    this.#store = store;
    this.#repository = repository;
    this.#api = api;
  }

  get store() {
    return this.#store;
  }

  async changeUser({ username }) {
    this.#store.dispatch(actions.changeUser(username));
    await this.#repository.store(User.create({ username }));
  }

  async loadUser() {
    const user = await this.#repository.load();
    this.#store.dispatch(actions.changeUser(user?.username ?? 'Anon'));
  }

  async submitTalk({ title, summary }) {
    const presenter = this.#store.getState().user;
    const command = SubmitTalkCommand.create({ title, presenter, summary });
    await this.#api.submitTalk(command);
  }

  async addComment({ title, message }) {
    const author = this.#store.getState().user;
    const command = AddCommentCommand.create({
      title,
      comment: Comment.create({ author, message }),
    });
    await this.#api.addComment(command);
  }

  async deleteTalk({ title }) {
    const command = DeleteTalkCommand.create({ title });
    await this.#api.deleteTalk(command);
  }

  async connectTalks() {
    this.#api.addEventListener(
      'talks-updated',
      (/** @type {TalksUpdatedEvent} */ event) =>
        this.#store.dispatch(actions.talksUpdated(event.talks)),
    );
    await this.#api.connect();
  }
}
