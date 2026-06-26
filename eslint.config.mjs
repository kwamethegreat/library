import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import nextPlugin from "@next/eslint-plugin-next";
import tseslint from "typescript-eslint";
import importPlugin from "eslint-plugin-import";
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

  // Import resolution (understands @/ aliases) + import ordering  [0.15]
  {
    files: ["**/*.ts", "**/*.tsx"],
    plugins: {
      import: importPlugin,
    },
    settings: {
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
          project: "./tsconfig.json",
        },
      },
    },
    rules: {
      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
          ],
          pathGroups: [
            { pattern: "@/**", group: "internal", position: "after" },
          ],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
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
