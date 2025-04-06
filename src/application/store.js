// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

import { applyMiddleware, legacy_createStore as createStore } from 'redux';

import { reducer } from '../domain/reducer.js';
import { createApiMiddleware } from './api-middleware.js';
import { createRepositoryMiddleware } from './repository-middleware.js';

// TODO Replace middleware with slices for talks and user

export const store = createStore(
  reducer,
  applyMiddleware(createRepositoryMiddleware(), createApiMiddleware()),
);
