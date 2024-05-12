import { Talk } from '../domain/talks.js';
import { OutputTracker } from '../util/output-tracker.js';
import { LongPollingClient } from './long-polling-client.js';

const TALKS_UPDATED_EVENT = 'talks-updated';
const TALK_PUT_EVENT = 'talk-put';
const TALK_DELETED_EVENT = 'talk-deleted';
const COMMENT_POSTED_EVENT = 'comment-posted';

export class TalksUpdatedEvent extends Event {
  constructor(talks) {
    super(TALKS_UPDATED_EVENT);
    this.talks = talks;
  }
}

export class Api extends EventTarget {
  static create() {
    return new Api(
      globalThis.fetch.bind(globalThis),
      LongPollingClient.create(),
    );
  }

  static createNull() {
    return new Api(fetchStub, LongPollingClient.createNull());
  }

  #fetch;
  #talksClient;

  constructor(fetch, talksClient) {
    super();
    this.#fetch = fetch;
    this.#talksClient = talksClient;
  }

  async connectTalks() {
    await this.#talksClient.connect((event) => {
      const talks = event.data.map((talk) => Talk.create(talk));
      this.dispatchEvent(new TalksUpdatedEvent(talks));
    });
  }

  async putTalk({ title, presenter, summary }) {
    const body = JSON.stringify({ presenter, summary });
    await this.#fetch(`/api/talks/${encodeURIComponent(title)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    this.dispatchEvent(
      new CustomEvent(TALK_PUT_EVENT, {
        detail: { title, presenter, summary },
      }),
    );
  }

  trackTalksPut() {
    return OutputTracker.create(this, TALK_PUT_EVENT);
  }

  async deleteTalk(title) {
    await this.#fetch(`/api/talks/${encodeURIComponent(title)}`, {
      method: 'DELETE',
    });
    this.dispatchEvent(
      new CustomEvent(TALK_DELETED_EVENT, { detail: { title } }),
    );
  }

  trackTalksDeleted() {
    return OutputTracker.create(this, TALK_DELETED_EVENT);
  }

  async postComment(title, { author, message }) {
    const body = JSON.stringify({ author, message });
    await this.#fetch(`/api/talks/${encodeURIComponent(title)}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    this.dispatchEvent(
      new CustomEvent(COMMENT_POSTED_EVENT, {
        detail: { title, author, message },
      }),
    );
  }

  trackCommentsPosted() {
    return OutputTracker.create(this, COMMENT_POSTED_EVENT);
  }
}

async function fetchStub() {}
