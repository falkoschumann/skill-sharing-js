// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

/**
 * @typedef {import('node:http').Server} http.Server
 */

import express from 'express';
import { StaticFilesController } from '@muspellheim/shared/node';

import { TalksController } from './talks-controller.js';
import { Service } from '../application/service.js';
import { RepositoryConfiguration } from '../infrastructure/repository.js';

export class SkillSharingConfiguration {
  /**
   * @param {Partial<SkillSharingConfiguration>} [configuration]
   */
  static create({
    server = ServerConfiguration.create({
      address: 'localhost',
      port: 3000,
    }),
    repository = RepositoryConfiguration.create(),
  } = {}) {
    return new SkillSharingConfiguration(server, repository);
  }

  /**
   * @param {ServerConfiguration} server
   * @param {RepositoryConfiguration} repository
   */
  constructor(server, repository) {
    this.server = server;
    this.repository = repository;
  }
}

export class ServerConfiguration {
  // TODO Move to @muspellheim/shared

  /**
   * @param {Partial<ServerConfiguration>} [configuration]
   */
  static create({ address = '0.0.0.0', port = 8080 } = {}) {
    return new ServerConfiguration(address, port);
  }

  /**
   * @param {string} address
   * @param {number} port
   */
  constructor(address, port) {
    this.address = address;
    this.port = port;
  }
}

export class SkillSharingApplication {
  /**
   * @param {SkillSharingConfiguration} configuration
   */
  static create(configuration) {
    const service = Service.create(configuration);
    return new SkillSharingApplication(configuration.server, service);
  }

  /** @type {ServerConfiguration} */
  #configuration;

  /** @type {express.Express} */
  #app;

  /** @type {http.Server} */
  #server;

  /**
   * @param {ServerConfiguration} configuration
   * @param {Service} service
   */
  constructor(configuration, service) {
    this.#configuration = configuration;

    this.#app = express();
    this.#app.set('x-powered-by', false);
    this.#app.use(express.json());
    new StaticFilesController(this.#app, './dist');
    new TalksController(this.#app, service);
  }

  async start() {
    // TODO Use logger instead of console
    console.info('Starting server...');
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
    console.info('Stopping server...');
    await new Promise((resolve) => {
      this.#server.on('close', () => resolve());
      this.#server.close();
    });
    console.info('Server stopped.');
  }
}
