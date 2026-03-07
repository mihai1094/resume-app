// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const mockGetPublicResumeBySlug = vi.fn();
const mockIncrementDownloadCountServer = vi.fn();
const mockTrackPublicEvent = vi.fn();
const mockDetermineSource = vi.fn(() => "direct");
const mockExportToPDF = vi.fn();
const mockApplyRateLimit = vi.fn();
const mockRateLimitResponse = vi.fn((error: Error) =>
  NextResponse.json({ error: error.message }, { status: 429 })
);
const mockWithTimeout = vi.fn(async (promise: Promise<unknown>) => promise);
const mockTimeoutResponse = vi.fn((error: Error) =>
  NextResponse.json({ error: error.message, code: "TIMEOUT" }, { status: 504 })
);
const mockParseStoredConsent = vi.fn(() => ({ resumeAnalytics: false }));
const mockIsConsentGranted = vi.fn(() => false);
const mockLaunchFlags = {
  features: {
    publicSharing: true,
  },
};

class MockTimeoutError extends Error {}

vi.mock("@/lib/services/sharing-service", () => ({
  sharingService: {
    getPublicResumeBySlug: (...args: unknown[]) =>
      mockGetPublicResumeBySlug(...args),
  },
}));

vi.mock("@/lib/services/sharing-service-server", () => ({
  incrementDownloadCountServer: (...args: unknown[]) =>
    mockIncrementDownloadCountServer(...args),
}));

vi.mock("@/lib/services/analytics-service-server", () => ({
  analyticsServiceServer: {
    trackPublicEvent: (...args: unknown[]) => mockTrackPublicEvent(...args),
    determineSource: (...args: unknown[]) => mockDetermineSource(...args),
  },
}));

vi.mock("@/lib/services/export", () => ({
  exportToPDF: (...args: unknown[]) => mockExportToPDF(...args),
}));

vi.mock("@/lib/api/rate-limit", () => ({
  applyRateLimit: (...args: unknown[]) => mockApplyRateLimit(...args),
  rateLimitResponse: (...args: unknown[]) => mockRateLimitResponse(...args),
}));

vi.mock("@/lib/api/timeout", () => ({
  withTimeout: (...args: unknown[]) => mockWithTimeout(...args),
  timeoutResponse: (...args: unknown[]) => mockTimeoutResponse(...args),
  TimeoutError: MockTimeoutError,
}));

vi.mock("@/lib/services/logger", () => ({
  logger: {
    child: () => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }),
  },
}));

vi.mock("@/lib/privacy/consent", () => ({
  COOKIE_CONSENT_COOKIE_NAME: "rz-consent",
  parseStoredConsent: (...args: unknown[]) => mockParseStoredConsent(...args),
  isConsentGranted: (...args: unknown[]) => mockIsConsentGranted(...args),
}));

vi.mock("@/config/launch", () => ({
  launchFlags: mockLaunchFlags,
}));

function makeRequest(headers: Record<string, string> = {}) {
  return new NextRequest("http://localhost/api/public/jane/resume/download", {
    method: "POST",
    headers,
  });
}

function samplePublicResume() {
  return {
    resumeId: "resume-1",
    templateId: "modern",
    isPublic: true,
    customization: {
      primaryColor: "#2563eb",
      secondaryColor: "#0f172a",
      accentColor: "#1d4ed8",
      fontFamily: "Inter",
      fontSize: "md",
      lineSpacing: "normal",
      sectionSpacing: "normal",
    },
    data: {
      personalInfo: {
        firstName: "Jane",
        lastName: "Doe",
      },
    },
  };
}

async function loadRoute() {
  vi.resetModules();
  return import("../route");
}

describe("POST /api/public/[username]/[slug]/download", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLaunchFlags.features.publicSharing = true;
    mockApplyRateLimit.mockResolvedValue(undefined);
    mockGetPublicResumeBySlug.mockResolvedValue(samplePublicResume());
    mockExportToPDF.mockResolvedValue({
      success: true,
      blob: new Blob(["pdf"], { type: "application/pdf" }),
    });
    mockIncrementDownloadCountServer.mockResolvedValue(undefined);
    mockTrackPublicEvent.mockResolvedValue(undefined);
    mockWithTimeout.mockImplementation(async (promise: Promise<unknown>) => promise);
    mockIsConsentGranted.mockReturnValue(false);
  });

  it("returns 404 immediately when public sharing is disabled", async () => {
    mockLaunchFlags.features.publicSharing = false;
    const { POST } = await loadRoute();

    const response = await POST(makeRequest(), {
      params: Promise.resolve({ username: "jane", slug: "resume" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload).toEqual({ error: "Not found" });
    expect(mockApplyRateLimit).not.toHaveBeenCalled();
  });

  it("returns 404 when the public resume cannot be found", async () => {
    mockGetPublicResumeBySlug.mockResolvedValue(null);
    const { POST } = await loadRoute();

    const response = await POST(makeRequest(), {
      params: Promise.resolve({ username: "jane", slug: "resume" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload).toEqual({ error: "Resume not found" });
  });

  it("generates a PDF response with a cache miss header", async () => {
    const { POST } = await loadRoute();

    const response = await POST(makeRequest(), {
      params: Promise.resolve({ username: "jane", slug: "resume" }),
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toContain(
      'filename="Jane_Doe_Resume.pdf"'
    );
    expect(response.headers.get("X-Cache")).toBe("MISS");
    expect(mockExportToPDF).toHaveBeenCalledTimes(1);
    expect(mockIncrementDownloadCountServer).not.toHaveBeenCalled();
  });

  it("serves a cached PDF on repeated requests", async () => {
    const { POST } = await loadRoute();

    const firstResponse = await POST(makeRequest(), {
      params: Promise.resolve({ username: "jane", slug: "resume" }),
    });
    const secondResponse = await POST(makeRequest(), {
      params: Promise.resolve({ username: "jane", slug: "resume" }),
    });

    expect(firstResponse.headers.get("X-Cache")).toBe("MISS");
    expect(secondResponse.headers.get("X-Cache")).toBe("HIT");
    expect(mockExportToPDF).toHaveBeenCalledTimes(1);
  });

  it("increments analytics counters only when consent is granted", async () => {
    mockIsConsentGranted.mockReturnValue(true);
    const { POST } = await loadRoute();

    const response = await POST(
      makeRequest({
        referer: "https://example.com/shared-resume",
        "cf-ipcountry": "US",
        cookie: "rz-consent=granted",
      }),
      {
        params: Promise.resolve({ username: "jane", slug: "resume" }),
      }
    );

    expect(response.status).toBe(200);
    expect(mockIncrementDownloadCountServer).toHaveBeenCalledWith("resume-1");
    expect(mockDetermineSource).toHaveBeenCalledWith("example.com");
    expect(mockTrackPublicEvent).toHaveBeenCalledWith("resume-1", {
      type: "download",
      source: "direct",
      country: "US",
      referrer: "example.com",
    });
  });

  it("maps rate-limit errors to the rate-limit response helper", async () => {
    mockApplyRateLimit.mockRejectedValue(new Error("Slow down"));
    const { POST } = await loadRoute();

    const response = await POST(makeRequest(), {
      params: Promise.resolve({ username: "jane", slug: "resume" }),
    });
    const payload = await response.json();

    expect(response.status).toBe(429);
    expect(payload).toEqual({ error: "Slow down" });
    expect(mockRateLimitResponse).toHaveBeenCalledTimes(1);
  });
});
