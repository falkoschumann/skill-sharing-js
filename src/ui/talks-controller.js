// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { SseEmitter } from "../infrastructure/sse-emitter.js";
import {
  validateAddCommentCommand,
  validateDeleteTalkCommand,
  validateSubmitTalkCommand,
  validateTalksQuery,
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
    const title =
      request.params.title != null
        ? decodeURIComponent(request.params.title)
        : undefined;
    const query = validateTalksQuery({ title });
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
    const title = decodeURIComponent(request.params.title);
    const body = request.body;
    const command = validateSubmitTalkCommand({ ...body, title });
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
    const title = decodeURIComponent(request.params.title);
    const command = validateDeleteTalkCommand({ title });
    await this.#services.deleteTalk(command);
    response.status(204).send();
  }

  async #postComment(request, response) {
    const title = decodeURIComponent(request.params.title);
    const command = validateAddCommentCommand({ title, comment: request.body });
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
