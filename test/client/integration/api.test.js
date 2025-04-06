// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import { Api } from "../../../public/js/infrastructure/api.js";
import { SseClient } from "../../../public/js/infrastructure/sse-client.js";
import { Comment, Talk } from "../../../shared/talks.js";
import {
  AddCommentCommand,
  DeleteTalkCommand,
  SubmitTalkCommand,
} from "../../../shared/messages.js";

describe("API", () => {
  it("Gets talks", async () => {
    const talk = Talk.createTestInstance();
    const client = SseClient.createNull({
      fetchResponse: {
        status: 200,
        headers: { etag: "1" },
        body: JSON.stringify([talk]),
      },
    });
    const api = new Api(client, null);
    const events = [];
    const result = new Promise((resolve) =>
      client.addEventListener("message", () => resolve()),
    );
    api.addEventListener("talks-updated", (event) => events.push(event));

    await api.connect();
    await result;

    expect(events).toEqual([
      expect.objectContaining({
        talks: [talk],
      }),
    ]);
    client.close();
  });

  it("Submits talk", async () => {
    const api = Api.createNull();
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
    const api = Api.createNull();
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
    const api = Api.createNull();
    const talksDeleted = api.trackTalksDeleted();

    await api.deleteTalk(DeleteTalkCommand.create({ title: "title-1" }));

    expect(talksDeleted.data).toEqual([{ title: "title-1" }]);
  });
});
