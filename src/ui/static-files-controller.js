// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import path from "node:path";
import express from "express";

export class StaticFilesController {
  constructor(app, directory = "./public", route = "/") {
    app.use(route, express.static(path.join(directory)));
  }
}
