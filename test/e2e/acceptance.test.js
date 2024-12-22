// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

import fs from 'node:fs/promises';
import path from 'node:path';
import puppeteer from 'puppeteer';
import { describe, expect, it } from 'vitest';

import {
  ServerConfiguration,
  SkillSharingApplication,
  SkillSharingConfiguration,
} from '../../api/ui/application.js';
import { RepositoryConfiguration } from '../../api/infrastructure/repository.js';

/**
 * @typedef {import('puppeteer').Browser} Browser
 * @typedef {import('puppeteer').Page} Page
 */

describe('User Acceptance Tests', () => {
  it('Submit and comment a talk', async () => {
    await startAndStop(async (browser) => {
      const app = new SkillSharing(browser);
      await app.gotoSubmission();
      await app.setViewport({ width: 800, height: 1024 });
      await app.saveScreenshot({ name: '01-app-started' });

      await app.submitTalk({ title: 'Foobar', summary: 'Lorem ipsum' });
      await app.saveScreenshot({ name: '02-talk-submitted' });
      await app.verifyTalkAdded({ title: 'Foobar', summary: 'Lorem ipsum' });

      await app.changeUser({ name: 'Bob' });
      await app.commentOnTalk({ comment: 'Amazing!' });
      await app.saveScreenshot({ name: '03-talk-commented' });
      await app.verifyCommentAdded({ author: 'Bob', comment: 'Amazing!' });

      await app.changeUser({ name: 'Anon' });
      await app.commentOnTalk({ comment: 'Thanks.' });
      await app.saveScreenshot({ name: '04-comment-answered' });
      await app.verifyCommentAdded({ author: 'Anon', comment: 'Thanks.' });
    });
  });
});

/**
 * @param {function(Browser): Promise<void>} run
 */
async function startAndStop(run) {
  const fileName = path.join(
    import.meta.dirname,
    '../../testdata/e2e.acceptance.json',
  );
  await fs.rm(fileName, { force: true });
  const screenshotsDir = path.join(import.meta.dirname, '../../screenshots');
  await fs.mkdir(screenshotsDir, { recursive: true });

  const configuration = SkillSharingConfiguration.create({
    server: ServerConfiguration.create({ address: 'localhost', port: 4444 }),
    repository: RepositoryConfiguration.create({ fileName }),
  });

  const application = SkillSharingApplication.create(configuration);
  await application.start();
  // FIXME https://pptr.dev/troubleshooting#setting-up-chrome-linux-sandbox
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    await run(browser);
  } finally {
    await browser.close();
    await application.stop();
  }
}

class SkillSharing {
  #browser;
  /** @type {Page} */ #page;

  /**
   * @param {Browser} browser
   */
  constructor(browser) {
    this.#browser = browser;
  }

  async setViewport({ width, height }) {
    await this.#page.setViewport({ width, height });
  }

  async saveScreenshot({ name }) {
    await this.#page.screenshot({ path: `screenshots/${name}.png` });
  }

  async gotoSubmission() {
    this.#page = await this.#browser.newPage();
    // TODO Use port from configuration
    await this.#page.goto('http://localhost:4444');
  }

  async changeUser({ name }) {
    const usernameInput = await this.#page.waitForSelector(
      's-user-field input[name="username"]',
    );
    await usernameInput.evaluate((node) => (node.value = ''));
    await usernameInput.type(name);
  }

  async submitTalk({ title, summary }) {
    const titleInput = await this.#page.waitForSelector(
      's-talk-form input[name="title"]',
    );
    await titleInput.type(title);

    const summaryInput = await this.#page.waitForSelector(
      's-talk-form textarea[name="summary"]',
    );
    await summaryInput.type(summary);

    const submitButton = await this.#page.waitForSelector(
      's-talk-form button[type="submit"]',
    );
    await submitButton.click();
  }

  async commentOnTalk({ comment }) {
    const commentInput = await this.#page.waitForSelector(
      's-talks input[name="comment"]',
    );
    await commentInput.type(comment);

    const submitButton = await this.#page.waitForSelector(
      's-talks button[type="submit"]',
    );
    await submitButton.click();
  }

  async verifyTalkAdded({ title, summary }) {
    const lastTalkTitle = await this.#page.waitForSelector(
      's-talks section.talk:last-child h2',
    );
    expect(await lastTalkTitle.evaluate((node) => node.textContent)).toContain(
      title,
    );

    const lastTalkSummary = await this.#page.waitForSelector(
      's-talks section.talk:last-child p',
    );
    expect(
      await lastTalkSummary.evaluate((node) => node.textContent),
    ).toContain(summary);
  }

  async verifyCommentAdded({ author, comment }) {
    const lastTalksCommentElement = await this.#page.waitForSelector(
      's-talks section.talk:last-child .comment:last-child',
    );
    const lastTalksComment = await lastTalksCommentElement.evaluate(
      (node) => node.textContent,
    );
    expect(lastTalksComment).toContain(author);
    expect(lastTalksComment).toContain(comment);
  }
}
