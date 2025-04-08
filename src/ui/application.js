// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import express from "express";

import { Service } from "../application/service.js";
import { RepositoryConfiguration } from "../infrastructure/repository.js";
import { TalksController } from "./talks-controller.js";
import { StaticFilesController } from "./static-files-controller.js";

export class SkillSharingConfiguration {
  static create({
    server = ServerConfiguration.create({
      address: process.env.SERVER_ADDRESS,
      port: process.env.SERVER_PORT,
    }),
    repository = RepositoryConfiguration.create({
      fileName: process.env.REPOSITORY_FILE_NAME,
    }),
  } = {}) {
    return new SkillSharingConfiguration(server, repository);
  }

  constructor(server, repository) {
    this.server = server;
    this.repository = repository;
  }
}

export class ServerConfiguration {
  static create({ address = "localhost", port = 8080 } = {}) {
    return new ServerConfiguration(address, port);
  }

  constructor(address, port) {
    this.address = address;
    this.port = port;
  }
}

export class SkillSharingApplication {
  static create(configuration = SkillSharingConfiguration.create()) {
    const service = Service.create(configuration);
    return new SkillSharingApplication(configuration.server, service);
  }

  #configuration;
  #app;
  #server;

  constructor(configuration, service) {
    this.#configuration = configuration;

    this.#app = express();
    this.#app.set("x-powered-by", false);
    this.#app.use(express.json());
    new StaticFilesController(this.#app, "./dist");
    new TalksController(this.#app, service);
  }

  async start() {
    // TODO Use logger instead of console
    console.info("Starting server...");
    await new Promise((resolve) => {
      this.#server = this.#app.listen(
        this.#configuration.port,
        this.#configuration.address,
        () => resolve(),
      );
    });
    console.info(
      `Server is listening on ${this.#configuration.address}:${this.#configuration.port}.`,
    );
  }

  async stop() {
    console.info("Stopping server...");
    await new Promise((resolve) => {
      this.#server.on("close", () => resolve());
      this.#server.close();
    });
    console.info("Server stopped.");
  }
}
