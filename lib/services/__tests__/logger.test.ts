import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// We need to test the actual logger, so we import it directly.
// The logger reads NODE_ENV at construction time, so we set it before importing.
describe("Logger", () => {
  const originalEnv = process.env.NODE_ENV;

  afterEach(() => {
    Object.defineProperty(process.env, "NODE_ENV", { value: originalEnv, writable: true });
    vi.restoreAllMocks();
  });

  describe("in development mode", () => {
    beforeEach(() => {
      Object.defineProperty(process.env, "NODE_ENV", { value: "development", writable: true });
    });

    it("logs debug messages in development", async () => {
      vi.resetModules();
      const { logger } = await import("../logger");
      const spy = vi.spyOn(console, "log").mockImplementation(() => {});

      logger.debug("test debug message");
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls[0][0]).toContain("DEBUG");
      expect(spy.mock.calls[0][0]).toContain("test debug message");
    });

    it("logs info messages in development", async () => {
      vi.resetModules();
      const { logger } = await import("../logger");
      const spy = vi.spyOn(console, "info").mockImplementation(() => {});

      logger.info("test info message");
      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls[0][0]).toContain("INFO");
    });

    it("logs error messages with Error objects", async () => {
      vi.resetModules();
      const { logger } = await import("../logger");
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      logger.error("something broke", new Error("test error"), {
        module: "Test",
      });
      expect(spy).toHaveBeenCalled();
      const loggedData = spy.mock.calls[0][1];
      expect(loggedData).toHaveProperty("errorName", "Error");
      expect(loggedData).toHaveProperty("errorMessage", "test error");
      expect(loggedData).toHaveProperty("stack");
    });
  });

  describe("in production mode", () => {
    beforeEach(() => {
      Object.defineProperty(process.env, "NODE_ENV", { value: "production", writable: true });
    });

    it("suppresses debug messages in production", async () => {
      vi.resetModules();
      const { logger } = await import("../logger");
      const spy = vi.spyOn(console, "log").mockImplementation(() => {});

      logger.debug("should not appear");
      expect(spy).not.toHaveBeenCalled();
    });

    it("suppresses info messages in production", async () => {
      vi.resetModules();
      const { logger } = await import("../logger");
      const spy = vi.spyOn(console, "info").mockImplementation(() => {});

      logger.info("should not appear");
      expect(spy).not.toHaveBeenCalled();
    });

    it("logs warn messages in production", async () => {
      vi.resetModules();
      const { logger } = await import("../logger");
      const spy = vi.spyOn(console, "warn").mockImplementation(() => {});

      logger.warn("warning message");
      expect(spy).toHaveBeenCalled();
    });

    it("logs error messages in production without stack traces", async () => {
      vi.resetModules();
      const { logger } = await import("../logger");
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      logger.error("error message", new Error("test"));
      expect(spy).toHaveBeenCalled();
      const loggedData = spy.mock.calls[0][1];
      expect(loggedData.stack).toBeUndefined();
    });
  });

  describe("child logger", () => {
    it("creates child loggers with module context", async () => {
      Object.defineProperty(process.env, "NODE_ENV", { value: "development", writable: true });
      vi.resetModules();
      const { logger } = await import("../logger");
      const spy = vi.spyOn(console, "info").mockImplementation(() => {});

      const childLogger = logger.child({ module: "TestModule" });
      childLogger.info("child message");

      expect(spy).toHaveBeenCalled();
      expect(spy.mock.calls[0][0]).toContain("[TestModule]");
    });

    it("merges child context with call-site context", async () => {
      Object.defineProperty(process.env, "NODE_ENV", { value: "development", writable: true });
      vi.resetModules();
      const { logger } = await import("../logger");
      const spy = vi.spyOn(console, "info").mockImplementation(() => {});

      const child = logger.child({ module: "AI" });
      child.info("test", { action: "generate" });

      expect(spy.mock.calls[0][0]).toContain("[AI]");
      expect(spy.mock.calls[0][0]).toContain("(generate)");
    });
  });

  describe("PII redaction", () => {
    it("redacts email addresses from context", async () => {
      Object.defineProperty(process.env, "NODE_ENV", { value: "development", writable: true });
      vi.resetModules();
      const { logger } = await import("../logger");
      const spy = vi.spyOn(console, "info").mockImplementation(() => {});

      logger.info("user event", { data: "contact user@example.com" });

      const loggedContext = spy.mock.calls[0][1];
      expect(JSON.stringify(loggedContext)).not.toContain("user@example.com");
      expect(JSON.stringify(loggedContext)).toContain("[REDACTED_EMAIL]");
    });

    it("redacts fields named email/phone/token/password", async () => {
      Object.defineProperty(process.env, "NODE_ENV", { value: "development", writable: true });
      vi.resetModules();
      const { logger } = await import("../logger");
      const spy = vi.spyOn(console, "info").mockImplementation(() => {});

      logger.info("sensitive", {
        userEmail: "test@test.com",
        userPhone: "555-1234",
        authToken: "abc123",
        password: "secret",
      });

      const loggedContext = spy.mock.calls[0][1];
      expect(loggedContext.userEmail).toBe("[REDACTED]");
      expect(loggedContext.userPhone).toBe("[REDACTED]");
      expect(loggedContext.authToken).toBe("[REDACTED]");
      expect(loggedContext.password).toBe("[REDACTED]");
    });
  });

  describe("pre-configured loggers", () => {
    it("exports aiLogger, authLogger, storageLogger, firestoreLogger", async () => {
      vi.resetModules();
      const mod = await import("../logger");
      expect(mod.aiLogger).toBeDefined();
      expect(mod.authLogger).toBeDefined();
      expect(mod.storageLogger).toBeDefined();
      expect(mod.firestoreLogger).toBeDefined();
    });
  });
});
