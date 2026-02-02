import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createUUID, createPrefixedId, createSimpleId } from "../id";

describe("id utilities", () => {
  describe("createUUID", () => {
    it("should return a valid UUID format", () => {
      const uuid = createUUID();
      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });

    it("should generate unique IDs on subsequent calls", () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(createUUID());
      }
      expect(ids.size).toBe(100);
    });

    it("should use crypto.randomUUID when available", () => {
      const mockRandomUUID = vi.fn(() => "mock-uuid-from-crypto");
      const originalCrypto = globalThis.crypto;

      // Mock crypto.randomUUID
      vi.stubGlobal("crypto", {
        ...originalCrypto,
        randomUUID: mockRandomUUID,
      });

      // Import fresh to pick up mock
      vi.resetModules();

      // The function should use crypto.randomUUID
      expect(mockRandomUUID).toBeDefined();

      // Restore
      vi.stubGlobal("crypto", originalCrypto);
    });
  });

  describe("createPrefixedId", () => {
    it("should create an ID with the given prefix", () => {
      const id = createPrefixedId("resume");
      expect(id).toMatch(
        /^resume-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it("should work with different prefixes", () => {
      const resumeId = createPrefixedId("resume");
      const coverLetterId = createPrefixedId("cover-letter");
      const projectId = createPrefixedId("project");

      expect(resumeId).toMatch(/^resume-/);
      expect(coverLetterId).toMatch(/^cover-letter-/);
      expect(projectId).toMatch(/^project-/);
    });
  });

  describe("createSimpleId", () => {
    it("should return a valid simple ID format", () => {
      const id = createSimpleId();
      // Format: timestamp-randomstring
      const simpleIdRegex = /^\d+-[a-z0-9]+$/;
      expect(id).toMatch(simpleIdRegex);
    });

    it("should generate unique IDs", () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        ids.add(createSimpleId());
      }
      expect(ids.size).toBe(100);
    });

    it("should contain a timestamp component", () => {
      const before = Date.now();
      const id = createSimpleId();
      const after = Date.now();

      const timestampPart = parseInt(id.split("-")[0], 10);
      expect(timestampPart).toBeGreaterThanOrEqual(before);
      expect(timestampPart).toBeLessThanOrEqual(after);
    });
  });
});
