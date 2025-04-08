// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}
