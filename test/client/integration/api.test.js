// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import { Comment, Talk } from "../../../public/js/domain/talks.js";
import {
  AddCommentCommand,
  DeleteTalkCommand,
  SubmitTalkCommand,
} from "../../../public/js/domain/messages.js";
import { Api } from "../../../public/js/infrastructure/api.js";
import { SseClient } from "../../../public/js/infrastructure/sse-client.js";

describe("API", () => {
  it("Gets talks", async () => {
    const { api, sseClient } = configure();
    const events = [];
    const result = new Promise((resolve) =>
      sseClient.addEventListener("message", () => resolve()),
    );
    api.addEventListener("talks-updated", (event) => events.push(event));

    await api.connect();
    sseClient.simulateMessage(JSON.stringify([Talk.createTestInstance()]));
    await result;

    expect(events).toEqual([
      expect.objectContaining({
        talks: [Talk.createTestInstance()],
      }),
    ]);
  });

  it("Submits talk", async () => {
    const { api } = configure();
    const talksPut = api.trackTalksSubmitted();

    await api.submitTalk(
      SubmitTalkCommand.create({
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
      AddCommentCommand.create({
        title: "title-1",
        comment: Comment.create({
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

    await api.deleteTalk(DeleteTalkCommand.create({ title: "title-1" }));

    expect(talksDeleted.data).toEqual([{ title: "title-1" }]);
  });
});

function configure() {
  const sseClient = SseClient.createNull();
  const api = new Api(sseClient, () => {});
  return { api, sseClient };
}
