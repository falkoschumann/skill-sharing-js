// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { TalksUpdatedEvent } from "../infrastructure/api.js";
import {
  AddCommentCommand,
  DeleteTalkCommand,
  SubmitTalkCommand,
} from "../domain/messages.js";

const initialState = {
  talks: [],
  user: "Anon",
};

const start = createAsyncThunk("talks/start", async (action, thunkApi) => {
  const { api, repository } = thunkApi.extra;

  api.addEventListener(TalksUpdatedEvent.TYPE, (event) =>
    thunkApi.dispatch(talksUpdated({ talks: event.talks })),
  );
  api.connect();

  const user = await repository.load();
  thunkApi.dispatch(userChanged({ username: user?.username ?? "Anon" }));
});

const changeUser = createAsyncThunk(
  "talks/changeUser",
  async (action, thunkApi) => {
    const { repository } = thunkApi.extra;
    const { username } = action.payload;
    await repository.store({ username });
    return { username };
  },
);

const submitTalk = createAsyncThunk(
  "talks/submitTalk",
  async (action, thunkApi) => {
    const { api } = thunkApi.extra;
    const presenter = thunkApi.getState().user;
    const { title, summary } = action.payload;
    const command = SubmitTalkCommand.create({
      title,
      presenter,
      summary,
    });
    api.submitTalk(command);
  },
);

const addComment = createAsyncThunk(
  "talks/addComment",
  async (action, thunkApi) => {
    const { api } = thunkApi.extra;
    const author = thunkApi.getState().user;
    const { title, message } = action.payload;
    const command = AddCommentCommand.create({
      title,
      comment: Comment.create({ author, message }),
    });
    api.addComment(command);
  },
);

const deleteTalk = createAsyncThunk(
  "talks/deleteTalk",
  async (action, thunkApi) => {
    const { api } = thunkApi.extra;
    const { title } = action.payload;
    const command = DeleteTalkCommand.create({ title });
    api.deleteTalk(command);
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
  selectors: {
    selectTalks: (state) => state.talks,
    selectUser: (state) => state.user,
  },
});

export default talksSlice.reducer;

// Async Thunks
export { start, changeUser, submitTalk, addComment, deleteTalk };

// Sync Actions
export const { userChanged, talksUpdated } = talksSlice.actions;

// Selectors
export const { selectTalks, selectUser } = talksSlice.selectors;
