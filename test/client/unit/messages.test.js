// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from "vitest";
import {
  validateAddCommentCommand,
  validateCommandStatus,
  validateDeleteTalkCommand,
  validateSubmitTalkCommand,
  validateTalksQuery,
  validateTalksQueryResult,
} from "../../../public/js/domain/messages.js";

describe("Messages", () => {
  describe("Validate submit talk command", () => {
    it("Passes a valid command", () => {
      const command = validateSubmitTalkCommand({
        title: "Foobar",
        presenter: "Alice",
        summary: "Lorem ipsum",
      });

      expect(command).toEqual({
        title: "Foobar",
        presenter: "Alice",
        summary: "Lorem ipsum",
      });
    });

    it("Fails when command is nullish", () => {
      const command = validateSubmitTalkCommand();

      expect(command).toEqual(false);
    });

    it("Fails when title is not a string", () => {
      const command = validateSubmitTalkCommand({
        presenter: "Alice",
        summary: "Lorem ipsum",
      });

      expect(command).toEqual(false);
    });

    it("Fails when presenter is not a string", () => {
      const command = validateSubmitTalkCommand({
        title: "Foobar",
        presenter: true,
        summary: "Lorem ipsum",
      });

      expect(command).toEqual(false);
    });

    it("Fails when summary is not a string", () => {
      const command = validateSubmitTalkCommand({
        title: "Foobar",
        presenter: "Alice",
        summary: 5,
      });

      expect(command).toEqual(false);
    });
  });

  describe("Validate add comment command", () => {
    it("Passes a valid command", () => {
      const command = validateAddCommentCommand({
        title: "Foobar",
        comment: {
          author: "Alice",
          message: "Lorem ipsum",
        },
      });

      expect(command).toEqual({
        title: "Foobar",
        comment: {
          author: "Alice",
          message: "Lorem ipsum",
        },
      });
    });

    it("Fails when command is nullish", () => {
      const command = validateAddCommentCommand();

      expect(command).toEqual(false);
    });

    it("Fails when title is not a string", () => {
      const command = validateAddCommentCommand({
        title: 42,
        comment: {
          author: "Alice",
          message: "Lorem ipsum",
        },
      });

      expect(command).toEqual(false);
    });

    it("Fails when comment is not valid", () => {
      const command = validateAddCommentCommand({
        title: 42,
        comment: {
          message: "Lorem ipsum",
        },
      });

      expect(command).toEqual(false);
    });
  });

  describe("Validate delete talk command", () => {
    it("Passes a valid command", () => {
      const command = validateDeleteTalkCommand({
        title: "Foobar",
      });

      expect(command).toEqual({
        title: "Foobar",
      });
    });

    it("Fails when command is nullish", () => {
      const command = validateDeleteTalkCommand(undefined);

      expect(command).toEqual(false);
    });

    it("Fails when title is not a string", () => {
      const command = validateDeleteTalkCommand({
        title: null,
      });

      expect(command).toEqual(false);
    });
  });

  describe("Validate command status", () => {
    it("Passes success", () => {
      const status = validateCommandStatus({
        isSuccess: true,
      });

      expect(status).toEqual({
        isSuccess: true,
      });
    });

    it("Passes failure", () => {
      const status = validateCommandStatus({
        isSuccess: false,
        errorMessage: "Error",
      });

      expect(status).toEqual({
        isSuccess: false,
        errorMessage: "Error",
      });
    });

    it("Fails when status is nullish", () => {
      const status = validateCommandStatus(undefined);

      expect(status).toEqual(false);
    });

    it("Fails when success is not a boolean", () => {
      const status = validateCommandStatus({
        isSuccess: "true",
      });

      expect(status).toEqual(false);
    });

    it("Fails when error message is not a string", () => {
      const status = validateCommandStatus({
        isSuccess: false,
        errorMessage: 42,
      });

      expect(status).toEqual(false);
    });

    it("Fails when success has an error message", () => {
      const status = validateCommandStatus({
        isSuccess: true,
        errorMessage: "Error",
      });

      expect(status).toEqual(false);
    });

    it("Fails when failure has not an error message", () => {
      const status = validateCommandStatus({
        isSuccess: false,
      });

      expect(status).toEqual(false);
    });
  });

  describe("Validate talks query", () => {
    it("Passes a query with title", () => {
      const query = validateTalksQuery({
        title: "Foobar",
      });

      expect(query).toEqual({
        title: "Foobar",
      });
    });

    it("Passes a query without title", () => {
      const query = validateTalksQuery({});

      expect(query).toEqual({});
    });

    it("Fails when command is nullish", () => {
      const query = validateTalksQuery();

      expect(query).toEqual(false);
    });

    it("Fails when title is not a string", () => {
      const query = validateTalksQuery({
        title: 42,
      });

      expect(query).toEqual(false);
    });
  });

  describe("Validate talks query", () => {
    it("Passes a valid result", () => {
      const result = validateTalksQueryResult({
        talks: [],
      });

      expect(result).toEqual({
        talks: [],
      });
    });

    it("Fails when result is nullish", () => {
      const result = validateTalksQueryResult();

      expect(result).toEqual(false);
    });

    it("Fails when talks is not an array", () => {
      const result = validateTalksQueryResult({
        talks: {},
      });

      expect(result).toEqual(false);
    });

    it("Fails when talks contains an invalid talk", () => {
      const result = validateTalksQueryResult({
        talks: [
          { title: "Foobar", presenter: "Alice", summary: 42, comments: [] },
        ],
      });

      expect(result).toEqual(false);
    });
  });
});
