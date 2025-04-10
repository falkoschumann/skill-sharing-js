// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { SseEmitter } from "../infrastructure/sse-emitter.js";
import { reply } from "./handler.js";
import {
  AddCommentCommand,
  DeleteTalkCommand,
  SubmitTalkCommand,
  TalksQuery,
} from "../../public/js/domain/messages.js";
import { ValidationError } from "../util/validation.js";

export class TalksController {
  #services;

  constructor(app, services) {
    this.#services = services;

    app.get("/api/talks", this.#getTalks.bind(this));
    app.get("/api/talks/:title", this.#getTalks.bind(this));
    app.get("/api/talks/events", this.#eventStreamTalks.bind(this));
    app.put("/api/talks/:title", this.#putTalk.bind(this));
    app.delete("/api/talks/:title", this.#deleteTalk.bind(this));
    app.post("/api/talks/:title/comments", this.#postComment.bind(this));
  }

  async #getTalks(request, response) {
    const query = TalksQueryDto.from(request).validate();
    if (query.title != null) {
      const result = await this.#services.getTalks(query);
      if (result.talks.length > 0) {
        reply(response, {
          status: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(result.talks[0]),
        });
      } else {
        reply(response, {
          status: 404,
          body: `Talk not found: "${query.title}".`,
        });
      }
    } else if (request.headers.accept === "text/event-stream") {
      await this.#eventStreamTalks(request, response);
    } else {
      const result = await this.#services.getTalks();
      reply(response, {
        status: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(result.talks),
      });
    }
  }

  async #eventStreamTalks(request, response) {
    // TODO send talks to client when updated
    const emitter = new SseEmitter();
    emitter.extendResponse(response);
    const result = await this.#services.getTalks();
    emitter.send(result.talks);
  }

  async #putTalk(request, response) {
    try {
      const command = SubmitTalkCommandDto.from(request).validate();
      await this.#services.submitTalk(command);
      reply(response, { status: 204 });
    } catch (error) {
      if (error instanceof ValidationError) {
        reply(response, { status: 400, body: error.message });
      } else {
        throw error;
      }
    }
  }

  async #deleteTalk(request, response) {
    const command = DeleteTalkCommandDto.from(request).validate();
    await this.#services.deleteTalk(command);
    reply(response, { status: 204 });
  }

  async #postComment(request, response) {
    try {
      const command = AddCommentCommandDto.from(request).validate();
      const status = await this.#services.addComment(command);
      if (status.isSuccess) {
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
  static from(request) {
    const title =
      request.params.title != null
        ? decodeURIComponent(request.params.title)
        : undefined;
    return new TalksQueryDto(title);
  }

  constructor(title) {
    this.title = title;
  }

  validate() {
    return TalksQuery.create({ title: this.title });
  }
}

class SubmitTalkCommandDto {
  static from(request) {
    const title = decodeURIComponent(request.params.title);
    const { presenter, summary } = request.body;
    return new SubmitTalkCommandDto(title, presenter, summary);
  }

  constructor(title, presenter, summary) {
    this.title = title;
    this.presenter = presenter;
    this.summary = summary;
  }

  validate() {
    if (
      typeof this.presenter !== "string" ||
      typeof this.summary !== "string"
    ) {
      throw new ValidationError("Bad submit talk command.");
    }

    return SubmitTalkCommand.create({
      title: this.title,
      presenter: this.presenter,
      summary: this.summary,
    });
  }
}

class DeleteTalkCommandDto {
  static from(request) {
    const title = decodeURIComponent(request.params.title);
    return new DeleteTalkCommandDto(title);
  }

  constructor(title) {
    this.title = title;
  }

  validate() {
    return DeleteTalkCommand.create({ title: this.title });
  }
}

class AddCommentCommandDto {
  static from(request) {
    const title = decodeURIComponent(request.params.title);
    const { author, message } = request.body;
    return new AddCommentCommandDto(title, author, message);
  }

  constructor(title, author, message) {
    this.title = title;
    this.author = author;
    this.message = message;
  }

  validate() {
    if (typeof this.author !== "string" || typeof this.message !== "string") {
      throw new ValidationError("Bad add comment command.");
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
