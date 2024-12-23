// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from 'vitest';

import { createStore } from '@muspellheim/shared';

import { Service } from '../../../src/application/service.js';
import { reducer } from '../../../src/domain/reducer.js';
import { Api, TalksUpdatedEvent } from '../../../src/infrastructure/api.js';
import { Repository } from '../../../src/infrastructure/repository.js';
import { Talk } from '../../../shared/talks.js';
import { User } from '../../../src/domain/users.js';

describe('Service', () => {
  describe('Change user', () => {
    it('Updates user name', async () => {
      const { service, store, repository } = configure();

      const user = User.createTestInstance();
      await service.changeUser(user);

      const settings = await repository.load();
      expect(store.getState().user).toEqual(user.username);
      expect(settings).toEqual(user);
    });
  });

  describe('User', () => {
    it('Anon is the default user', async () => {
      const { service, store } = configure();

      await service.loadUser();

      expect(store.getState().user).toEqual('Anon');
    });

    it('Is stored user', async () => {
      const user = User.createTestInstance();
      const { service, store } = configure({ user });

      await service.loadUser();

      expect(store.getState().user).toEqual(user.username);
    });
  });

  describe('Submit talk', () => {
    it('Adds talk to list', async () => {
      const { service, api } = configure();
      const talksPut = api.trackTalksSubmitted();

      await service.submitTalk({ title: 'Foobar', summary: 'Lorem ipsum' });

      expect(talksPut.data).toEqual([
        { title: 'Foobar', presenter: 'Anon', summary: 'Lorem ipsum' },
      ]);
    });
  });

  describe('Adds comment', () => {
    it('Adds comment to an existing talk', async () => {
      const { service, api } = configure();
      const commentsPosted = api.trackCommentsAdded();

      await service.addComment({ title: 'Foobar', message: 'Lorem ipsum' });

      expect(commentsPosted.data).toEqual([
        {
          title: 'Foobar',
          comment: { author: 'Anon', message: 'Lorem ipsum' },
        },
      ]);
    });

    it.todo('Reports an error when talk does not exists');
  });

  describe('Delete talk', () => {
    it('Removes talk from list', async () => {
      const { service, api } = configure();
      const talksDeleted = api.trackTalksDeleted();

      await service.deleteTalk({ title: 'Foobar' });

      expect(talksDeleted.data).toEqual([{ title: 'Foobar' }]);
    });

    it('Ignores already removed talk', async () => {
      const { service, api } = configure();
      const talksDeleted = api.trackTalksDeleted();

      await service.deleteTalk({ title: 'Foobar' });

      expect(talksDeleted.data).toEqual([{ title: 'Foobar' }]);
    });
  });

  describe('Talks', () => {
    it('Lists all talks', async () => {
      const talk = Talk.createTestInstance();
      const { service, store, api } = configure({
        fetchResponse: {
          status: 200,
          headers: { etag: '1' },
          body: JSON.stringify([talk]),
        },
      });
      const result = new Promise((resolve) =>
        api.addEventListener(TalksUpdatedEvent.TYPE, () => resolve()),
      );

      await service.connectTalks();
      await result;

      expect(store.getState().talks).toEqual([talk]);
      await api.close();
    });
  });
});

/**
 * @param {object} [options]
 * @param {User} [options.user]
 * @param {object} [options.fetchResponse]
 */
function configure({ user, fetchResponse } = {}) {
  const store = createStore(reducer);
  const repository = Repository.createNull({ user });
  const api = Api.createNull({ fetchResponse });
  const service = new Service(store, repository, api);
  return { service, store, repository, api };
}
