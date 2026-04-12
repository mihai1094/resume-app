/**
 * Centralized logger mock for tests.
 *
 * Usage:
 *   import { mockLoggerModule } from "@/tests/mocks/logger";
 *   vi.mock("@/lib/services/logger", () => mockLoggerModule());
 */

import { vi } from "vitest";

interface MockLogger {
  error: ReturnType<typeof vi.fn>;
  warn: ReturnType<typeof vi.fn>;
  info: ReturnType<typeof vi.fn>;
  debug: ReturnType<typeof vi.fn>;
  child: ReturnType<typeof vi.fn>;
}

export function createMockLogger(): MockLogger {
  const mock: MockLogger = {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    child: vi.fn(),
  };
  mock.child.mockReturnValue(mock);
  return mock;
}

/** Returns a mock module shape for `vi.mock("@/lib/services/logger", () => ...)` */
export function mockLoggerModule() {
  const mockLogger = createMockLogger();
  return {
    logger: mockLogger,
    aiLogger: mockLogger,
    authLogger: mockLogger,
    storageLogger: mockLogger,
    firestoreLogger: mockLogger,
    createLogger: () => mockLogger,
  };
}
