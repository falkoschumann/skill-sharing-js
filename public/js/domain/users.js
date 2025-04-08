// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export class User {
  static create({ username }) {
    return new User(username);
  }

  static createTestInstance({ username = "User test username" } = {}) {
    return new User(username);
  }

  constructor(username) {
    this.username = username;
  }
}
