import { defineConfig } from "vitest/config";
import { fileURLToPath } from "node:url";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  resolve: {
    alias: {
      // `server-only` throws outside a React Server Component; stub it in tests
      // so server-only modules (Prisma adapters) can be imported by unit/integration tests.
      "server-only": fileURLToPath(new URL("./test/server-only-stub.ts", import.meta.url)),
    },
  },
  test: {
    globals: true,
    // Default environment is node — pure logic/domain/config tests run fast under
    // node. React component tests (*.test.tsx) opt into jsdom per-file via the
    // `// @vitest-environment jsdom` pragma at the top of the file, so the
    // existing node-env suite is never slowed down or broken.
    environment: "node",
    // jest-dom matchers (toBeInTheDocument, toHaveTextContent, ...) are registered
    // for every test file; the import is a no-op for node-only suites.
    setupFiles: ["./test/setup-testing-library.ts"],
    include: [
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      "src/**/__tests__/**/*.test.ts",
      "src/**/__tests__/**/*.test.tsx",
    ],
  },
});
