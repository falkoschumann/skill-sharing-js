// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { failure, success } from "../../public/js/domain/messages.js";
import { Repository } from "../infrastructure/repository.js";
import { ConsoleGateway } from "../../public/js/infrastructure/console_gateway.js";

export const TALKS_CHANGED_EVENT = "talks-changed";

export class Service extends EventTarget {
  static create(configuration) {
    const repository = Repository.create(configuration.repository);
    return new Service(repository, ConsoleGateway.create());
  }

  static createNull({ talks } = {}) {
    const repository = Repository.createNull({ talks });
    return new Service(repository, ConsoleGateway.createNull());
  }

  #repository;
  #console;

  constructor(repository, console) {
    super();
    this.#repository = repository;
    this.#console = console;
  }

  async submitTalk(command) {
    this.#console.info("Submit talk", command);

    await this.#repository.addOrUpdate({ ...command, comments: [] });
    this.dispatchEvent(new Event(TALKS_CHANGED_EVENT));
    return success();
  }

  async addComment(command) {
    this.#console.info("Add comment", command);

    let talk = await this.#repository.findByTitle(command.title);
    if (talk == null) {
      return failure(
        `The comment cannot be added because the talk "${command.title}" does not exist.`,
      );
    }

    talk = { ...talk, comments: [...talk.comments, command.comment] };
    await this.#repository.addOrUpdate(talk);
    this.dispatchEvent(new Event(TALKS_CHANGED_EVENT));
    return success();
  }

  async deleteTalk(command) {
    this.#console.info("Delete talk", command);

    await this.#repository.remove(command.title);
    this.dispatchEvent(new Event(TALKS_CHANGED_EVENT));
    return success();
  }

  async queryTalks(query) {
    this.#console.info("Query talks", query);

    if (query?.title != null) {
      const talk = await this.#repository.findByTitle(query.title);
      const talks = talk ? [talk] : [];
      return { talks };
    }

    const talks = await this.#repository.findAll();
    return { talks };
  }
}
