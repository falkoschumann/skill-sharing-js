import { rmSync } from 'node:fs';

import { beforeEach, describe, expect, test } from '@jest/globals';

import { Repository } from '../../../src/server/infrastructure/repository.js';

const fileName = './data/talks.test.json';

describe('repository', () => {
  beforeEach(() => {
    rmSync(fileName, { force: true });
  });

  describe('find all', () => {
    test('returns list of talks', async () => {
      let repository = new Repository({
        fileName: './tests/server/data/example.json',
      });

      let talks = await repository.findAll();

      expect(talks).toEqual([
        { title: 'Foobar', summary: 'Lorem ipsum', comments: [] },
      ]);
    });

    test('returns empty list, if file does not exist', async () => {
      let repository = new Repository({
        fileName: './tests/server/data/non-existent.json',
      });

      let talks = await repository.findAll();

      expect(talks).toEqual([]);
    });

    test('returns empty list, if file is corrupt', async () => {
      let repository = new Repository({
        fileName: './tests/server/data/corrupt.json',
      });

      let talks = await repository.findAll();

      expect(talks).toEqual([]);
    });
  });

  describe('find by title', () => {
    test('returns talk with title', async () => {
      let repository = new Repository({
        fileName: './tests/server/data/example.json',
      });

      let talk = await repository.findByTitle('Foobar');

      expect(talk).toEqual({
        title: 'Foobar',
        summary: 'Lorem ipsum',
        comments: [],
      });
    });

    test('returns undefined if talk with title does not exist', async () => {
      let repository = new Repository({
        fileName: './tests/server/data/example.json',
      });

      let talk = await repository.findByTitle('not a talk');

      expect(talk).toBeUndefined();
    });
  });

  describe('add', () => {
    test('creates file, if file does not exist', async () => {
      let repository = new Repository({ fileName });
      let talks = await repository.findAll();

      await repository.add({
        title: 'foobar',
        author: 'Anon',
        summary: 'lorem ipsum',
        comments: [],
      });

      talks = await repository.findAll();
      expect(talks).toEqual([
        {
          title: 'foobar',
          author: 'Anon',
          summary: 'lorem ipsum',
          comments: [],
        },
      ]);
    });

    test('adds talk, if file exists', async () => {
      let repository = new Repository({ fileName });
      await repository.add({
        title: 'foo',
        author: 'Anon',
        summary: 'lorem',
        comments: [],
      });

      await repository.add({
        title: 'bar',
        author: 'Bob',
        summary: 'ipsum',
        comments: [],
      });

      let talks = await repository.findAll();
      expect(talks).toEqual([
        { title: 'foo', author: 'Anon', summary: 'lorem', comments: [] },
        { title: 'bar', author: 'Bob', summary: 'ipsum', comments: [] },
      ]);
    });

    test('updates talk, if talk exists', async () => {
      let repository = new Repository({ fileName });
      await repository.add({
        title: 'foo',
        author: 'Anon',
        summary: 'lorem',
        comments: [],
      });

      await repository.add({
        title: 'foo',
        author: 'Bob',
        summary: 'ipsum',
        comments: [],
      });

      let talks = await repository.findAll();
      expect(talks).toEqual([
        { title: 'foo', author: 'Bob', summary: 'ipsum', comments: [] },
      ]);
    });
  });

  describe('remove', () => {
    test('removes talk from file', async () => {
      let repository = new Repository({ fileName });
      await repository.add({
        title: 'foobar',
        author: 'Anon',
        summary: 'lorem ipsum',
        comments: [],
      });

      await repository.remove('foobar');

      let talks = await repository.findAll();
      expect(talks).toEqual([]);
    });
  });
});
