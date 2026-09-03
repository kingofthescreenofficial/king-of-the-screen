import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const projectRoot = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": projectRoot,
    },
  },
  test: {
    clearMocks: true,
    coverage: {
      all: true,
      exclude: [
        "tests/**",
        "next-env.d.ts",
        "next.config.mjs",
        "playwright.config.ts",
        "vitest.config.mts",
      ],
      include: ["lib/pricing.ts", "lib/feature-flags.ts"],
      provider: "v8",
      thresholds: {
        branches: 80,
        functions: 80,
        lines: 80,
        statements: 80,
      },
    },
    environment: "node",
    exclude: ["tests/e2e/**"],
    include: ["tests/**/*.{test,spec}.{ts,tsx}"],
    setupFiles: ["./tests/setup.ts"],
  },
});
