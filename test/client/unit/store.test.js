// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

// @vitest-environment jsdom

import { describe, expect, it } from "vitest";

import { createStore } from "../../../public/js/application/store.js";
import {
  addComment,
  changeUser,
  deleteTalk,
  start,
  submitTalk,
} from "../../../public/js/application/talks_slice.js";
import { Talk } from "../../../public/js/domain/talks.js";
import { User } from "../../../public/js/domain/users.js";
import {
  Api,
  COMMENT_ADDED_EVENT,
  TALK_DELETED_EVENT,
  TALK_SUBMITTED_EVENT,
  TalksUpdatedEvent,
} from "../../../public/js/infrastructure/api.js";
import { Repository } from "../../../public/js/infrastructure/repository.js";

describe.skip("Store", () => {
  describe("Change user", () => {
    it("Updates user name", async () => {
      const { store, repository } = configure();
      const result = new Promise((resolve) => store.subscribe(resolve));

      const user = User.createTestInstance();
      store.dispatch(changeUser({ username: user.username }));
      await result;

      const settings = await repository.load();
      expect(store.getState().user).toEqual(user.username);
      expect(settings).toEqual(user);
    });
  });

  describe("Load user", () => {
    it("Anon is the default user", async () => {
      const { store } = configure();
      const result = new Promise((resolve) => store.subscribe(resolve));

      store.dispatch(start());
      await result;

      expect(store.getState().user).toEqual("Anon");
    });

    it("Is stored user", async () => {
      const user = User.createTestInstance();
      const { store } = configure({ user });
      const result = new Promise((resolve) => store.subscribe(resolve));

      store.dispatch(start());
      await result;

      expect(store.getState().user).toEqual(user.username);
    });
  });

  describe("Submit talk", () => {
    it("Adds talk to list", async () => {
      const { store, api } = configure();
      const talksSubmitted = api.trackTalksSubmitted();
      const result = new Promise((resolve) =>
        api.addEventListener(TALK_SUBMITTED_EVENT, resolve),
      );

      store.dispatch(submitTalk({ title: "Foobar", summary: "Lorem ipsum" }));
      await result;

      expect(talksSubmitted.data).toEqual([
        { title: "Foobar", presenter: "Anon", summary: "Lorem ipsum" },
      ]);
    });
  });

  describe("Adds comment", () => {
    it("Adds comment to an existing talk", async () => {
      const { store, api } = configure();
      const commentsAdded = api.trackCommentsAdded();
      const result = new Promise((resolve) =>
        api.addEventListener(COMMENT_ADDED_EVENT, resolve),
      );

      store.dispatch(addComment({ title: "Foobar", message: "Lorem ipsum" }));
      await result;

      expect(commentsAdded.data).toEqual([
        {
          title: "Foobar",
          comment: { author: "Anon", message: "Lorem ipsum" },
        },
      ]);
    });

    it.todo("Reports an error when talk does not exists");
  });

  describe("Delete talk", () => {
    it("Removes talk from list", async () => {
      const { store, api } = configure();
      const talksDeleted = api.trackTalksDeleted();
      const result = new Promise((resolve) =>
        api.addEventListener(TALK_DELETED_EVENT, resolve),
      );

      store.dispatch(deleteTalk({ title: "Foobar" }));
      await result;

      expect(talksDeleted.data).toEqual([{ title: "Foobar" }]);
    });

    it.todo("Ignores already removed talk");
  });

  describe("Talks", () => {
    it("Lists all talks", async () => {
      const talk = Talk.createTestInstance();
      const { store, api } = configure({
        fetchResponse: {
          status: 200,
          headers: { etag: "1" },
          body: JSON.stringify([talk]),
        },
      });
      const result = new Promise((resolve) =>
        api.addEventListener(TalksUpdatedEvent.TYPE, () => resolve()),
      );

      store.dispatch(start());
      await result;

      expect(store.getState().talks).toEqual([talk]);
      await api.close();
    });
  });
});

function configure({ user, fetchResponse } = {}) {
  const repository = Repository.createNull({ user });
  const api = Api.createNull({ fetchResponse });
  const store = createStore(api, repository);
  return { store, repository, api };
}
