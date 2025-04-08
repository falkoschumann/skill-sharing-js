// Copyright (c) 2025 Falko Schumann. All rights reserved. MIT license.

import process from "node:process";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    target: "es2022",
  },
  css: {
    preprocessorOptions: {
      scss: {
        // TODO Workaround for SASS >= 1.79
        //  See https://github.com/twbs/bootstrap/issues/40849
        //  See https://github.com/twbs/bootstrap/issues/40962
        silenceDeprecations: [
          "color-functions",
          "global-builtin",
          "import",
          "mixed-decls",
        ],
      },
    },
  },
  server: {
    port: process.env.DEV_PORT ?? 8080,
    proxy: {
      "/api": {
        target: `http://localhost:${process.env.PORT ?? 3000}`,
        changeOrigin: true,
      },
    },
  },
  test: {
    coverage: {
      provider: "v8",
      include: ["public/js/**/*", "src/**/*", "test/**/*"],
    },
  },
});
