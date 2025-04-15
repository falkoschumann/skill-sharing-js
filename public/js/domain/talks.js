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
