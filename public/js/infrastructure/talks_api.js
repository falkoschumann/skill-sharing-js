// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { SseClient } from "./sse_client.js";
import { OutputTracker } from "../util/output_tracker.js";

const BASE_URL = "/api/talks";

const TALK_SUBMITTED_EVENT = "talk-submitted";
const TALK_DELETED_EVENT = "talk-deleted";
const COMMENT_ADDED_EVENT = "comment-added";

export class TalksUpdatedEvent extends Event {
  static TYPE = "talks-updated";

  constructor(talks) {
    super(TalksUpdatedEvent.TYPE);
    this.talks = talks;
  }
}

export class TalksApi extends EventTarget {
  static create() {
    return new TalksApi(SseClient.create(), globalThis.fetch.bind(globalThis));
  }

  static createNull() {
    return new TalksApi(SseClient.createNull(), fetchStub);
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
    // TODO validate command status
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
    // TODO validate command status
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
    // TODO validate command status
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
    // TODO validate query result
    // TODO use query result as event
    const talks = JSON.parse(event.data);
    this.dispatchEvent(new TalksUpdatedEvent(talks));
  }
}

async function fetchStub() {}
