// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

import { Comment, Talk } from './talks.js';

export class SubmitTalkCommand {
  /**
   * @param {Partial<SubmitTalkCommand>} command
   */
  static create({ title, presenter, summary } = {}) {
    return new SubmitTalkCommand(title, presenter, summary);
  }

  /**
   * @param {Partial<SubmitTalkCommand>} command
   */
  static createTestInstance({
    title = 'Talk test title',
    presenter = 'Talk test presenter',
    summary = 'Talk test summary.',
  } = {}) {
    return new SubmitTalkCommand(title, presenter, summary);
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
}

export class AddCommentCommand {
  /**
   * @param {Partial<AddCommentCommand>} command
   */
  static create({ title, comment } = {}) {
    return new AddCommentCommand(title, comment);
  }

  /**
   * @param {Partial<AddCommentCommand>} command
   */
  static createTestInstance({
    title = 'Talk test title',
    comment = Comment.createTestInstance(),
  } = {}) {
    return new AddCommentCommand(title, comment);
  }

  /**
   * @param {string} title
   * @param {Comment} comment
   */
  constructor(title, comment) {
    this.title = title;
    this.comment = comment;
  }
}

export class DeleteTalkCommand {
  /**
   * @param {Partial<DeleteTalkCommand>} command
   */
  static create({ title } = {}) {
    return new DeleteTalkCommand(title);
  }

  /**
   * @param {Partial<DeleteTalkCommand>} command
   */
  static createTestInstance({ title = 'Talk test title' } = {}) {
    return new DeleteTalkCommand(title);
  }

  /**
   * @param {string} title
   */
  constructor(title) {
    this.title = title;
  }
}

export class TalksQuery {
  /**
   * @param {Partial<TalksQuery>} query
   */
  static create({ title } = {}) {
    return new TalksQuery(title);
  }

  /**
   * @param {Partial<TalksQuery>} query
   */
  static createTestInstance({ title = 'Talk test title' } = {}) {
    return new TalksQuery(title);
  }

  /**
   * @param {string} [title]
   */
  constructor(title) {
    this.title = title;
  }
}

export class TalksQueryResult {
  /**
   * @param {Partial<TalksQueryResult>} result
   */
  static create({ talks = [] } = {}) {
    return new TalksQueryResult(talks);
  }

  /**
   * @param {Partial<TalksQueryResult>} result
   */
  static createTestInstance({ talks = [Talk.createTestInstance()] } = {}) {
    return new TalksQueryResult(talks);
  }

  /**
   * @param {Partial<TalksQueryResult>} result
   */
  static createTestInstanceWithComment({
    talks = [Talk.createTestInstanceWithComment()],
  } = {}) {
    return new TalksQueryResult(talks);
  }

  /**
   * @param {Talk[]} talks
   */
  constructor(talks) {
    this.talks = talks;
  }
}
