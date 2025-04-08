// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

export function reply(
  response,
  { status = 200, headers = { "Content-Type": "text/plain" }, body = "" } = {},
) {
  response.status(status).header(headers).send(body);
}
