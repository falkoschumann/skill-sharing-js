// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  failure,
  success,
  validateTalksQuery,
  validateTalksQueryResult,
} from "../../../public/js/domain/messages.js";
import { TalksService } from "../../../src/application/talks_service.js";
import { ConsoleGateway } from "../../../public/js/infrastructure/console_gateway.js";
import { TalksRepository } from "../../../src/infrastructure/talks_repository.js";
import {
  createTestAddCommentCommand,
  createTestDeleteTalkCommand,
  createTestSubmitTalkCommand,
  createTestTalk,
  createTestTalkWithComment,
} from "../../data/testdata.js";

describe("Service", () => {
  describe("Submit talk", () => {
    it("Adds talk to list", async () => {
      const { service, talksRepository } = configure();

      const status = await service.submitTalk(createTestSubmitTalkCommand());

      expect(status).toEqual(success());
      const talks = await talksRepository.findAll();
      expect(talks).toEqual([createTestTalk()]);
    });
  });

  describe("Add comment", () => {
    it("Adds comment to talk", async () => {
      const { service, talksRepository } = configure({
        talks: [createTestTalk()],
      });

      const status = await service.addComment(createTestAddCommentCommand());

      expect(status).toEqual(success());
      const talks = await talksRepository.findAll();
      expect(talks).toEqual([createTestTalkWithComment()]);
    });

    it("Reports an error when talk does not exist", async () => {
      const { service, talksRepository } = configure({
        talks: [createTestTalk()],
      });

      const status = await service.addComment(
        createTestAddCommentCommand({
          title: "Non existing title",
        }),
      );

      expect(status).toEqual(
        failure(
          'The comment cannot be added because the talk "Non existing title" does not exist.',
        ),
      );
      const talks = await talksRepository.findAll();
      expect(talks).toEqual([createTestTalk()]);
    });
  });

  describe("Delete talk", () => {
    it("Removes talk from list", async () => {
      const { service, talksRepository } = configure({
        talks: [createTestTalk()],
      });

      const status = await service.deleteTalk(createTestDeleteTalkCommand());

      expect(status).toEqual(success());
      const talks = await talksRepository.findAll();
      expect(talks).toEqual([]);
    });

    it("Does not report an error when talk does not exist", async () => {
      const { service, talksRepository } = configure();

      const status = await service.deleteTalk(createTestDeleteTalkCommand());

      expect(status).toEqual(success());
      const talks = await talksRepository.findAll();
      expect(talks).toEqual([]);
    });
  });

  describe("Talks", () => {
    it("Lists all talks", async () => {
      const { service } = configure({
        talks: [
          createTestTalk({ title: "Foo" }),
          createTestTalk({ title: "Bar" }),
        ],
      });

      const result = await service.queryTalks(validateTalksQuery({}));

      expect(result).toEqual(
        validateTalksQueryResult({
          talks: [
            createTestTalk({ title: "Foo" }),
            createTestTalk({ title: "Bar" }),
          ],
        }),
      );
    });

    it("Finds talk by title", async () => {
      const { service } = configure({
        talks: [
          createTestTalk({ title: "Foo" }),
          createTestTalk({ title: "Bar" }),
        ],
      });

      const result = await service.queryTalks(
        validateTalksQuery({ title: "Foo" }),
      );

      expect(result).toEqual(
        validateTalksQueryResult({
          talks: [createTestTalk({ title: "Foo" })],
        }),
      );
    });
  });
});

function configure({ talks } = {}) {
  const talksRepository = TalksRepository.createNull({ talks });
  const service = new TalksService(
    talksRepository,
    ConsoleGateway.createNull(),
  );
  return { service, talksRepository };
}
