// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

/**
 * @typedef {import('../../shared/messages.js').AddCommentCommand} AddCommentCommand
 * @typedef {import('../../shared/messages.js').DeleteTalkCommand} DeleteTalkCommand
 * @typedef {import('../../shared/messages.js').SubmitTalkCommand} SubmitTalkCommand
 * @typedef {import('../../shared/messages.js').TalksQuery} TalksQuery
 * @typedef {import('../infrastructure/repository.js').RepositoryConfiguration} RepositoryConfiguration
 */

import { CommandStatus, TalksQueryResult } from '../../shared/messages.js';
import { Talk } from '../../shared/talks.js';
import { Repository } from '../infrastructure/repository.js';

// TODO Handle errors
// TODO Add logging
// TODO Add validation
// TODO Add metrics

export class Service {
  /**
   * @param {{repository: RepositoryConfiguration}} configuration
   */
  static create(configuration) {
    const repository = Repository.create(configuration.repository);
    return new Service(repository);
  }

  /**
   * @param {{talks?: Talk[]}} options
   */
  static createNull({ talks } = {}) {
    const repository = Repository.createNull({ talks });
    return new Service(repository);
  }

  /** @type {Repository} */
  #repository;

  /**
   * @param {Repository} repository
   */
  constructor(repository) {
    this.#repository = repository;
  }

  /**
   * @param {SubmitTalkCommand} command
   */
  async submitTalk(command) {
    const talk = Talk.create(command);
    await this.#repository.addOrUpdate(talk);
    return CommandStatus.success();
  }

  /**
   * @param {AddCommentCommand} command
   */
  async addComment(command) {
    const talk = await this.#repository.findByTitle(command.title);
    if (talk == null) {
      return CommandStatus.failure(
        `The comment cannot be added because the talk "${command.title}" does not exist.`,
      );
    }

    talk.addComment(command.comment);
    await this.#repository.addOrUpdate(talk);
    return CommandStatus.success();
  }

  /**
   * @param {DeleteTalkCommand} command
   */
  async deleteTalk(command) {
    await this.#repository.remove(command.title);
    return CommandStatus.success();
  }

  /**
   * @param {TalksQuery=} query
   */
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
