// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export function createTestTalk({
  title = "Talk test title",
  presenter = "Talk test presenter",
  summary = "Talk test summary.",
  comments = [],
} = {}) {
  return { title, presenter, summary, comments };
}

export function createTestTalkWithComment({
  title = "Talk test title",
  presenter = "Talk test presenter",
  summary = "Talk test summary.",
  comments = [createTestComment()],
} = {}) {
  return { title, presenter, summary, comments };
}

export function createTestComment({
  author = "Comment test author",
  message = "Comment test message",
} = {}) {
  return { author, message };
}

export function createTestSubmitTalkCommand({
  title = "Talk test title",
  presenter = "Talk test presenter",
  summary = "Talk test summary.",
} = {}) {
  return { title, presenter, summary };
}

export function createTestAddCommentCommand({
  title = "Talk test title",
  comment = createTestComment(),
} = {}) {
  return { title, comment };
}

export function createTestDeleteTalkCommand({
  title = "Talk test title",
} = {}) {
  return { title };
}

export function createTestTalksQuery({ title = "Talk test title" } = {}) {
  return { title };
}

export function createTestTalksQueryResult({
  talks = [createTestTalk()],
} = {}) {
  return { talks };
}

export function createTestTalksQueryResultWithComment({
  talks = [createTestTalkWithComment()],
} = {}) {
  return { talks };
}
