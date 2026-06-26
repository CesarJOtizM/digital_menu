// Global test setup. Registers @testing-library/jest-dom matchers
// (toBeInTheDocument, toHaveTextContent, ...) on Vitest's `expect`.
//
// This file runs for EVERY test file regardless of environment. Importing the
// matchers is a harmless no-op for node-only suites (it only augments `expect`),
// so the existing node-env pure tests keep working unchanged. React component
// tests opt into jsdom per-file via `// @vitest-environment jsdom`.
import "@testing-library/jest-dom/vitest";

import { afterEach } from "vitest";

// React Testing Library cleanup between tests. Only meaningful when a DOM exists
// (jsdom files); under node `document` is undefined so cleanup is skipped.
afterEach(async () => {
  if (typeof document === "undefined") {
    return;
  }
  const { cleanup } = await import("@testing-library/react");
  cleanup();
});
