import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import nextPlugin from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";
import eslintConfigPrettier from "eslint-config-prettier/flat";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
  // Don't lint build output or the legacy Vite app
  {
    ignores: [".next/**", "vite-frontend/**", "node_modules/**"],
  },

  // typescript-eslint, type-aware
  ...tseslint.configs.recommendedTypeChecked,

  // Next.js plugin rules (recommended + core-web-vitals), registered manually
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },

  // Enable type-aware linting + the required rule on TS files
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": "error",
    },
  },

  // Turn off type-aware rules on plain JS / config files
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    ...tseslint.configs.disableTypeChecked,
  },

  // MUST be last: disables ESLint rules that conflict with Prettier
  eslintConfigPrettier,
);
