import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    globals: true,
    passWithNoTests: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      // Only instrument unit-testable library files to get meaningful coverage
      include: [
        "lib/api/**/*.ts",
        "lib/utils.ts",
        "lib/db/**/type/**/*.ts",
      ],
      exclude: [
        "**/*.d.ts",
        "node_modules/**",
        ".next/**",
        "tests/**",
        "app/**",
        "components/**",
        "lib/auth/**",
        "lib/db/**/crud/**",
        // Exclude pure type-only modules with no runtime code
        "lib/db/address/type/**",
        "lib/db/location/type/**",
        "lib/db/customised-competition/type/**",
        "lib/db/customised-course/type/**",
        "prisma/**",
      ],
      thresholds: {
        lines: 95,
        functions: 95,
        branches: 80,
        statements: 95,
      },
    },
  },
});
