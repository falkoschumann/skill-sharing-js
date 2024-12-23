/**
 * @typedef {import('../../shared/talks.js').Talk} Talk
 */

/**
 * @param {string} username
 * @returns {{type: string, username: string}}
 */
export function changeUser(username) {
  return { type: 'change-user', username };
}

/**
 * @param {Talk[]} talks
 * @returns {{type: string, talks: Talk[]}}
 */
export function talksUpdated(talks) {
  return { type: 'talks-updated', talks };
}
