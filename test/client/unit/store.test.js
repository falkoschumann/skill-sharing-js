// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

import { describe, expect, it } from 'vitest';
import { legacy_createStore as createStore, applyMiddleware } from 'redux';

import { Talk } from '../../../shared/talks.js';
import { createApiMiddleware } from '../../../src/application/api-middleware.js';
import { createRepositoryMiddleware } from '../../../src/application/repository-middleware.js';
import * as actions from '../../../src/domain/actions.js';
import { reducer } from '../../../src/domain/reducer.js';
import { User } from '../../../src/domain/users.js';
import {
  Api,
  COMMENT_ADDED_EVENT,
  TALK_DELETED_EVENT,
  TALK_SUBMITTED_EVENT,
  TalksUpdatedEvent,
} from '../../../src/infrastructure/api.js';
import { Repository } from '../../../src/infrastructure/repository.js';

describe('Store', () => {
  describe('Change user', () => {
    it('Updates user name', async () => {
      const { store, repository } = configure();
      const result = new Promise((resolve) => store.subscribe(resolve));

      const user = User.createTestInstance();
      store.dispatch(actions.changeUser(user.username));
      await result;

      const settings = await repository.load();
      expect(store.getState().user).toEqual(user.username);
      expect(settings).toEqual(user);
    });
  });

  describe('Load user', () => {
    it('Anon is the default user', async () => {
      const { store } = configure();
      const result = new Promise((resolve) => store.subscribe(resolve));

      store.dispatch(actions.start());
      await result;

      expect(store.getState().user).toEqual('Anon');
    });

    it('Is stored user', async () => {
      const user = User.createTestInstance();
      const { store } = configure({ user });
      const result = new Promise((resolve) => store.subscribe(resolve));

      store.dispatch(actions.start());
      await result;

      expect(store.getState().user).toEqual(user.username);
    });
  });

  describe('Submit talk', () => {
    it('Adds talk to list', async () => {
      const { store, api } = configure();
      const talksSubmitted = api.trackTalksSubmitted();
      const result = new Promise((resolve) =>
        api.addEventListener(TALK_SUBMITTED_EVENT, resolve),
      );

      store.dispatch(actions.submitTalk('Foobar', 'Lorem ipsum'));
      await result;

      expect(talksSubmitted.data).toEqual([
        { title: 'Foobar', presenter: 'Anon', summary: 'Lorem ipsum' },
      ]);
    });
  });

  describe('Adds comment', () => {
    it('Adds comment to an existing talk', async () => {
      const { store, api } = configure();
      const commentsAdded = api.trackCommentsAdded();
      const result = new Promise((resolve) =>
        api.addEventListener(COMMENT_ADDED_EVENT, resolve),
      );

      store.dispatch(actions.addComment('Foobar', 'Lorem ipsum'));
      await result;

      expect(commentsAdded.data).toEqual([
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
      const { store, api } = configure();
      const talksDeleted = api.trackTalksDeleted();
      const result = new Promise((resolve) =>
        api.addEventListener(TALK_DELETED_EVENT, resolve),
      );

      store.dispatch(actions.deleteTalk('Foobar'));
      await result;

      expect(talksDeleted.data).toEqual([{ title: 'Foobar' }]);
    });

    it.todo('Ignores already removed talk');
  });

  describe('Talks', () => {
    it('Lists all talks', async () => {
      const talk = Talk.createTestInstance();
      const { store, api } = configure({
        fetchResponse: {
          status: 200,
          headers: { etag: '1' },
          body: JSON.stringify([talk]),
        },
      });
      const result = new Promise((resolve) =>
        api.addEventListener(TalksUpdatedEvent.TYPE, () => resolve()),
      );

      store.dispatch(actions.start());
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
  const repository = Repository.createNull({ user });
  const api = Api.createNull({ fetchResponse });
  const store = createStore(
    reducer,
    applyMiddleware(
      createRepositoryMiddleware(repository),
      createApiMiddleware(api),
    ),
  );
  return { store, repository, api };
}
