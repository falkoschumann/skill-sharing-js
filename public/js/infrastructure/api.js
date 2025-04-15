// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { SseClient } from "./sse-client.js";
import { validateTalk } from "../domain/talks.js";
import { OutputTracker } from "../util/output-tracker.js";

const BASE_URL = "/api/talks";

export const TALK_SUBMITTED_EVENT = "talk-submitted";
export const TALK_DELETED_EVENT = "talk-deleted";
export const COMMENT_ADDED_EVENT = "comment-added";

export class TalksUpdatedEvent extends Event {
  static TYPE = "talks-updated";

  constructor(talks) {
    super(TalksUpdatedEvent.TYPE);
    this.talks = talks;
  }
}

// TODO validate responses (command status', query results, events)

export class Api extends EventTarget {
  static create() {
    return new Api(SseClient.create(), globalThis.fetch.bind(globalThis));
  }

  static createNull() {
    return new Api(SseClient.createNull(), fetchStub);
  }

  #talksClient;
  #fetch;

  constructor(talksClient, fetch) {
    super();
    this.#talksClient = talksClient;
    this.#fetch = fetch;

    this.#talksClient.addEventListener(
      "message",
      this.#handleMessage.bind(this),
    );
  }

  async connect() {
    await this.#talksClient.connect(BASE_URL);
  }

  async close() {
    await this.#talksClient.close();
  }

  simulateMessage(message) {
    this.#talksClient.simulateMessage(message);
  }

  async submitTalk(command) {
    const body = JSON.stringify(command);
    await this.#fetch(`${BASE_URL}/${encodeURIComponent(command.title)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body,
    });
    this.dispatchEvent(
      new CustomEvent(TALK_SUBMITTED_EVENT, {
        detail: command,
      }),
    );
  }

  trackTalksSubmitted() {
    return OutputTracker.create(this, TALK_SUBMITTED_EVENT);
  }

  async addComment(command) {
    const body = JSON.stringify(command.comment);
    await this.#fetch(
      `${BASE_URL}/${encodeURIComponent(command.title)}/comments`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body,
      },
    );
    this.dispatchEvent(
      new CustomEvent(COMMENT_ADDED_EVENT, {
        detail: command,
      }),
    );
  }

  trackCommentsAdded() {
    return OutputTracker.create(this, COMMENT_ADDED_EVENT);
  }

  async deleteTalk(command) {
    await this.#fetch(`${BASE_URL}/${encodeURIComponent(command.title)}`, {
      method: "DELETE",
    });
    this.dispatchEvent(
      new CustomEvent(TALK_DELETED_EVENT, { detail: command }),
    );
  }

  trackTalksDeleted() {
    return OutputTracker.create(this, TALK_DELETED_EVENT);
  }

  #handleMessage(event) {
    const dtos = JSON.parse(event.data);
    const talks = dtos.map((dto) => validateTalk(dto));
    this.dispatchEvent(new TalksUpdatedEvent(talks));
  }
}

async function fetchStub() {}
