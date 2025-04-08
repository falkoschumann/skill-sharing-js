// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { configureStore } from "@reduxjs/toolkit";

import talksReducer from "./talks_slice.js";
import { Repository } from "../infrastructure/repository.js";
import { Api } from "../infrastructure/api.js";

export const store = createStore(Api.create(), Repository.create());

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
