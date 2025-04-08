// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";

import { Repository } from "../../../public/js/infrastructure/repository.js";
import { User } from "../../../public/js/domain/users.js";

describe("Repository", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("Loads and store settings", async () => {
    const repository = Repository.create();

    await repository.store({ username: "Alice" });
    const settings = await repository.load();

    expect(settings).toEqual({ username: "Alice" });
  });

  it("Loads empty object when storage is empty", async () => {
    const repository = Repository.create();

    const settings = await repository.load();

    expect(settings).toBeUndefined();
  });

  describe("Memory repository", () => {
    it("Creates empty", async () => {
      const repository = Repository.createNull();

      const settings = await repository.load();

      expect(settings).toBeUndefined();
    });

    it("Initializes with user", async () => {
      const repository = Repository.createNull({
        user: User.create({ username: "Bob" }),
      });

      const settings = await repository.load();

      expect(settings).toEqual({ username: "Bob" });
    });

    it("Loads and store settings", async () => {
      const repository = Repository.createNull();

      await repository.store({ username: "Charly" });
      const settings = await repository.load();

      expect(settings).toEqual({ username: "Charly" });
    });
  });
});
