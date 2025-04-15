// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

// TODO write tests

export function validateTalk(talk) {
  if (
    talk == null ||
    typeof talk.title !== "string" ||
    typeof talk.presenter !== "string" ||
    typeof talk.summary !== "string" ||
    !Array.isArray(talk.comments)
  ) {
    return false;
  }

  const comments = talk.comments.map((comment) => validateComment(comment));
  if (comments.some((comment) => comment === false)) {
    return false;
  }

  return {
    title: talk.title,
    presenter: talk.presenter,
    summary: talk.summary,
    comments,
  };
}

export function validateComment(comment) {
  if (
    comment == null ||
    typeof comment.author !== "string" ||
    typeof comment.message !== "string"
  ) {
    return false;
  }

  return {
    author: comment.author,
    message: comment.message,
  };
}

// TODO remove classes

export class Talk {
  static create({ title, presenter, summary, comments = [] } = {}) {
    return new Talk(title, presenter, summary, comments);
  }

  static createTestInstance({
    title = "Talk test title",
    presenter = "Talk test presenter",
    summary = "Talk test summary.",
    comments = [],
  } = {}) {
    return new Talk(title, presenter, summary, comments);
  }

  static createTestInstanceWithComment({
    title = "Talk test title",
    presenter = "Talk test presenter",
    summary = "Talk test summary.",
    comments = [Comment.createTestInstance()],
  } = {}) {
    return new Talk(title, presenter, summary, comments);
  }

  constructor(title, presenter, summary, comments) {
    this.title = title;
    this.presenter = presenter;
    this.summary = summary;
    this.comments = comments;
  }

  addComment(comment) {
    this.comments.push(comment);
  }
}

export class Comment {
  static create({ author, message } = {}) {
    return new Comment(author, message);
  }

  static createTestInstance({
    author = "Comment test author",
    message = "Comment test message",
  } = {}) {
    return new Comment(author, message);
  }

  constructor(author, message) {
    this.author = author;
    this.message = message;
  }
}
