// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import {
  validateAddCommentCommand,
  validateDeleteTalkCommand,
  validateSubmitTalkCommand,
} from "../../../public/js/domain/messages.js";
import { validateComment } from "../../../public/js/domain/talks.js";
import { Api } from "../../../public/js/infrastructure/api.js";
import { SseClient } from "../../../public/js/infrastructure/sse_client.js";
import { createTestTalk } from "../../data/testdata.js";

describe("API", () => {
  it("Gets talks", async () => {
    const { api, sseClient } = configure();
    const events = [];
    const result = new Promise((resolve) =>
      sseClient.addEventListener("message", () => resolve()),
    );
    api.addEventListener("talks-updated", (event) => events.push(event));

    await api.connect();
    sseClient.simulateMessage(JSON.stringify([createTestTalk()]));
    await result;

    expect(events).toEqual([
      expect.objectContaining({
        talks: [createTestTalk()],
      }),
    ]);
  });

  it("Submits talk", async () => {
    const { api } = configure();
    const talksPut = api.trackTalksSubmitted();

    await api.submitTalk(
      validateSubmitTalkCommand({
        title: "title-1",
        presenter: "presenter-1",
        summary: "summary-1",
      }),
    );

    expect(talksPut.data).toEqual([
      { title: "title-1", presenter: "presenter-1", summary: "summary-1" },
    ]);
  });

  it("Posts comment", async () => {
    const { api } = configure();
    const commentsPosted = api.trackCommentsAdded();

    await api.addComment(
      validateAddCommentCommand({
        title: "title-1",
        comment: validateComment({
          author: "author-1",
          message: "message-1",
        }),
      }),
    );

    expect(commentsPosted.data).toEqual([
      {
        title: "title-1",
        comment: { author: "author-1", message: "message-1" },
      },
    ]);
  });

  it("Deletes talk", async () => {
    const { api } = configure();
    const talksDeleted = api.trackTalksDeleted();

    await api.deleteTalk(validateDeleteTalkCommand({ title: "title-1" }));

    expect(talksDeleted.data).toEqual([{ title: "title-1" }]);
  });
});

function configure() {
  const sseClient = SseClient.createNull();
  const api = new Api(sseClient, () => {});
  return { api, sseClient };
}
