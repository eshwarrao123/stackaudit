import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    // Run in Node environment (no DOM needed for engine tests)
    environment: "node",
    // Test file patterns
    include: ["tests/**/*.test.ts"],
    // Coverage (optional, use `npm run test:coverage`)
    coverage: {
      provider: "v8",
      include: ["lib/audit-engine/**"],
      reporter: ["text", "lcov"],
    },
    // Ensure tests are deterministic and isolated
    isolate: true,
    reporters: ["verbose"],
  },
  resolve: {
    // Mirror tsconfig paths so @/ imports resolve in test files
    alias: {
      "@": resolve(__dirname, "."),
    },
  },
});
