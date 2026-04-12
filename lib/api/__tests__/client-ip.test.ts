import { describe, expect, it } from "vitest";
import { extractClientIp } from "../client-ip";

describe("extractClientIp", () => {
  it("prefers trusted proxy headers", () => {
    const headers = new Headers({
      "x-vercel-forwarded-for": "203.0.113.10",
      "x-forwarded-for": "198.51.100.7",
    });

    expect(extractClientIp(headers)).toBe("203.0.113.10");
  });

  it("falls back to x-forwarded-for and extracts the first IP", () => {
    const headers = new Headers({
      "x-forwarded-for": "198.51.100.7, 203.0.113.10",
    });

    expect(extractClientIp(headers)).toBe("198.51.100.7");
  });

  it("returns unknown for malformed values", () => {
    const headers = new Headers({
      "x-forwarded-for": "definitely-not-an-ip",
    });

    expect(extractClientIp(headers)).toBe("unknown");
  });
});
