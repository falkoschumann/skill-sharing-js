// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

// @vitest-environment jsdom

import { beforeEach, describe, expect, it } from "vitest";

import { User } from "../../../public/js/domain/users.js";
import { UsersRepository } from "../../../public/js/infrastructure/users_repository.js";

describe("User repository", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("Loads and store settings", async () => {
    const repository = UsersRepository.create();

    await repository.store({ username: "Alice" });
    const settings = await repository.load();

    expect(settings).toEqual({ username: "Alice" });
  });

  it("Loads empty object when storage is empty", async () => {
    const repository = UsersRepository.create();

    const settings = await repository.load();

    expect(settings).toBeUndefined();
  });

  describe("Memory repository", () => {
    it("Creates empty", async () => {
      const repository = UsersRepository.createNull();

      const settings = await repository.load();

      expect(settings).toBeUndefined();
    });

    it("Initializes with user", async () => {
      const repository = UsersRepository.createNull({
        user: User.create({ username: "Bob" }),
      });

      const settings = await repository.load();

      expect(settings).toEqual({ username: "Bob" });
    });

    it("Loads and store settings", async () => {
      const repository = UsersRepository.createNull();

      await repository.store({ username: "Charly" });
      const settings = await repository.load();

      expect(settings).toEqual({ username: "Charly" });
    });
  });
});
