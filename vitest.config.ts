import { fileURLToPath } from "node:url";

import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";

export default defineConfig(({ mode }) => ({
  test: {
    // describe/it/expect/vi available without imports.
    globals: true,
    // Guards are server-side; no DOM needed.
    environment: "node",
    include: ["src/**/*.{test,spec}.{ts,tsx}"],
    // Load .env.test (and .env) so env.ts's import-time validation passes.
    // These are placeholder values; tests mock Supabase, so they aren't real.
    env: loadEnv(mode, process.cwd(), ""),
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["src/lib/**"],
    },
  },
  resolve: {
    alias: {
      // Mirror the "@/*" -> "./src/*" tsconfig path alias.
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
}));
