// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { TalksUpdatedEvent } from "../infrastructure/talks_api.js";
import {
  validateAddCommentCommand,
  validateDeleteTalkCommand,
  validateSubmitTalkCommand,
} from "../domain/messages.js";
import { validateComment } from "../domain/talks.js";

const initialState = {
  talks: [],
  user: "Anon",
};

const start = createAsyncThunk("talks/start", async (action, thunkApi) => {
  const { talksApi, usersRepository } = thunkApi.extra;

  talksApi.addEventListener(TalksUpdatedEvent.TYPE, (event) =>
    thunkApi.dispatch(talksUpdated({ talks: event.talks })),
  );
  talksApi.connect();

  const user = await usersRepository.load();
  thunkApi.dispatch(userChanged({ username: user?.username ?? "Anon" }));
});

const changeUser = createAsyncThunk(
  "talks/changeUser",
  async ({ username }, thunkApi) => {
    const { usersRepository } = thunkApi.extra;
    await usersRepository.store({ username });
    return { username };
  },
);

const submitTalk = createAsyncThunk(
  "talks/submitTalk",
  async ({ title, summary }, thunkApi) => {
    const { talksApi } = thunkApi.extra;
    const presenter = selectUser(thunkApi.getState());
    const command = validateSubmitTalkCommand({
      title,
      presenter,
      summary,
    });
    return talksApi.submitTalk(command);
  },
);

const addComment = createAsyncThunk(
  "talks/addComment",
  async ({ title, message }, thunkApi) => {
    const { talksApi } = thunkApi.extra;
    const author = selectUser(thunkApi.getState());
    const command = validateAddCommentCommand({
      title,
      comment: validateComment({ author, message }),
    });
    return talksApi.addComment(command);
  },
);

const deleteTalk = createAsyncThunk(
  "talks/deleteTalk",
  async ({ title }, thunkApi) => {
    const { talksApi } = thunkApi.extra;
    const command = validateDeleteTalkCommand({ title });
    return talksApi.deleteTalk(command);
  },
);

const talksSlice = createSlice({
  name: "talks",
  initialState,
  reducers: {
    userChanged: (state, action) => {
      state.user = action.payload.username;
    },
    talksUpdated: (state, action) => {
      state.talks = action.payload.talks;
    },
  },
  extraReducers: (builder) => {
    // Change user
    builder.addCase(changeUser.fulfilled, (state, action) => {
      state.user = action.payload.username;
    });
  },
  selectors: {
    selectTalks: (state) => state.talks,
    selectUser: (state) => state.user,
  },
});

export default talksSlice.reducer;

// Async Thunks
export { start, changeUser, submitTalk, addComment, deleteTalk };

// Sync Actions
const { userChanged, talksUpdated } = talksSlice.actions;

// Selectors
export const { selectTalks, selectUser } = talksSlice.selectors;
