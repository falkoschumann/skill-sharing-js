// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import fs from "node:fs/promises";
import path from "node:path";
import { beforeEach, describe, expect, it } from "vitest";

import { Repository } from "../../../src/infrastructure/repository.js";
import {
  createTestTalk,
  createTestTalkWithComment,
} from "../../data/testdata.js";

const testFile = path.join(
  import.meta.dirname,
  "../../../testdata/integration.repository.json",
);

const nonExistingFile = path.join(
  import.meta.dirname,
  "../data/talks-non-existent.json",
);
const exampleFile = path.join(
  import.meta.dirname,
  "../data/talks-example.json",
);
const corruptedFile = path.join(
  import.meta.dirname,
  "../data/talks-corrupt.json",
);

describe("Repository", () => {
  beforeEach(async () => {
    await fs.rm(testFile, { force: true });
  });

  describe("Find all", () => {
    it("Returns list of all talks", async () => {
      const repository = Repository.create({ fileName: exampleFile });

      const talks = await repository.findAll();

      expect(talks).toEqual([createTestTalkWithComment()]);
    });

    it("Returns empty list when file does not exist", async () => {
      const repository = Repository.create({ fileName: nonExistingFile });

      const talks = await repository.findAll();

      expect(talks).toEqual([]);
    });

    it("Reports an error when file is corrupt", async () => {
      const repository = Repository.create({ fileName: corruptedFile });

      const result = repository.findAll();

      await expect(result).rejects.toThrow(SyntaxError);
    });
  });

  describe("Find by title", () => {
    it("Returns talk with title", async () => {
      const repository = Repository.create({ fileName: exampleFile });
      const expectedTalk = createTestTalkWithComment();

      const actualTalk = await repository.findByTitle(expectedTalk.title);

      expect(actualTalk).toEqual(expectedTalk);
    });

    it("Returns undefined when talk with title does not exist", async () => {
      const repository = Repository.create({ fileName: exampleFile });

      const talk = await repository.findByTitle("Non existing title");

      expect(talk).toBeUndefined();
    });

    it("Returns undefined when file does not exist", async () => {
      const repository = Repository.create({ fileName: nonExistingFile });

      const talks = await repository.findByTitle("Any title");

      expect(talks).toBeUndefined();
    });

    it("Reports an error when file is corrupt", async () => {
      const repository = Repository.create({ fileName: corruptedFile });

      const result = repository.findByTitle("Any title");

      await expect(result).rejects.toThrow(SyntaxError);
    });
  });

  describe("Add or update", () => {
    it("Creates file when file does not exist", async () => {
      const repository = Repository.create({ fileName: testFile });

      const talk = createTestTalk();
      await repository.addOrUpdate(talk);

      const talks = await repository.findAll();
      expect(talks).toEqual([talk]);
    });

    it("Adds talk when file exists", async () => {
      const repository = Repository.create({ fileName: testFile });
      const talk1 = createTestTalk({ title: "Foo" });
      await repository.addOrUpdate(talk1);

      const talk2 = createTestTalk({ title: "Bar" });
      await repository.addOrUpdate(talk2);

      const talks = await repository.findAll();
      expect(talks).toEqual([talk1, talk2]);
    });

    it("Updates talk when talk exists", async () => {
      const repository = Repository.create({ fileName: testFile });
      const talk = createTestTalk({
        presenter: "Alice",
      });
      await repository.addOrUpdate(talk);

      const updatedTalk = createTestTalk({ presenter: "Bob" });
      await repository.addOrUpdate(updatedTalk);

      const talks = await repository.findAll();
      expect(talks).toEqual([updatedTalk]);
    });

    it("Reports an error when file is corrupt", async () => {
      const repository = Repository.create({ fileName: corruptedFile });

      const talk = createTestTalk();
      const result = repository.addOrUpdate(talk);

      await expect(result).rejects.toThrow(SyntaxError);
    });
  });

  describe("Remove", () => {
    it("Removes talk", async () => {
      const repository = Repository.create({ fileName: testFile });
      const talk = createTestTalk();
      await repository.addOrUpdate(talk);

      await repository.remove(talk.title);

      const talks = await repository.findAll();
      expect(talks).toEqual([]);
    });

    it("Does not reports an error when file does not exist", async () => {
      const repository = Repository.create({ fileName: testFile });

      const talks = await repository.remove("Any title");

      expect(talks).toBeUndefined();
    });

    it("Reports an error when file is corrupt", async () => {
      const repository = Repository.create({ fileName: corruptedFile });

      const result = repository.remove("Any title");

      await expect(result).rejects.toThrow(SyntaxError);
    });
  });

  describe("Memory repository", () => {
    it("Creates empty", async () => {
      const repository = Repository.createNull();

      const talks = await repository.findAll();

      expect(talks).toEqual([]);
    });

    it("Initializes with talks", async () => {
      const repository = Repository.createNull({
        talks: [createTestTalk()],
      });

      const talks = await repository.findAll();

      expect(talks).toEqual([createTestTalk()]);
    });

    it("Writes and reads talks", async () => {
      const repository = Repository.createNull();

      await repository.addOrUpdate(createTestTalk());
      const talks = await repository.findAll();

      expect(talks).toEqual([createTestTalk()]);
    });
  });
});
