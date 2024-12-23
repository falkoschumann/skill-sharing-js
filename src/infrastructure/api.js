// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

/**
 * @typedef {import('@muspellheim/shared').MessageClient} MessageClient
 *
 * @typedef {import('../../shared/messages.js').AddCommentCommand} AddCommentCommand
 * @typedef {import('../../shared/messages.js').DeleteTalkCommand} DeleteTalkCommand
 * @typedef {import('../../shared/messages.js').SubmitTalkCommand} SubmitTalkCommand
 */

import { LongPollingClient, OutputTracker } from '@muspellheim/shared';

import { Talk } from '../../shared/talks.js';

const BASE_URL = '/api/talks';

export const TALK_SUBMITTED_EVENT = 'talk-submitted';
export const TALK_DELETED_EVENT = 'talk-deleted';
export const COMMENT_ADDED_EVENT = 'comment-added';

export class TalksUpdatedEvent extends Event {
  static TYPE = 'talks-updated';

  /**
   * @param {Talk[]} talks
   */
  constructor(talks) {
    super(TalksUpdatedEvent.TYPE);
    this.talks = talks;
  }
}

export class Api extends EventTarget {
  static create() {
    return new Api(
      LongPollingClient.create(),
      globalThis.fetch.bind(globalThis),
    );
  }

  /**
   * @param {object} [options]
   * @param {object} [options.fetchResponse]
   * @returns {Api}
   */
  static createNull({ fetchResponse } = {}) {
    return new Api(
      LongPollingClient.createNull({ fetchResponse }),
      // @ts-ignore
      fetchStub,
    );
  }

  /** @type {MessageClient} */
  #talksClient;

  /** @type {typeof globalThis.fetch} */
  #fetch;

  /**
   * @param {MessageClient} talksClient
   * @param {typeof globalThis.fetch} fetch
   */
  constructor(talksClient, fetch) {
    super();
    this.#talksClient = talksClient;
    this.#fetch = fetch;

    this.#talksClient.addEventListener(
      'message',
      this.#handleMessage.bind(this),
    );
  }

  async connect() {
    await this.#talksClient.connect(BASE_URL);
  }

  async close() {
    await this.#talksClient.close();
  }

  /**
   * @param {SubmitTalkCommand} command
   */
  async submitTalk(command) {
    const body = JSON.stringify(command);
    await this.#fetch(`${BASE_URL}/${encodeURIComponent(command.title)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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

  /**
   * @param {AddCommentCommand} command
   */
  async addComment(command) {
    const body = JSON.stringify(command.comment);
    await this.#fetch(
      `${BASE_URL}/${encodeURIComponent(command.title)}/comments`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

  /**
   * @param {DeleteTalkCommand} command
   */
  async deleteTalk(command) {
    await this.#fetch(`${BASE_URL}/${encodeURIComponent(command.title)}`, {
      method: 'DELETE',
    });
    this.dispatchEvent(
      new CustomEvent(TALK_DELETED_EVENT, { detail: command }),
    );
  }

  trackTalksDeleted() {
    return OutputTracker.create(this, TALK_DELETED_EVENT);
  }

  /**
   * @param {MessageEvent} event
   */
  #handleMessage(event) {
    const dtos = JSON.parse(event.data);
    const talks = dtos.map((dto) => Talk.create(dto));
    this.dispatchEvent(new TalksUpdatedEvent(talks));
  }
}

async function fetchStub() {}
