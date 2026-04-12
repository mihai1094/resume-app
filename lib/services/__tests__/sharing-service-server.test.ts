// @vitest-environment node
import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockUpdate } = vi.hoisted(() => ({
  mockUpdate: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => ({
  getAdminDb: () => ({
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        update: mockUpdate,
      })),
    })),
  }),
}));

vi.mock("firebase-admin/firestore", () => ({
  FieldValue: {
    increment: vi.fn((n: number) => `increment(${n})`),
  },
}));

vi.mock("@/lib/services/logger", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    child: () => ({
      error: vi.fn(),
      warn: vi.fn(),
      info: vi.fn(),
      debug: vi.fn(),
    }),
  },
}));

import {
  incrementViewCountServer,
  incrementDownloadCountServer,
} from "../sharing-service-server";

describe("sharing-service-server", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUpdate.mockResolvedValue(undefined);
  });

  describe("incrementViewCountServer", () => {
    it("calls update with increment on viewCount", async () => {
      await incrementViewCountServer("resume-123");
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          viewCount: "increment(1)",
        })
      );
    });

    it("does not throw when update fails", async () => {
      mockUpdate.mockRejectedValue(new Error("Firestore error"));
      await expect(
        incrementViewCountServer("resume-123")
      ).resolves.toBeUndefined();
    });
  });

  describe("incrementDownloadCountServer", () => {
    it("calls update with increment on downloadCount", async () => {
      await incrementDownloadCountServer("resume-456");
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          downloadCount: "increment(1)",
        })
      );
    });

    it("does not throw when update fails", async () => {
      mockUpdate.mockRejectedValue(new Error("Firestore error"));
      await expect(
        incrementDownloadCountServer("resume-456")
      ).resolves.toBeUndefined();
    });
  });
});
