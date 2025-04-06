// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import fs from "node:fs/promises";
import path from "node:path";
//import EventSource from 'eventsource';
import request from "supertest";
import { describe, expect, it } from "vitest";

import {
  AddCommentCommand,
  CommandStatus,
  DeleteTalkCommand,
  SubmitTalkCommand,
  TalksQuery,
  TalksQueryResult,
} from "../../../shared/messages.js";
import { Comment, Talk } from "../../../shared/talks.js";
import {
  ServerConfiguration,
  SkillSharingApplication,
  SkillSharingConfiguration,
} from "../../../src/ui/application.js";
import { RepositoryConfiguration } from "../../../src/infrastructure/repository.js";

describe("Application", () => {
  it("Starts and stops the app", async () => {
    await startAndStop(async () => {});
  });

  describe("Submit talk", () => {
    it("Adds talk to list", async () => {
      await startAndStop(async ({ client }) => {
        const status = await client.submitTalk(
          SubmitTalkCommand.createTestInstance(),
        );

        expect(status).toEqual(CommandStatus.success());
        const result = await client.getTalks();
        expect(result).toEqual(TalksQueryResult.createTestInstance());
      });
    });

    it("Reports an error when talk could not add", async () => {
      await startAndStop(async ({ client }) => {
        const status = await client.submitTalk(
          SubmitTalkCommand.createTestInstance({ presenter: null }),
        );

        expect(status).toEqual(
          CommandStatus.failure("Bad submit talk command."),
        );
        const result = await client.getTalks();
        expect(result).toEqual(TalksQueryResult.create());
      });
    });
  });

  describe("Add comment", () => {
    it("Adds comment to an existing talk", async () => {
      await startAndStop(async ({ client }) => {
        await client.submitTalk(SubmitTalkCommand.createTestInstance());

        const status = await client.addComment(
          AddCommentCommand.createTestInstance(),
        );

        expect(status).toEqual(CommandStatus.success());
        const result = await client.getTalks();
        expect(result).toEqual(
          TalksQueryResult.createTestInstanceWithComment(),
        );
      });
    });

    it("Reports an error when talk does not exists", async () => {
      await startAndStop(async ({ client }) => {
        await client.submitTalk(SubmitTalkCommand.createTestInstance());

        const status = await client.addComment(
          AddCommentCommand.createTestInstance({
            title: "Non existing talk",
          }),
        );

        expect(status).toEqual(
          CommandStatus.failure(
            'The comment cannot be added because the talk "Non existing talk" does not exist.',
          ),
        );
      });
    });

    it("Reports an error when comment could not add", async () => {
      await startAndStop(async ({ client }) => {
        await client.submitTalk(SubmitTalkCommand.createTestInstance());

        const status = await client.addComment(
          AddCommentCommand.createTestInstance({
            comment: Comment.createTestInstance({ author: null }),
          }),
        );

        expect(status).toEqual(
          CommandStatus.failure("Bad add comment command."),
        );
      });
    });
  });

  describe("Delete talk", () => {
    it("Deletes an existing talk", async () => {
      await startAndStop(async ({ client }) => {
        await client.submitTalk(SubmitTalkCommand.createTestInstance());

        const status = await client.deleteTalk(
          DeleteTalkCommand.createTestInstance(),
        );

        expect(status).toEqual(CommandStatus.success());
      });
    });

    it("Reports no error when talk does not exist", async () => {
      await startAndStop(async ({ client }) => {
        const status = await client.deleteTalk(
          DeleteTalkCommand.createTestInstance({
            title: "non-existing-talk",
          }),
        );

        expect(status).toEqual(CommandStatus.success());
      });
    });
  });

  describe("Talks", () => {
    it("Returns all talks", async () => {
      await startAndStop(async ({ client }) => {
        await client.submitTalk(
          SubmitTalkCommand.createTestInstance({ title: "Foo" }),
        );
        await client.addComment(
          AddCommentCommand.createTestInstance({ title: "Foo" }),
        );
        await client.submitTalk(
          SubmitTalkCommand.createTestInstance({ title: "Bar" }),
        );

        const result = await client.getTalks();

        expect(result).toEqual(
          TalksQueryResult.createTestInstance({
            talks: [
              Talk.createTestInstanceWithComment({ title: "Foo" }),
              Talk.createTestInstance({ title: "Bar" }),
            ],
          }),
        );
      });
    });

    it("Returns a single talk when client asks for a specific talk", async () => {
      await startAndStop(async ({ client }) => {
        await client.submitTalk(SubmitTalkCommand.createTestInstance());

        const result = await client.getTalks(TalksQuery.createTestInstance());

        expect(result).toEqual(TalksQueryResult.createTestInstance());
      });
    });

    it("Returns no talk when client asks for a specific talk that does not exist", async () => {
      await startAndStop(async ({ client }) => {
        await client.submitTalk(SubmitTalkCommand.createTestInstance());

        const result = await client.getTalks(
          TalksQuery.create({ title: "Non existing talk" }),
        );

        expect(result).toEqual(TalksQueryResult.create());
      });
    });
  });

  describe("Long polling", () => {
    it("Replies with talks when client asks for the first time", async () => {
      await startAndStop(async ({ url }) => {
        await submitTalk(url);

        const response = await request(url)
          .get("/api/talks")
          .set("Accept", "application/json");

        expect(response.status).toEqual(200);
        expect(response.get("Content-Type")).toMatch(/application\/json/);
        expect(response.get("Cache-Control")).toEqual("no-store");
        expect(response.get("ETag")).toEqual('"1"');
        expect(response.body).toEqual([Talk.createTestInstance()]);
      });
    });

    it("Replies with talks when client is not up to date", async () => {
      await startAndStop(async ({ url }) => {
        await submitTalk(url);

        const response = await request(url)
          .get("/api/talks")
          .set("Accept", "application/json")
          .set("If-None-Match", '"0"');

        expect(response.status).toEqual(200);
        expect(response.get("Content-Type")).toMatch(/application\/json/);
        expect(response.get("Cache-Control")).toEqual("no-store");
        expect(response.get("ETag")).toEqual('"1"');
        expect(response.body).toEqual([Talk.createTestInstance()]);
      });
    });

    it("Reports not modified when client is up to date", async () => {
      await startAndStop(async ({ url }) => {
        await submitTalk(url);

        const response = await request(url)
          .get("/api/talks")
          .set("Accept", "application/json")
          .set("If-None-Match", '"1"');

        expect(response.status).toEqual(304);
      });
    });

    it("Reports not modified when long polling results in a timeout", async () => {
      await startAndStop(async ({ url }) => {
        const responsePromise = request(url)
          .get("/api/talks")
          .set("Accept", "application/json")
          .set("Prefer", "wait=1")
          .set("If-None-Match", '"0"');
        const submitHandler = setTimeout(
          () =>
            request(url)
              .put("/api/talks/Foobar")
              .set("Content-Type", "application/json")
              .send({ presenter: "Anon", summary: "Lorem ipsum" }),
          2000,
        );
        const response = await responsePromise;

        expect(response.status).toEqual(304);
        clearTimeout(submitHandler);
      });
    });

    it("Replies talks when a talk was submitted while long polling", async () => {
      await startAndStop(async ({ url }) => {
        const timeoutId = setTimeout(() => submitTalk(url), 500);
        const response = await request(url)
          .get("/api/talks")
          .set("Accept", "application/json")
          .set("Prefer", "wait=1")
          .set("If-None-Match", '"0"');
        clearTimeout(timeoutId);

        expect(response.status).toEqual(200);
        expect(response.get("Content-Type")).toMatch(/application\/json/);
        expect(response.get("Cache-Control")).toEqual("no-store");
        expect(response.get("ETag")).toEqual('"1"');
        expect(response.body).toEqual([Talk.createTestInstance()]);
      });
    });
  });

  describe("Receive talk updates", () => {
    it("Receives talk updates", async () => {
      await startAndStop(async ({ url, source }) => {
        await submitTalk(url);

        // FIXME Submitted talk is not written to disk when the event is sent
        const talks = await new Promise((resolve) => {
          source.addEventListener("message", (event) => {
            resolve(JSON.parse(event.data));
          });
        });

        expect(talks).toEqual([
          { title: "Foobar", presenter: "Anon", summary: "Lorem ipsum" },
        ]);
      });
    });
  });
});

/**
 * @param {function({ url: string, client: ServiceClient, source: EventSource }): Promise<void>} run
 */
async function startAndStop(run) {
  const fileName = path.join(
    import.meta.dirname,
    "../../../testdata/server.e2e.application.json",
  );
  await fs.rm(fileName, { force: true });

  const address = "localhost";
  const port = 3333;
  const configuration = SkillSharingConfiguration.create({
    server: ServerConfiguration.create({ address, port }),
    repository: RepositoryConfiguration.create({ fileName }),
  });

  const application = SkillSharingApplication.create(configuration);
  await application.start();
  const url = `http://${address}:${port}`;
  const client = new ServiceClient(url);
  // TODO Create EventSource only if run() needs it
  //const source = new EventSource(`${url}/api/talks`);
  const source = null;
  try {
    await run({ url, client, source });
  } finally {
    //source.close();
    await application.stop();
  }
}

class ServiceClient {
  // TODO Use fetch() instead of supertest

  #url;

  /**
   * @param {string} url
   */
  constructor(url) {
    this.#url = url;
  }

  /**
   * @param {SubmitTalkCommand} command
   */
  async submitTalk(command) {
    const response = await request(this.#url)
      .put(`/api/talks/${encodeURIComponent(command.title)}`)
      .set("Content-Type", "application/json")
      .send({ presenter: command.presenter, summary: command.summary });
    if (response.noContent) {
      return CommandStatus.success();
    }
    return CommandStatus.failure(response.text);
  }

  /**
   * @param {AddCommentCommand} command
   */
  async addComment(command) {
    const response = await request(this.#url)
      .post(`/api/talks/${encodeURIComponent(command.title)}/comments`)
      .set("Content-Type", "application/json")
      .send(command.comment);
    if (response.noContent) {
      return CommandStatus.success();
    }
    return CommandStatus.failure(response.text);
  }

  /**
   * @param {DeleteTalkCommand} command
   */
  async deleteTalk(command) {
    const response = await request(this.#url)
      .delete(`/api/talks/${encodeURIComponent(command.title)}`)
      .send();
    if (response.noContent) {
      return CommandStatus.success();
    }
    return CommandStatus.failure(response.text);
  }

  /**
   * @param {TalksQuery} [query]
   */
  async getTalks(query) {
    if (query?.title != null) {
      const response = await request(this.#url)
        .get(`/api/talks/${encodeURIComponent(query.title)}`)
        .set("Accept", "application/json");
      if (response.ok) {
        return TalksQueryResult.create({ talks: [response.body] });
      }
      if (response.notFound) {
        return TalksQueryResult.create({ talks: [] });
      }
    }

    const response = await request(this.#url)
      .get("/api/talks")
      .set("Accept", "application/json");
    if (response.ok) {
      return TalksQueryResult.create({ talks: response.body });
    }

    return null;
  }
}

async function submitTalk(url, talk = Talk.createTestInstance()) {
  return await request(url)
    .put(`/api/talks/${encodeURIComponent(talk.title)}`)
    .set("Content-Type", "application/json")
    .send({ presenter: talk.presenter, summary: talk.summary });
}
