// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import fsPromise from "node:fs/promises";
import path from "node:path";

import { Talk } from "../../public/js/domain/talks.js";

export class RepositoryConfiguration {
  static create({
    fileName = process.env.REPOSITORY_FILE_NAME || "./data/talks.json",
  } = {}) {
    return new RepositoryConfiguration(fileName);
  }

  static createTestInstance({ fileName = "null-repository.json" } = {}) {
    return new RepositoryConfiguration(fileName);
  }

  constructor(fileName) {
    this.fileName = fileName;
  }
}

export class Repository {
  static create(configuration = RepositoryConfiguration.create()) {
    return new Repository(configuration, fsPromise);
  }

  static createNull({ talks } = {}) {
    return new Repository(
      RepositoryConfiguration.createTestInstance(),
      new FsStub(talks),
    );
  }

  #configuration;
  #fs;

  constructor(configuration, fs) {
    this.#configuration = configuration;
    this.#fs = fs;
  }

  async findAll() {
    const talks = await this.#load();
    return talks.validate();
  }

  async findByTitle(title) {
    const talks = await this.#load();
    const talk = talks[title];
    if (talk == null) {
      return;
    }

    return Talk.create(talk);
  }

  async addOrUpdate(talk) {
    const talks = await this.#load();
    talks[talk.title] = talk;
    await this.#store(talks);
  }

  async remove(title) {
    const talks = await this.#load();
    delete talks[title];
    await this.#store(talks);
  }

  async #load() {
    try {
      const { fileName } = this.#configuration;
      const json = await this.#fs.readFile(fileName, "utf-8");
      const dto = JSON.parse(json);
      return TalksDto.create(dto);
    } catch (error) {
      if (error.code === "ENOENT") {
        // No such file or directory
        return TalksDto.create();
      }

      throw error;
    }
  }

  async #store(talks) {
    const dirName = path.dirname(this.#configuration.fileName);
    await this.#fs.mkdir(dirName, { recursive: true });

    const { fileName } = this.#configuration;
    const json = JSON.stringify(talks);
    await this.#fs.writeFile(fileName, json, "utf-8");
  }
}

class TalksDto {
  static create(dto = {}) {
    return new TalksDto(dto);
  }

  static from(talks) {
    const map = {};
    for (const talk of talks) {
      map[talk.title] = talk;
    }
    return new TalksDto(map);
  }

  constructor(talks) {
    for (const title in talks) {
      this[title] = talks[title];
    }
  }

  validate() {
    return Object.values(this).map((talk) => Talk.create(talk));
  }
}

class FsStub {
  #fileContent;

  constructor(talks) {
    if (talks != null) {
      this.#fileContent = JSON.stringify(TalksDto.from(talks));
    }
  }

  async readFile() {
    if (this.#fileContent == null) {
      const err = new Error("No such file or directory");
      err.code = "ENOENT";
      throw err;
    }

    return this.#fileContent;
  }

  async writeFile(_file, data) {
    this.#fileContent = data;
  }

  mkdir() {}
}
