// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import {
  CommandStatus,
  TalksQueryResult,
} from "../../public/js/domain/messages.js";
import { Talk } from "../../public/js/domain/talks.js";
import { Repository } from "../infrastructure/repository.js";

// TODO Handle errors
// TODO Add logging
// TODO Add validation

export const TALKS_CHANGED_EVENT = "talks-changed";

export class Service extends EventTarget {
  static create(configuration) {
    const repository = Repository.create(configuration.repository);
    return new Service(repository);
  }

  static createNull({ talks } = {}) {
    const repository = Repository.createNull({ talks });
    return new Service(repository);
  }

  #repository;

  constructor(repository) {
    super();
    this.#repository = repository;
  }

  async submitTalk(command) {
    const talk = Talk.create(command);
    await this.#repository.addOrUpdate(talk);
    this.dispatchEvent(new Event(TALKS_CHANGED_EVENT));
    return CommandStatus.success();
  }

  async addComment(command) {
    const talk = await this.#repository.findByTitle(command.title);
    if (talk == null) {
      return CommandStatus.failure(
        `The comment cannot be added because the talk "${command.title}" does not exist.`,
      );
    }

    talk.addComment(command.comment);
    await this.#repository.addOrUpdate(talk);
    this.dispatchEvent(new Event(TALKS_CHANGED_EVENT));
    return CommandStatus.success();
  }

  async deleteTalk(command) {
    await this.#repository.remove(command.title);
    this.dispatchEvent(new Event(TALKS_CHANGED_EVENT));
    return CommandStatus.success();
  }

  async getTalks(query) {
    if (query?.title != null) {
      const talk = await this.#repository.findByTitle(query.title);
      const talks = talk ? [talk] : [];
      return TalksQueryResult.create({ talks });
    }

    const talks = await this.#repository.findAll();
    return TalksQueryResult.create({ talks });
  }
}
