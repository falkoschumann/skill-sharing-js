// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

/**
 * @typedef {import('../../shared/talks.js').Talk} Talk
 */

// TODO Use https://github.com/redux-utilities/flux-standard-action
//  {type: string, payload: any, error: boolean, meta: any}

import {
  ADD_COMMENT_ACTION,
  CHANGE_USER_ACTION,
  DELETE_TALK_ACTION,
  START_ACTION,
  SUBMIT_TALK_ACTION,
  TALKS_UPDATED_ACTION,
  USER_CHANGED_ACTION,
} from './action-types.js';

/**
 * @returns {{type: string}}
 */
export function start() {
  return { type: START_ACTION };
}

/**
 * @param {string} username
 * @returns {{type: string, username: string}}
 */
export function changeUser(username) {
  return { type: CHANGE_USER_ACTION, username };
}

/**
 * @param {string} username
 * @returns {{type: string, username: string}}
 */
export function userChanged(username) {
  return { type: USER_CHANGED_ACTION, username };
}

/**
 * @param {string} title
 * @param {string} summary
 * @returns {{type: string, title: string, summary: string}}
 */
export function submitTalk(title, summary) {
  return { type: SUBMIT_TALK_ACTION, title, summary };
}

/**
 * @param {string} title
 * @param {string} message
 * @returns {{type: string, title: string, message: string}}
 */
export function addComment(title, message) {
  return { type: ADD_COMMENT_ACTION, title, message };
}

/**
 * @param {string} title
 * @returns {{type: string, title: string}}
 */
export function deleteTalk(title) {
  return { type: DELETE_TALK_ACTION, title };
}

/**
 * @param {Talk[]} talks
 * @returns {{type: string, talks: Talk[]}}
 */
export function talksUpdated(talks) {
  return { type: TALKS_UPDATED_ACTION, talks };
}
