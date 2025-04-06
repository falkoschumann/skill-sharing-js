// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { User } from '../domain/users.js';

const storageKey = 'skillSharing';

export class Repository {
  static create() {
    return new Repository(localStorage);
  }

  /**
   * @param {{user?:User}} [user]
   */
  static createNull({ user } = {}) {
    return new Repository(new StorageStub(user));
  }

  /** @type {Storage} */
  #storage;

  /**
   * @oaram {Storage} storage
   */
  constructor(storage) {
    this.#storage = storage;
  }

  /**
   * @returns {Promise<User|undefined>}
   */
  async load() {
    const json = this.#storage.getItem(storageKey);
    if (json == null) {
      return;
    }

    const user = JSON.parse(json);
    return User.create(user);
  }

  /**
   * @param {User} user
   */
  async store(user) {
    const json = JSON.stringify(user);
    this.#storage.setItem(storageKey, json);
  }
}

class StorageStub {
  #item;

  constructor(item) {
    this.#item = item != null ? JSON.stringify(item) : null;
  }

  getItem() {
    return this.#item;
  }

  setItem(_key, item) {
    this.#item = item;
  }
}
