import { FlatCompat } from "@eslint/eslintrc";
import { fileURLToPath } from "node:url";
import path from "node:path";

const configDirectory = path.dirname(fileURLToPath(import.meta.url));
const compat = new FlatCompat({ baseDirectory: configDirectory });

export default [
  {
    ignores: [
      ".next/**",
      "coverage/**",
      "next-env.d.ts",
      "node_modules/**",
      "patch_state.js",
      "playwright-report/**",
      "test-results/**",
      "tsconfig.tsbuildinfo",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "react/no-unescaped-entities": "warn",
    },
  },
  {
    files: ["tests/**/*.{ts,tsx}"],
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
];
