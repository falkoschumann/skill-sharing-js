// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import fs from "node:fs/promises";
import path from "node:path";
import request from "supertest";
import { describe, expect, it } from "vitest";

import {
  ServerConfiguration,
  SkillSharingApplication,
  SkillSharingConfiguration,
} from "../../../src/ui/application.js";
import {
  failure,
  success,
  validateTalksQuery,
  validateTalksQueryResult,
} from "../../../public/js/domain/messages.js";
import { TalksRepositoryConfiguration } from "../../../src/infrastructure/talks_repository.js";
import {
  createTestAddCommentCommand,
  createTestComment,
  createTestDeleteTalkCommand,
  createTestSubmitTalkCommand,
  createTestTalk,
  createTestTalksQuery,
  createTestTalksQueryResult,
  createTestTalksQueryResultWithComment,
  createTestTalkWithComment,
} from "../../data/testdata.js";

describe("Application", () => {
  it("Starts and stops the app", async () => {
    await startAndStop(async () => {});
  });

  describe("Submit talk", () => {
    it("Adds talk to list", async () => {
      await startAndStop(async ({ client }) => {
        const status = await client.submitTalk(createTestSubmitTalkCommand());

        expect(status).toEqual(success());
        const result = await client.queryTalks();
        expect(result).toEqual(createTestTalksQueryResult());
      });
    });

    it("Reports an error when talk could not add", async () => {
      await startAndStop(async ({ client }) => {
        const status = await client.submitTalk(
          createTestSubmitTalkCommand({ presenter: null }),
        );

        expect(status).toEqual(failure("Bad submit talk command."));
        const result = await client.queryTalks();
        expect(result).toEqual({ talks: [] });
      });
    });
  });

  describe("Add comment", () => {
    it("Adds comment to an existing talk", async () => {
      await startAndStop(async ({ client }) => {
        await client.submitTalk(createTestSubmitTalkCommand());

        const status = await client.addComment(createTestAddCommentCommand());

        expect(status).toEqual(success());
        const result = await client.queryTalks();
        expect(result).toEqual(createTestTalksQueryResultWithComment());
      });
    });

    it("Reports an error when talk does not exists", async () => {
      await startAndStop(async ({ client }) => {
        await client.submitTalk(createTestSubmitTalkCommand());

        const status = await client.addComment(
          createTestAddCommentCommand({
            title: "Non existing talk",
          }),
        );

        expect(status).toEqual(
          failure(
            'The comment cannot be added because the talk "Non existing talk" does not exist.',
          ),
        );
      });
    });

    it("Reports an error when comment could not add", async () => {
      await startAndStop(async ({ client }) => {
        await client.submitTalk(createTestSubmitTalkCommand());

        const status = await client.addComment(
          createTestAddCommentCommand({
            comment: createTestComment({ author: null }),
          }),
        );

        expect(status).toEqual(failure("Bad add comment command."));
      });
    });
  });

  describe("Delete talk", () => {
    it("Deletes an existing talk", async () => {
      await startAndStop(async ({ client }) => {
        await client.submitTalk(createTestSubmitTalkCommand());

        const status = await client.deleteTalk(createTestDeleteTalkCommand());

        expect(status).toEqual(success());
      });
    });

    it("Reports no error when talk does not exist", async () => {
      await startAndStop(async ({ client }) => {
        const status = await client.deleteTalk(
          createTestDeleteTalkCommand({
            title: "non-existing-talk",
          }),
        );

        expect(status).toEqual(success());
      });
    });
  });

  describe("Talks", () => {
    it("Returns all talks", async () => {
      await startAndStop(async ({ client }) => {
        await client.submitTalk(createTestSubmitTalkCommand({ title: "Foo" }));
        await client.addComment(createTestAddCommentCommand({ title: "Foo" }));
        await client.submitTalk(createTestSubmitTalkCommand({ title: "Bar" }));

        const result = await client.queryTalks();

        expect(result).toEqual(
          createTestTalksQueryResult({
            talks: [
              createTestTalkWithComment({ title: "Foo" }),
              createTestTalk({ title: "Bar" }),
            ],
          }),
        );
      });
    });

    it("Returns a single talk when client asks for a specific talk", async () => {
      await startAndStop(async ({ client }) => {
        await client.submitTalk(createTestSubmitTalkCommand());

        const result = await client.queryTalks(createTestTalksQuery());

        expect(result).toEqual(createTestTalksQueryResult());
      });
    });

    it("Returns no talk when client asks for a specific talk that does not exist", async () => {
      await startAndStop(async ({ client }) => {
        await client.submitTalk(createTestSubmitTalkCommand());

        const result = await client.queryTalks(
          validateTalksQuery({ title: "Non existing talk" }),
        );

        expect(result).toEqual({ talks: [] });
      });
    });
  });

  describe("Receive talk updates", () => {
    it("Receives talk updates", async () => {
      await startAndStop(async ({ url, source }) => {
        const talksPromise = new Promise((resolve) => {
          const data = [];
          source.addEventListener("message", (event) => {
            const talks = JSON.parse(event.data);
            data.push(talks);
            if (data.length === 2) {
              resolve(data);
            }
          });
        });

        await submitTalk(url);
        const talks = await talksPromise;

        expect(talks).toEqual([[], [createTestTalk()]]);
      });
    });
  });
});

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
    repository: TalksRepositoryConfiguration.create({ fileName }),
  });

  const application = SkillSharingApplication.create(configuration);
  await application.start();
  const url = `http://${address}:${port}`;
  const client = new ServiceClient(url);
  const source = new EventSource(`${url}/api/talks`);
  try {
    await run({ url, client, source });
  } finally {
    source.close();
    await application.stop();
  }
}

class ServiceClient {
  #url;

  constructor(url) {
    this.#url = url;
  }

  async submitTalk(command) {
    const response = await request(this.#url)
      .put(`/api/talks/${encodeURIComponent(command.title)}`)
      .set("Content-Type", "application/json")
      .send({ presenter: command.presenter, summary: command.summary });
    if (response.noContent) {
      return success();
    }
    return failure(response.text);
  }

  async addComment(command) {
    const response = await request(this.#url)
      .post(`/api/talks/${encodeURIComponent(command.title)}/comments`)
      .set("Content-Type", "application/json")
      .send(command.comment);
    if (response.noContent) {
      return success();
    }
    return failure(response.text);
  }

  async deleteTalk(command) {
    const response = await request(this.#url)
      .delete(`/api/talks/${encodeURIComponent(command.title)}`)
      .send();
    if (response.noContent) {
      return success();
    }
    return failure(response.text);
  }

  async queryTalks(query) {
    if (query?.title != null) {
      const response = await request(this.#url)
        .get(`/api/talks/${encodeURIComponent(query.title)}`)
        .set("Accept", "application/json");
      if (response.ok) {
        return validateTalksQueryResult({ talks: [response.body] });
      }
      if (response.notFound) {
        return validateTalksQueryResult({ talks: [] });
      }
    }

    const response = await request(this.#url)
      .get("/api/talks")
      .set("Accept", "application/json");
    if (response.ok) {
      return validateTalksQueryResult({ talks: response.body });
    }

    return null;
  }
}

async function submitTalk(url, talk = createTestTalk()) {
  return await request(url)
    .put(`/api/talks/${encodeURIComponent(talk.title)}`)
    .set("Content-Type", "application/json")
    .send({ presenter: talk.presenter, summary: talk.summary });
}
