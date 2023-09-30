export class Api {
  #baseUrl;

  constructor({ baseUrl = '/api' } = {}) {
    this.#baseUrl = baseUrl;
  }

  async getTalks(tag) {
    const response = await fetch(`${this.#baseUrl}/talks`, {
      headers: tag && {
        'If-None-Match': tag,
        Prefer: 'wait=90',
      },
    });
    const talks = await response.json();
    return {
      notModified: response.status === 304,
      tag: response.headers.get('ETag'),
      talks,
    };
  }

  async putTalk({ title, presenter, summary }) {
    await fetch(this.#talkUrl(title), {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ presenter, summary }),
    });
  }

  async deleteTalk(title) {
    await fetch(this.#talkUrl(title), { method: 'DELETE' });
  }

  async postComment(talkTitle, comment) {
    await fetch(this.#talkUrl(talkTitle) + '/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(comment),
    });
  }

  #talkUrl(title) {
    return `${this.#baseUrl}/talks/` + encodeURIComponent(title);
  }
}