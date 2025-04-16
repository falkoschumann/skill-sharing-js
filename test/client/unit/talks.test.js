// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";

import {
  validateComment,
  validateTalk,
} from "../../../public/js/domain/talks.js";

describe("Talks", () => {
  describe("Validate talk", () => {
    it("Passes a valid talk", () => {
      const talk = validateTalk({
        title: "Foobar",
        presenter: "Alice",
        summary: "Lorem ipsum",
        comments: [],
      });

      expect(talk).toEqual({
        title: "Foobar",
        presenter: "Alice",
        summary: "Lorem ipsum",
        comments: [],
      });
    });

    it("Fails when talks is nullish", () => {
      const talk = validateTalk(null);

      expect(talk).toEqual(false);
    });

    it("Fails when title is not a string", () => {
      const talk = validateTalk({
        presenter: "Alice",
        summary: "Lorem ipsum",
        comments: [],
      });

      expect(talk).toEqual(false);
    });

    it("Fails when presenter is not a string", () => {
      const talk = validateTalk({
        title: "Foobar",
        presenter: 42,
        summary: "Lorem ipsum",
        comments: [],
      });

      expect(talk).toEqual(false);
    });

    it("Fails when summary is not a string", () => {
      const talk = validateTalk({
        title: "Foobar",
        presenter: "Alice",
        summary: false,
        comments: [],
      });

      expect(talk).toEqual(false);
    });

    it("Fails when comments is not an array", () => {
      const talk = validateTalk({
        title: "Foobar",
        presenter: "Alice",
        summary: "Lorem ipsum",
        comments: {},
      });

      expect(talk).toEqual(false);
    });

    it("Fails when comments contains an invalid comment", () => {
      const talk = validateTalk({
        title: "Foobar",
        presenter: "Alice",
        summary: "Lorem ipsum",
        comments: [{ author: "Bob", message: "Great" }, { author: "Charlie" }],
      });

      expect(talk).toEqual(false);
    });
  });

  describe("Validate comment", () => {
    it("Passes a valid comment", () => {
      const comment = validateComment({
        author: "Alice",
        message: "Lorem ipsum",
      });

      expect(comment).toEqual({ author: "Alice", message: "Lorem ipsum" });
    });

    it("Fails when comment is nullish", () => {
      const comment = validateComment();

      expect(comment).toEqual(false);
    });

    it("Fails when author is not a string", () => {
      const comment = validateComment({
        message: "Lorem ipsum",
      });

      expect(comment).toEqual(false);
    });

    it("Fails when message is not a string", () => {
      const comment = validateComment({
        author: "Alice",
        message: 42,
      });

      expect(comment).toEqual(false);
    });
  });
});
