// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

import { TALKS_UPDATED_ACTION, USER_CHANGED_ACTION } from './action-types.js';

const initialState = {
  talks: [],
  user: 'Anon',
};

export function reducer(state = initialState, action) {
  switch (action.type) {
    case USER_CHANGED_ACTION:
      return { ...state, user: action.payload.username };
    case TALKS_UPDATED_ACTION:
      return { ...state, talks: action.payload.talks };
    default:
      return state;
  }
}
