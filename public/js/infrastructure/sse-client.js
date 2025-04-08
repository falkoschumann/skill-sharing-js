// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export class SseClient extends EventTarget {
  static create() {
    return new SseClient(globalThis.EventSource);
  }

  static createNull() {
    return new SseClient(EventSourceStub);
  }

  #eventSourceConstructor;

  #eventSource;

  constructor(eventSourceConstructor) {
    super();
    this.#eventSourceConstructor = eventSourceConstructor;
  }

  get isConnected() {
    return this.#eventSource?.readyState === this.#eventSourceConstructor.OPEN;
  }

  get url() {
    return this.#eventSource?.url;
  }

  async connect(url, eventName = "message") {
    await new Promise((resolve, reject) => {
      if (this.isConnected) {
        reject(new Error("Already connected."));
        return;
      }

      try {
        this.#eventSource = new this.#eventSourceConstructor(url);
        this.#eventSource.addEventListener("open", (e) => {
          this.#handleOpen(e);
          resolve();
        });
        this.#eventSource.addEventListener(eventName, (e) =>
          this.#handleMessage(e),
        );
        this.#eventSource.addEventListener("error", (e) =>
          this.#handleError(e),
        );
      } catch (error) {
        reject(error);
      }
    });
  }

  async close() {
    await new Promise((resolve, reject) => {
      if (!this.isConnected) {
        resolve();
        return;
      }

      try {
        this.#eventSource.close();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  simulateMessage(message, eventName = "message", lastEventId = undefined) {
    this.#handleMessage(
      new MessageEvent(eventName, { data: message, lastEventId }),
    );
  }

  simulateError() {
    this.#handleError(new Event("error"));
  }

  #handleOpen(event) {
    this.dispatchEvent(new event.constructor(event.type, event));
  }

  #handleMessage(event) {
    this.dispatchEvent(new event.constructor(event.type, event));
  }

  #handleError(event) {
    this.dispatchEvent(new event.constructor(event.type, event));
  }
}

class EventSourceStub extends EventTarget {
  // The constants have to be defined here because JSDOM is missing EventSource.
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSED = 2;

  constructor(url) {
    super();
    this.url = url;
    setTimeout(() => {
      this.readyState = EventSourceStub.OPEN;
      this.dispatchEvent(new Event("open"));
    }, 0);
  }

  close() {
    this.readyState = EventSourceStub.CLOSED;
  }
}
