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
import { Talk } from "../../../public/js/domain/talks.js";
import { User } from "../../../public/js/domain/users.js";
import { Api } from "../../../public/js/infrastructure/api.js";
import { Repository } from "../../../public/js/infrastructure/repository.js";

describe("Store", () => {
  describe("Change user", () => {
    it("Updates user name", async () => {
      const { store, repository } = configure();

      const user = User.createTestInstance();
      await store.dispatch(changeUser(user));

      const settings = await repository.load();
      expect(selectUser(store.getState())).toEqual(user.username);
      expect(settings).toEqual(user);
    });
  });

  describe("User", () => {
    it("Anon is the default user", async () => {
      const { store } = configure();

      await store.dispatch(start());

      expect(selectUser(store.getState())).toEqual("Anon");
    });

    it("Is stored user", async () => {
      const user = User.createTestInstance();
      const { store } = configure({ user });

      await store.dispatch(start());

      expect(selectUser(store.getState())).toEqual(user.username);
    });
  });

  describe("Submit talk", () => {
    it("Adds talk to list", async () => {
      const { store, api } = configure();
      const talksSubmitted = api.trackTalksSubmitted();

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
      const { store, api } = configure();
      const commentsAdded = api.trackCommentsAdded();

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
      const { store, api } = configure();
      const talksDeleted = api.trackTalksDeleted();

      await store.dispatch(deleteTalk({ title: "Foobar" }));

      expect(talksDeleted.data).toEqual([{ title: "Foobar" }]);
    });
  });

  describe("Talks", () => {
    it("Lists all talks", async () => {
      const { store, api } = configure();

      await store.dispatch(start());
      api.simulateMessage(JSON.stringify([Talk.createTestInstance()]));

      expect(selectTalks(store.getState())).toEqual([
        Talk.createTestInstance(),
      ]);
    });
  });
});

function configure({ user } = {}) {
  const repository = Repository.createNull({ user });
  const api = Api.createNull();
  const store = createStore(api, repository);
  return { store, repository, api };
}
