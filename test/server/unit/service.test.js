// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  failure,
  success,
  validateTalksQuery,
  validateTalksQueryResult,
} from "../../../public/js/domain/messages.js";
import { Talk } from "../../../public/js/domain/talks.js";
import { Service } from "../../../src/application/service.js";
import { Repository } from "../../../src/infrastructure/repository.js";
import {
  createTestAddCommentCommand,
  createTestDeleteTalkCommand,
  createTestSubmitTalkCommand,
  createTestTalk,
} from "../../data/testdata.js";

describe("Service", () => {
  describe("Submit talk", () => {
    it("Adds talk to list", async () => {
      const { service, repository } = configure();

      const status = await service.submitTalk(createTestSubmitTalkCommand());

      expect(status).toEqual(success());
      const talks = await repository.findAll();
      expect(talks).toEqual([Talk.createTestInstance()]);
    });
  });

  describe("Add comment", () => {
    it("Adds comment to talk", async () => {
      const { service, repository } = configure({
        talks: [Talk.createTestInstance()],
      });

      const status = await service.addComment(createTestAddCommentCommand());

      expect(status).toEqual(success());
      const talks = await repository.findAll();
      expect(talks).toEqual([Talk.createTestInstanceWithComment()]);
    });

    it("Reports an error when talk does not exist", async () => {
      const { service, repository } = configure({
        talks: [Talk.createTestInstance()],
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
      const talks = await repository.findAll();
      expect(talks).toEqual([Talk.createTestInstance()]);
    });
  });

  describe("Delete talk", () => {
    it("Removes talk from list", async () => {
      const { service, repository } = configure({
        talks: [Talk.createTestInstance()],
      });

      const status = await service.deleteTalk(createTestDeleteTalkCommand());

      expect(status).toEqual(success());
      const talks = await repository.findAll();
      expect(talks).toEqual([]);
    });

    it("Does not report an error when talk does not exist", async () => {
      const { service, repository } = configure();

      const status = await service.deleteTalk(createTestDeleteTalkCommand());

      expect(status).toEqual(success());
      const talks = await repository.findAll();
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

      const result = await service.getTalks(validateTalksQuery());

      expect(result).toEqual(
        validateTalksQueryResult({
          talks: [
            Talk.createTestInstance({ title: "Foo" }),
            Talk.createTestInstance({ title: "Bar" }),
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

      const result = await service.getTalks(
        validateTalksQuery({ title: "Foo" }),
      );

      expect(result).toEqual(
        validateTalksQueryResult({
          talks: [Talk.createTestInstance({ title: "Foo" })],
        }),
      );
    });
  });
});

function configure({ talks } = {}) {
  const repository = Repository.createNull({ talks });
  const service = new Service(repository);
  return { service, repository };
}
