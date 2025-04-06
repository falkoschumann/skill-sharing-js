// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

/**
 * @import http from 'node:http'
 */

export class SseEmitter {
  /** @type {?number} */
  #timeout;

  /** @type {http.ServerResponse|undefined} */
  #response;

  /**
   * @param {number} [timeout]
   */
  constructor(timeout) {
    this.#timeout = timeout;
  }

  /**
   * @type {number|undefined}
   */
  get timeout() {
    return this.#timeout;
  }

  /**
   * @param {http.ServerResponse} outputMessage
   */
  extendResponse(outputMessage) {
    // TODO check HTTP version, is it HTTP/2 when using EventSource?
    outputMessage.statusCode = 200;
    this.#response = outputMessage
      .setHeader('Content-Type', 'text/event-stream')
      .setHeader('Cache-Control', 'no-cache')
      .setHeader('Keep-Alive', 'timeout=60')
      .setHeader('Connection', 'keep-alive');

    if (this.timeout != null) {
      const timeoutId = setTimeout(() => this.#close(), this.timeout);
      this.#response.addListener('close', () => clearTimeout(timeoutId));
    }
  }

  /**
   * @param {object} event
   * @param {string} [event.id]
   * @param {string} [event.name]
   * @param {number} [event.reconnectTime]
   * @param {string} [event.comment]
   * @param {string|object} [event.data]
   */
  send({ id, name, reconnectTime, comment, data } = {}) {
    if (comment != null) {
      this.#response.write(`: ${comment}\n`);
    }

    if (name != null) {
      this.#response.write(`event: ${name}\n`);
    }

    if (data != null) {
      if (typeof data === 'object') {
        data = JSON.stringify(data);
      } else {
        data = String(data).replaceAll('\n', '\ndata: ');
      }
      this.#response.write(`data: ${data}\n`);
    }

    if (id != null) {
      this.#response.write(`id: ${id}\n`);
    }

    if (reconnectTime != null) {
      this.#response.write(`retry: ${reconnectTime}\n`);
    }

    this.#response.write('\n');
  }

  simulateTimeout() {
    this.#close();
  }

  #close() {
    this.#response.end();
  }
}
