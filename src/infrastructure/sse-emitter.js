// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export class SseEmitter {
  #timeout;
  #response;

  constructor(timeout) {
    this.#timeout = timeout;
  }

  get timeout() {
    return this.#timeout;
  }

  extendResponse(outputMessage) {
    // TODO check HTTP version, is it HTTP/2 when using EventSource?
    outputMessage.statusCode = 200;
    this.#response = outputMessage
      .setHeader("Content-Type", "text/event-stream")
      .setHeader("Cache-Control", "no-cache")
      .setHeader("Keep-Alive", "timeout=60")
      .setHeader("Connection", "keep-alive");

    if (this.timeout != null) {
      const timeoutId = setTimeout(() => this.#close(), this.timeout);
      this.#response.addListener("close", () => clearTimeout(timeoutId));
    }
  }

  send({ id, name, reconnectTime, comment, data } = {}) {
    if (comment != null) {
      this.#response.write(`: ${comment}\n`);
    }

    if (name != null) {
      this.#response.write(`event: ${name}\n`);
    }

    if (data != null) {
      if (typeof data === "object") {
        data = JSON.stringify(data);
      } else {
        data = String(data).replaceAll("\n", "\ndata: ");
      }
      this.#response.write(`data: ${data}\n`);
    }

    if (id != null) {
      this.#response.write(`id: ${id}\n`);
    }

    if (reconnectTime != null) {
      this.#response.write(`retry: ${reconnectTime}\n`);
    }

    this.#response.write("\n");
  }

  simulateTimeout() {
    this.#close();
  }

  #close() {
    this.#response.end();
  }
}
