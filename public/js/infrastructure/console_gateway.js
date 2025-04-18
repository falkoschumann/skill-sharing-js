// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export class ConsoleGateway extends EventTarget {
  #console;

  constructor(console = global.console) {
    super();
    this.#console = console;
  }

  static create() {
    return new ConsoleGateway();
  }

  static createNull() {
    return new ConsoleGateway(new ConsoleStub());
  }

  error(message) {
    this.#console.error(message);
  }

  warn(message) {
    this.#console.warn(message);
  }

  info(message) {
    this.#console.info(message);
  }

  debug(message) {
    this.#console.debug(message);
  }

  trace(message) {
    this.#console.trace(message);
  }
}

class ConsoleStub {
  error() {}

  warn() {}

  info() {}

  debug() {}

  trace() {}
}
