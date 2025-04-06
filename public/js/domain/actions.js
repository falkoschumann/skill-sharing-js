// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

/**
 * @typedef {import('../../../shared/talks.js').Talk} Talk
 */

// See https://github.com/redux-utilities/flux-standard-action

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
 * @returns {{type: string, payload: {username: string}}}
 */
export function changeUser(username) {
  return { type: CHANGE_USER_ACTION, payload: { username } };
}

/**
 * @param {string} username
 * @returns {{type: string, payload: {username: string}}}
 */
export function userChanged(username) {
  return { type: USER_CHANGED_ACTION, payload: { username } };
}

/**
 * @param {string} title
 * @param {string} summary
 * @returns {{type: string, payload: {title: string, summary: string}}}
 */
export function submitTalk(title, summary) {
  return { type: SUBMIT_TALK_ACTION, payload: { title, summary } };
}

/**
 * @param {string} title
 * @param {string} message
 * @returns {{type: string, payload: {title: string, message: string}}}
 */
export function addComment(title, message) {
  return { type: ADD_COMMENT_ACTION, payload: { title, message } };
}

/**
 * @param {string} title
 * @returns {{type: string, payload: {title: string}}}
 */
export function deleteTalk(title) {
  return { type: DELETE_TALK_ACTION, payload: { title } };
}

/**
 * @param {Talk[]} talks
 * @returns {{type: string, payload: {talks: Talk[]}}}
 */
export function talksUpdated(talks) {
  return { type: TALKS_UPDATED_ACTION, payload: { talks } };
}
