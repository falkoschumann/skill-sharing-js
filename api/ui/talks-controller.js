// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

/**
 * @typedef {import('express').Express} express.Express
 * @typedef {import('express').Request} express.Request
 * @typedef {import('express').Response} express.Response
 *
 * @typedef {import('../application/service.js').Service} Service
 */

import { ValidationError } from '@muspellheim/shared';
import {
  LongPolling,
  runSafe,
  reply,
  SseEmitter,
} from '@muspellheim/shared/node';

import {
  AddCommentCommand,
  DeleteTalkCommand,
  SubmitTalkCommand,
  TalksQuery,
} from '../../shared/messages.js';

export class TalksController {
  /** @type {Service} services */
  #services;

  /** @type {LongPolling} */
  #longPolling;

  /**
   * @param {express.Express} app
   * @param {Service} services
   */
  constructor(app, services) {
    this.#services = services;

    // TODO Align long polling with SSE emitter
    this.#longPolling = new LongPolling(async () => {
      const result = await this.#services.getTalks();
      return result.talks;
    });

    app.get('/api/talks', runSafe(this.#getTalks.bind(this)));
    app.get('/api/talks/:title', runSafe(this.#getTalks.bind(this)));
    app.get('/api/talks/events', runSafe(this.#eventStreamTalks.bind(this)));
    app.put('/api/talks/:title', runSafe(this.#putTalk.bind(this)));
    app.delete('/api/talks/:title', runSafe(this.#deleteTalk.bind(this)));
    app.post(
      '/api/talks/:title/comments',
      runSafe(this.#postComment.bind(this)),
    );
  }

  /**
   * @param {express.Request} request
   * @param {express.Response} response
   */
  async #getTalks(request, response) {
    // TODO Handle WebSocket
    const query = TalksQueryDto.from(request).validate();
    if (query.title != null) {
      const result = await this.#services.getTalks(query);
      if (result.talks.length > 0) {
        reply(response, {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(result.talks[0]),
        });
      } else {
        reply(response, {
          status: 404,
          body: `Talk not found: "${query.title}".`,
        });
      }
    } else if (request.headers.accept === 'text/event-stream') {
      await this.#eventStreamTalks(request, response);
    } else {
      await this.#longPolling.poll(request, response);
    }
  }

  /**
   * @param {express.Request} request
   * @param {express.Response} response
   */
  async #eventStreamTalks(request, response) {
    // TODO send talks to client when updated
    const emitter = new SseEmitter();
    emitter.extendResponse(response);
    const result = await this.#services.getTalks();
    emitter.send(result.talks);
  }

  /**
   * @param {express.Request} request
   * @param {express.Response} response
   */
  async #putTalk(request, response) {
    try {
      const command = SubmitTalkCommandDto.from(request).validate();
      await this.#services.submitTalk(command);
      await this.#longPolling.send();
      reply(response, { status: 204 });
    } catch (error) {
      if (error instanceof ValidationError) {
        reply(response, { status: 400, body: error.message });
      } else {
        throw error;
      }
    }
  }

  /**
   * @param {express.Request} request
   * @param {express.Response} response
   */
  async #deleteTalk(request, response) {
    const command = DeleteTalkCommandDto.from(request).validate();
    await this.#services.deleteTalk(command);
    await this.#longPolling.send();
    reply(response, { status: 204 });
  }

  /**
   * @param {express.Request} request
   * @param {express.Response} response
   */
  async #postComment(request, response) {
    try {
      const command = AddCommentCommandDto.from(request).validate();
      const status = await this.#services.addComment(command);
      if (status.isSuccess) {
        await this.#longPolling.send();
        reply(response, { status: 204 });
      } else {
        reply(response, { status: 404, body: status.errorMessage });
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        reply(response, { status: 400, body: error.message });
      } else {
        throw error;
      }
    }
  }
}

class TalksQueryDto {
  /**
   * @param {express.Request} request
   */
  static from(request) {
    const title =
      request.params.title != null
        ? decodeURIComponent(request.params.title)
        : undefined;
    return new TalksQueryDto(title);
  }

  /**
   * @param {string} [title]
   */
  constructor(title) {
    this.title = title;
  }

  /**
   * @returns {TalksQuery}
   */
  validate() {
    return TalksQuery.create({ title: this.title });
  }
}

class SubmitTalkCommandDto {
  /**
   * @param {express.Request} request
   */
  static from(request) {
    const title = decodeURIComponent(request.params.title);
    const { presenter, summary } = request.body;
    return new SubmitTalkCommandDto(title, presenter, summary);
  }

  /**
   * @param {string} title
   * @param {string} presenter
   * @param {string} summary
   */
  constructor(title, presenter, summary) {
    this.title = title;
    this.presenter = presenter;
    this.summary = summary;
  }

  /**
   * @returns {SubmitTalkCommand}
   */
  validate() {
    if (
      typeof this.presenter !== 'string' ||
      typeof this.summary !== 'string'
    ) {
      throw new ValidationError('Bad submit talk command.');
    }

    return SubmitTalkCommand.create({
      title: this.title,
      presenter: this.presenter,
      summary: this.summary,
    });
  }
}

class DeleteTalkCommandDto {
  /**
   * @param {express.Request} request
   */
  static from(request) {
    const title = decodeURIComponent(request.params.title);
    return new DeleteTalkCommandDto(title);
  }

  /**
   * @param {string} [title]
   */
  constructor(title) {
    this.title = title;
  }

  /**
   * @returns {DeleteTalkCommand}
   */
  validate() {
    return DeleteTalkCommand.create({ title: this.title });
  }
}

class AddCommentCommandDto {
  /**
   * @param {express.Request} request
   */
  static from(request) {
    const title = decodeURIComponent(request.params.title);
    const { author, message } = request.body;
    return new AddCommentCommandDto(title, author, message);
  }

  /**
   * @param {string} title
   * @param {string} author
   * @param {string} message
   */
  constructor(title, author, message) {
    this.title = title;
    this.author = author;
    this.message = message;
  }

  /**
   * @returns {AddCommentCommand}
   */
  validate() {
    if (typeof this.author !== 'string' || typeof this.message !== 'string') {
      throw new ValidationError('Bad add comment command.');
    }

    return AddCommentCommand.create({
      title: this.title,
      comment: {
        author: this.author,
        message: this.message,
      },
    });
  }
}
