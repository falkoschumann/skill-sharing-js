// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

import { legacy_createStore as createStore, applyMiddleware } from 'redux';

import { reducer } from '../domain/reducer.js';
import { createApiMiddleware } from './api-middleware.js';
import { createRepositoryMiddleware } from './repository-middleware.js';

export const store = createStore(
  reducer,
  applyMiddleware(createRepositoryMiddleware(), createApiMiddleware()),
);
