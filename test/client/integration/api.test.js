import { describe, expect, test } from '@jest/globals';

import { Api } from '../../../public/js/infrastructure/api.js';
import { LongPollingClient } from '../../../public/js/infrastructure/long-polling-client.js';

describe('Api', () => {
  test('Gets talks events', async () => {
    const client = LongPollingClient.createNull();
    const api = new Api(null, client);
    const events = [];
    api.addEventListener('talks-updated', (event) => events.push(event));

    await api.connectTalks();
    await client.simulateResponse({
      status: 200,
      headers: { etag: '1' },
      body: [
        {
          title: 'title 1',
          presenter: 'presenter 1',
          summary: 'summary 1',
          comments: [],
        },
      ],
    });

    expect(events).toEqual([
      expect.objectContaining({
        talks: [
          {
            title: 'title 1',
            presenter: 'presenter 1',
            summary: 'summary 1',
            comments: [],
          },
        ],
      }),
    ]);
    client.close();
  });

  test('Put talk', async () => {
    const api = Api.createNull();
    const talksPut = api.trackTalksPut();

    await api.putTalk({
      title: 'title-1',
      presenter: 'presenter-1',
      summary: 'summary-1',
    });

    expect(talksPut.data).toEqual([
      { title: 'title-1', presenter: 'presenter-1', summary: 'summary-1' },
    ]);
  });

  test('Delete talk', async () => {
    const api = Api.createNull();
    const talksDeleted = api.trackTalksDeleted();

    await api.deleteTalk('title-1');

    expect(talksDeleted.data).toEqual([{ title: 'title-1' }]);
  });

  test('Post comment', async () => {
    const api = Api.createNull();
    const commentsPosted = api.trackCommentsPosted();

    await api.postComment('title-1', {
      author: 'author-1',
      message: 'message-1',
    });

    expect(commentsPosted.data).toEqual([
      { title: 'title-1', author: 'author-1', message: 'message-1' },
    ]);
  });
});
