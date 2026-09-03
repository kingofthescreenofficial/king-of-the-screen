import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig(
  nextCoreWebVitals,
  nextTypeScript,
  globalIgnores([
    ".next/**",
    "coverage/**",
    "next-env.d.ts",
    "node_modules/**",
    "patch_state.js",
    "playwright-report/**",
    "test-results/**",
    "tsconfig.tsbuildinfo",
  ]),
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "react/no-unescaped-entities": "warn",
      "react-hooks/immutability": "warn",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    files: ["tests/**/*.{ts,tsx}"],
    rules: {
      "@next/next/no-html-link-for-pages": "off",
    },
  },
);
