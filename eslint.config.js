// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import js from "@eslint/js";
import { defineConfig, globalIgnores } from "eslint/config";
import headers from "eslint-plugin-headers";
import * as lit from "eslint-plugin-lit";
import * as wc from "eslint-plugin-wc";
import globals from "globals";

export default defineConfig([
  globalIgnores(["coverage"]),
  js.configs.recommended,
  lit.configs["flat/recommended"],
  wc.configs["flat/recommended"],
  {
    languageOptions: {
      ecmaVersion: 2022,
      globals: {
        ...globals.es2022,
        ...globals.node,
        ...globals.browser,
        //...globals.serviceworker,
        //...globals['shared-node-browser'],
      },
    },
    plugins: {
      headers,
    },
    rules: {
      "no-unused-vars": ["error", { argsIgnorePattern: "^_" }],
      "headers/header-format": [
        "error",
        {
          source: "string",
          style: "line",
          trailingNewlines: 2,
          content: `Copyright (c) ${new Date().getUTCFullYear()} Falko Schumann. All rights reserved. MIT license.`,
        },
      ],
    },
  },
]);
