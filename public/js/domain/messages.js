// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { validateComment, validateTalk } from "./talks.js";

export function success() {
  return { isSuccess: true };
}

export function failure(errorMessage) {
  return { isSuccess: false, errorMessage };
}

export function validateSubmitTalkCommand(command) {
  if (
    command == null ||
    typeof command.title !== "string" ||
    typeof command.presenter !== "string" ||
    typeof command.summary !== "string"
  ) {
    return false;
  }

  return {
    title: command.title,
    presenter: command.presenter,
    summary: command.summary,
  };
}

export function validateAddCommentCommand(command) {
  if (
    command == null ||
    typeof command.title !== "string" ||
    !validateComment(command.comment)
  ) {
    return false;
  }

  return {
    title: command.title,
    comment: {
      author: command.comment.author,
      message: command.comment.message,
    },
  };
}

export function validateDeleteTalkCommand(command) {
  if (command == null || typeof command.title !== "string") {
    return false;
  }

  return { title: command.title };
}

export function validateCommandStatus(status) {
  if (
    status == null ||
    typeof status.isSuccess !== "boolean" ||
    (status.isSuccess && status.errorMessage != null) ||
    (!status.isSuccess && typeof status.errorMessage !== "string")
  ) {
    return false;
  }

  return {
    isSuccess: status.isSuccess,
    errorMessage: status.errorMessage,
  };
}

export function validateTalksQuery(query) {
  if (
    query == null ||
    (query.title != null && typeof query.title !== "string")
  ) {
    return false;
  }

  return { title: query.title };
}

export function validateTalksQueryResult(result) {
  if (result == null || !Array.isArray(result.talks)) {
    return false;
  }

  const talks = result.talks.map((talk) => validateTalk(talk));
  if (talks.some((talk) => talk === false)) {
    return false;
  }

  return { talks };
}
