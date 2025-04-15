// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import {
  failure,
  success,
  validateSubmitTalkCommand,
  validateTalksQueryResult,
} from "../../public/js/domain/messages.js";
import { Repository } from "../infrastructure/repository.js"; // TODO Handle errors

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
    const talk = validateSubmitTalkCommand(command);
    await this.#repository.addOrUpdate({ ...talk, comments: [] });
    this.dispatchEvent(new Event(TALKS_CHANGED_EVENT));
    return success();
  }

  async addComment(command) {
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
    await this.#repository.remove(command.title);
    this.dispatchEvent(new Event(TALKS_CHANGED_EVENT));
    return success();
  }

  async getTalks(query) {
    if (query?.title != null) {
      const talk = await this.#repository.findByTitle(query.title);
      const talks = talk ? [talk] : [];
      return validateTalksQueryResult({ talks });
    }

    const talks = await this.#repository.findAll();
    return validateTalksQueryResult({ talks });
  }
}
