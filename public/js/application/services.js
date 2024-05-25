import { reducer } from '../domain/reducer.js';
import { Api } from '../infrastructure/api.js';
import { Repository } from '../infrastructure/repository.js';
import { createStore } from '../util/store.js';

/**
 * @typedef {import('../util/store.js').Store} Store
 */

// TODO handle errors

export class Services {
  static create() {
    return new Services(
      createStore(reducer),
      Repository.create(),
      Api.create(),
    );
  }

  static createNull() {
    return new Services(
      createStore(reducer),
      Repository.createNull(),
      Api.createNull(),
    );
  }

  #store;
  #repository;
  #api;

  constructor(
    /** @type {Store} */ store,
    /** @type {Repository} */ repository,
    /** @type {Api} */ api,
  ) {
    this.#store = store;
    this.#repository = repository;
    this.#api = api;
  }

  get store() {
    return this.#store;
  }

  async changeUser({ username }) {
    this.#store.dispatch({ type: 'change-user', username });
    await this.#repository.store({ username });
  }

  async loadUser() {
    const { username = 'Anon' } = await this.#repository.load();
    this.#store.dispatch({ type: 'change-user', username });
  }

  async submitTalk({ title, summary }) {
    const presenter = this.#store.getState().user;
    const talk = { title, presenter, summary };
    await this.#api.putTalk(talk);
  }

  async addComment({ title, comment }) {
    const author = this.#store.getState().user;
    await this.#api.postComment(title, {
      author,
      message: comment,
    });
  }

  async deleteTalk({ title }) {
    await this.#api.deleteTalk(title);
  }

  async connectTalks() {
    this.#api.addEventListener('talks-updated', (event) =>
      this.#store.dispatch({ type: 'talks-updated', talks: event.talks }),
    );
    await this.#api.connectTalks();
  }
}
