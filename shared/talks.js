// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

export class Talk {
  /**
   * @param {Partial<Talk>} talk
   */
  static create({ title, presenter, summary, comments = [] } = {}) {
    return new Talk(title, presenter, summary, comments);
  }

  /**
   * @param {Partial<Talk>} talk
   */
  static createTestInstance({
    title = 'Talk test title',
    presenter = 'Talk test presenter',
    summary = 'Talk test summary.',
    comments = [],
  } = {}) {
    return new Talk(title, presenter, summary, comments);
  }

  /**
   * @param {Partial<Talk>} talk
   */
  static createTestInstanceWithComment({
    title = 'Talk test title',
    presenter = 'Talk test presenter',
    summary = 'Talk test summary.',
    comments = [Comment.createTestInstance()],
  } = {}) {
    return new Talk(title, presenter, summary, comments);
  }

  /**
   * @param {string} title
   * @param {string} presenter
   * @param {string} summary
   * @param {Comment[]} comments
   */
  constructor(title, presenter, summary, comments) {
    this.title = title;
    this.presenter = presenter;
    this.summary = summary;
    this.comments = comments;
  }

  /**
   * @param {Comment} comment
   */
  addComment(comment) {
    this.comments.push(comment);
  }
}

export class Comment {
  /**
   * @param {Partial<Comment>} comment
   */
  static create({ author, message } = {}) {
    return new Comment(author, message);
  }

  /**
   * @param {Partial<Comment>} talk
   */
  static createTestInstance({
    author = 'Comment test author',
    message = 'Comment test message',
  } = {}) {
    return new Comment(author, message);
  }

  /**
   * @param {string} author
   * @param {string} message
   */
  constructor(author, message) {
    this.author = author;
    this.message = message;
  }
}
