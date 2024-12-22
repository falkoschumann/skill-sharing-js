// Copyright (c) 2023-2024 Falko Schumann. All rights reserved. MIT license.

import { ConfigurationProperties } from '@muspellheim/shared/node';

import {
  SkillSharingApplication,
  SkillSharingConfiguration,
} from './ui/application.js';

// TODO Workaround for missing `await` in top-level code in CJS for pkg.
async function main() {
  const configurationProperties = ConfigurationProperties.create({
    defaultProperties: SkillSharingConfiguration.create(),
  });
  const configuration = await configurationProperties.get();
  const application = SkillSharingApplication.create(configuration);
  await application.start();
}

main();
