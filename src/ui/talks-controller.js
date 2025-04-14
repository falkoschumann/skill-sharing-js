// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { SseEmitter } from "../infrastructure/sse-emitter.js";
import {
  AddCommentCommand,
  DeleteTalkCommand,
  SubmitTalkCommand,
  TalksQuery,
} from "../../public/js/domain/messages.js";
import { TALKS_CHANGED_EVENT } from "../application/service.js";

export class TalksController {
  #services;

  constructor(app, services) {
    this.#services = services;

    app.get("/api/talks", this.#getTalks.bind(this));
    app.get("/api/talks/:title", this.#getTalks.bind(this));
    app.put("/api/talks/:title", this.#putTalk.bind(this));
    app.delete("/api/talks/:title", this.#deleteTalk.bind(this));
    app.post("/api/talks/:title/comments", this.#postComment.bind(this));
  }

  async #getTalks(request, response) {
    const query = validateTalksQuery(request);
    if (query.title != null) {
      const result = await this.#services.getTalks(query);
      if (result.talks.length > 0) {
        response.status(200).send(result.talks[0]);
      } else {
        response
          .status(404)
          .set("Content-Type", "text/plain")
          .send(`Talk not found: "${query.title}".`);
      }
    } else if (request.headers.accept === "text/event-stream") {
      await this.#eventStreamTalks(request, response);
    } else {
      const result = await this.#services.getTalks();
      response.status(200).send(result.talks);
    }
  }

  async #eventStreamTalks(request, response) {
    const emitter = new SseEmitter();
    emitter.extendResponse(response);
    this.#services.addEventListener(TALKS_CHANGED_EVENT, async () =>
      this.#sendTalksUpdatedEvent(emitter),
    );
    await this.#sendTalksUpdatedEvent(emitter);
  }

  async #sendTalksUpdatedEvent(emitter) {
    const result = await this.#services.getTalks();
    emitter.send({ data: result.talks });
  }

  async #putTalk(request, response) {
    const command = validateSubmitTalkCommand(request);
    if (!command) {
      response
        .status(400)
        .set("Content-Type", "text/plain")
        .send("Bad submit talk command.");
      return;
    }

    await this.#services.submitTalk(command);
    response.status(204).send();
  }

  async #deleteTalk(request, response) {
    const command = validateDeleteTalkCommand(request);
    await this.#services.deleteTalk(command);
    response.status(204).send();
  }

  async #postComment(request, response) {
    const command = validateAddCommentCommand(request);
    if (!command) {
      response
        .status(400)
        .set("Content-Type", "text/plain")
        .send("Bad add comment command.");
      return;
    }

    const status = await this.#services.addComment(command);
    if (status.isSuccess) {
      response.status(204).send();
    } else {
      response
        .status(404)
        .set("Content-Type", "text/plain")
        .send(status.errorMessage);
    }
  }
}

// TODO Move validation to the domain layer

function validateTalksQuery(request) {
  const title =
    request.params.title != null
      ? decodeURIComponent(request.params.title)
      : undefined;
  return TalksQuery.create({ title });
}

function validateSubmitTalkCommand(request) {
  const title = decodeURIComponent(request.params.title);
  const { presenter, summary } = request.body;
  if (typeof presenter !== "string" || typeof summary !== "string") {
    return false;
  }

  return SubmitTalkCommand.create({ title, presenter, summary });
}

function validateDeleteTalkCommand(request) {
  const title = decodeURIComponent(request.params.title);
  return DeleteTalkCommand.create({ title });
}

function validateAddCommentCommand(request) {
  const title = decodeURIComponent(request.params.title);
  const { author, message } = request.body;
  if (typeof author !== "string" || typeof message !== "string") {
    return false;
  }

  return AddCommentCommand.create({ title, comment: { author, message } });
}
