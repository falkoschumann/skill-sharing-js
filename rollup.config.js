// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import { nodeResolve } from "@rollup/plugin-node-resolve";
import replace from "@rollup/plugin-replace";
import copy from "rollup-plugin-copy";

export default [
  {
    input: {
      "lit-html": "node_modules/lit-html/lit-html.js",
      "redux-toolkit":
        "node_modules/@reduxjs/toolkit/dist/redux-toolkit.modern.mjs",
    },
    output: { dir: "./public/vendor", format: "esm" },
    plugins: [
      nodeResolve({ browser: true }),
      replace({
        "process.env.NODE_ENV": JSON.stringify("production"),
      }),
      copy({
        targets: [
          {
            src: "node_modules/bootstrap/dist/js/bootstrap.bundle.js",
            dest: "public/vendor/",
          },
          {
            src: "node_modules/bootstrap/dist/css/bootstrap.css",
            dest: "public/vendor/",
          },
        ],
      }),
    ],
  },
];
