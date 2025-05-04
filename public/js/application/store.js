// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { configureStore } from "@reduxjs/toolkit";

import talksReducer from "./talks_slice.js";
import { UsersRepository } from "../infrastructure/users_repository.js";
import { TalksApi } from "../infrastructure/talks_api.js";

export const store = createStore(TalksApi.create(), UsersRepository.create());

export function createStore(api, repository) {
  return configureStore({
    reducer: {
      talks: talksReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        thunk: {
          extraArgument: { api, repository },
        },
      }),
  });
}
