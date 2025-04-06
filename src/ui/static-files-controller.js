// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";
import express from "express";

export class StaticFilesController {
  /**
   * @param {express.Express} app
   * @param {string} [directory="./public"]
   * @param {string} [route="/"]
   */
  constructor(app, directory = "./public", route = "/") {
    app.use(route, express.static(path.join(directory)));
  }
}
