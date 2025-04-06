// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export class OutputTracker {
  /**
   * @param {EventTarget} eventTarget
   * @param {string} event
   */
  static create(eventTarget, event) {
    return new OutputTracker(eventTarget, event);
  }

  /** @type {EventTarget} */
  #eventTarget;

  /** @type {string} */
  #event;

  /** @type {EventListener} */
  #tracker;

  #data = [];

  /**
   * @param {EventTarget} eventTarget
   * @param {string} event
   */
  constructor(eventTarget, event) {
    this.#eventTarget = eventTarget;
    this.#event = event;
    this.#tracker = (event) => this.#data.push(event.detail);

    this.#eventTarget.addEventListener(this.#event, this.#tracker);
  }

  get data() {
    return this.#data;
  }

  clear() {
    const result = [...this.#data];
    this.#data.length = 0;
    return result;
  }

  stop() {
    this.#eventTarget.removeEventListener(this.#event, this.#tracker);
  }
}
