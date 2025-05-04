// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import { createStore } from "../../../public/js/application/store.js";
import {
  addComment,
  changeUser,
  deleteTalk,
  selectTalks,
  selectUser,
  start,
  submitTalk,
} from "../../../public/js/application/talks_slice.js";
import { User } from "../../../public/js/domain/users.js";
import { TalksApi } from "../../../public/js/infrastructure/talks_api.js";
import { UsersRepository } from "../../../public/js/infrastructure/users_repository.js";
import { createTestTalk } from "../../data/testdata.js";

describe("Store", () => {
  describe("Change user", () => {
    it("Updates user name", async () => {
      const { store, usersRepository } = configure();

      const user = User.createTestInstance();
      await store.dispatch(changeUser(user));

      const settings = await usersRepository.load();
      expect(selectUser(store.getState())).toEqual(user);
      expect(settings).toEqual(user);
    });
  });

  describe("User", () => {
    it("Anon is the default user", async () => {
      const { store } = configure();

      await store.dispatch(start());

      expect(selectUser(store.getState())).toEqual({ username: "Anon" });
    });

    it("Is stored user", async () => {
      const user = User.createTestInstance();
      const { store } = configure({ user });

      await store.dispatch(start());

      expect(selectUser(store.getState())).toEqual(user);
    });
  });

  describe("Submit talk", () => {
    it("Adds talk to list", async () => {
      const { store, talksApi } = configure();
      const talksSubmitted = talksApi.trackTalksSubmitted();

      await store.dispatch(
        submitTalk({
          title: "Foobar",
          summary: "Lorem ipsum",
        }),
      );

      expect(talksSubmitted.data).toEqual([
        { title: "Foobar", presenter: "Anon", summary: "Lorem ipsum" },
      ]);
    });
  });

  describe("Adds comment", () => {
    it("Adds comment to an existing talk", async () => {
      const { store, talksApi } = configure();
      const commentsAdded = talksApi.trackCommentsAdded();

      await store.dispatch(
        addComment({
          title: "Foobar",
          message: "Lorem ipsum",
        }),
      );

      expect(commentsAdded.data).toEqual([
        {
          title: "Foobar",
          comment: { author: "Anon", message: "Lorem ipsum" },
        },
      ]);
    });
  });

  describe("Delete talk", () => {
    it("Removes talk from list", async () => {
      const { store, talksApi } = configure();
      const talksDeleted = talksApi.trackTalksDeleted();

      await store.dispatch(deleteTalk({ title: "Foobar" }));

      expect(talksDeleted.data).toEqual([{ title: "Foobar" }]);
    });
  });

  describe("Talks", () => {
    it("Lists all talks", async () => {
      const { store, talksApi } = configure();

      await store.dispatch(start());
      talksApi.simulateMessage(JSON.stringify([createTestTalk()]));

      expect(selectTalks(store.getState())).toEqual([createTestTalk()]);
    });
  });
});

function configure({ user } = {}) {
  const usersRepository = UsersRepository.createNull({ user });
  const talksApi = TalksApi.createNull();
  const store = createStore(talksApi, usersRepository);
  return { store, usersRepository, talksApi };
}
