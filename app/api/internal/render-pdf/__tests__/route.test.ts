// @vitest-environment node

import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { POST } from "../route";
import { makeRequest } from "@/tests/mocks/next";

const { mockRenderHtmlToPdf, mockApplyRateLimit, mockRateLimitResponse } = vi.hoisted(() => ({
  mockRenderHtmlToPdf: vi.fn(),
  mockApplyRateLimit: vi.fn(),
  mockRateLimitResponse: vi.fn((error: Error) =>
    Response.json({ error: error.message }, { status: 429 })
  ),
}));

vi.mock("@/lib/services/pdf-renderer", () => ({
  renderHtmlToPdf: mockRenderHtmlToPdf,
}));

vi.mock("@/lib/api/rate-limit", () => ({
  applyRateLimit: mockApplyRateLimit,
  rateLimitResponse: mockRateLimitResponse,
}));

const API_PATH = "/api/internal/render-pdf";
const ORIGINAL_SECRET = process.env.INTERNAL_API_SECRET;

describe("POST /api/internal/render-pdf", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.INTERNAL_API_SECRET = "test-secret";
    mockApplyRateLimit.mockResolvedValue(undefined);
    mockRenderHtmlToPdf.mockResolvedValue(Buffer.from("%PDF-1.4 test"));
  });

  afterAll(() => {
    process.env.INTERNAL_API_SECRET = ORIGINAL_SECRET;
  });

  it("fails closed when the internal secret is not configured", async () => {
    delete process.env.INTERNAL_API_SECRET;

    const response = await POST(
      makeRequest(API_PATH, { html: "<h1>Hi</h1>" }, {
        headers: { "x-internal-secret": "test-secret" },
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(503);
    expect(payload.error).toBe("Not configured");
    expect(mockRenderHtmlToPdf).not.toHaveBeenCalled();
  });

  it("rejects requests with the wrong secret", async () => {
    const response = await POST(
      makeRequest(API_PATH, { html: "<h1>Hi</h1>" }, {
        headers: { "x-internal-secret": "wrong-secret" },
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(401);
    expect(payload.error).toBe("Unauthorized");
    expect(mockApplyRateLimit).not.toHaveBeenCalled();
  });

  it("rejects oversized HTML payloads", async () => {
    const response = await POST(
      makeRequest(
        API_PATH,
        { html: "x".repeat(1024 * 1024 + 1) },
        { headers: { "x-internal-secret": "test-secret" } }
      )
    );
    const payload = await response.json();

    expect(response.status).toBe(413);
    expect(payload.error).toBe("HTML payload too large");
    expect(mockRenderHtmlToPdf).not.toHaveBeenCalled();
  });

  it("renders a PDF when authorized", async () => {
    const response = await POST(
      makeRequest(API_PATH, { html: "<h1>Hi</h1>" }, {
        headers: { "x-internal-secret": "test-secret" },
      })
    );

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(mockApplyRateLimit).toHaveBeenCalled();
    expect(mockRenderHtmlToPdf).toHaveBeenCalledWith("<h1>Hi</h1>");
  });
});
