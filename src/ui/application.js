// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import express from "express";

import { Service } from "../application/service.js";
import { RepositoryConfiguration } from "../infrastructure/repository.js";
import { TalksController } from "./talks-controller.js";
import { StaticFilesController } from "./static-files-controller.js";
import { ConsoleGateway } from "../../public/js/infrastructure/console_gateway.js";

export class SkillSharingConfiguration {
  static create({
    server = ServerConfiguration.create(),
    repository = RepositoryConfiguration.create(),
  } = {}) {
    return new SkillSharingConfiguration(server, repository);
  }

  constructor(server, repository) {
    this.server = server;
    this.repository = repository;
  }
}

export class ServerConfiguration {
  static create({
    address = process.env.SERVER_ADDRESS || "localhost",
    port = process.env.SERVER_PORT || 8080,
  } = {}) {
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
    return new SkillSharingApplication(
      configuration.server,
      service,
      ConsoleGateway.create(),
    );
  }

  #configuration;
  #console;
  #app;
  #server;

  constructor(configuration, service, console) {
    this.#configuration = configuration;
    this.#console = console;

    this.#app = express();
    this.#app.set("x-powered-by", false);
    this.#app.use(express.json());
    new StaticFilesController(this.#app);
    new TalksController(this.#app, service);
  }

  async start() {
    this.#console.info("Starting server...");
    const { address, port } = this.#configuration;
    await new Promise((resolve) => {
      this.#server = this.#app.listen(port, address);
      this.#server.on("listening", () => resolve());
    });
    this.#console.info(`Server is listening on ${address}:${port}.`);
  }

  async stop() {
    this.#console.info("Stopping server...");
    await new Promise((resolve) => {
      this.#server.on("close", () => resolve());
      this.#server.close();
    });
    this.#console.info("Server stopped.");
  }
}
