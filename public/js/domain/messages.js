// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { Comment, Talk } from "./talks.js";

export class SubmitTalkCommand {
  static create({ title, presenter, summary } = {}) {
    return new SubmitTalkCommand(title, presenter, summary);
  }

  static createTestInstance({
    title = "Talk test title",
    presenter = "Talk test presenter",
    summary = "Talk test summary.",
  } = {}) {
    return new SubmitTalkCommand(title, presenter, summary);
  }

  constructor(title, presenter, summary) {
    this.title = title;
    this.presenter = presenter;
    this.summary = summary;
  }
}

export class AddCommentCommand {
  static create({ title, comment } = {}) {
    return new AddCommentCommand(title, comment);
  }

  static createTestInstance({
    title = "Talk test title",
    comment = Comment.createTestInstance(),
  } = {}) {
    return new AddCommentCommand(title, comment);
  }

  constructor(title, comment) {
    this.title = title;
    this.comment = comment;
  }
}

export class DeleteTalkCommand {
  static create({ title } = {}) {
    return new DeleteTalkCommand(title);
  }

  static createTestInstance({ title = "Talk test title" } = {}) {
    return new DeleteTalkCommand(title);
  }

  constructor(title) {
    this.title = title;
  }
}

export class CommandStatus {
  static success() {
    return new CommandStatus(true);
  }

  static failure(errorMessage) {
    return new CommandStatus(false, errorMessage);
  }

  isSuccess;

  errorMessage;

  constructor(isSuccess, errorMessage) {
    this.isSuccess = isSuccess;
    this.errorMessage = errorMessage;
  }
}

export class TalksQuery {
  static create({ title } = {}) {
    return new TalksQuery(title);
  }

  static createTestInstance({ title = "Talk test title" } = {}) {
    return new TalksQuery(title);
  }

  constructor(title) {
    this.title = title;
  }
}

export class TalksQueryResult {
  static create({ talks = [] } = {}) {
    return new TalksQueryResult(talks);
  }

  static createTestInstance({ talks = [Talk.createTestInstance()] } = {}) {
    return new TalksQueryResult(talks);
  }

  static createTestInstanceWithComment({
    talks = [Talk.createTestInstanceWithComment()],
  } = {}) {
    return new TalksQueryResult(talks);
  }

  constructor(talks) {
    this.talks = talks;
  }
}
