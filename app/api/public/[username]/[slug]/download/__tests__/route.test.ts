// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest, NextResponse } from "next/server";

const {
  mockGetPublicResumeBySlug,
  mockIncrementDownloadCountServer,
  mockTrackPublicEvent,
  mockDetermineSource,
  mockSerializeTemplate,
  mockRenderHtmlToPdf,
  mockApplyRateLimit,
  mockRateLimitResponse,
  mockWithTimeout,
  mockTimeoutResponse,
  mockParseStoredConsent,
  mockIsConsentGranted,
  mockLaunchFlags,
  MockTimeoutError,
} = vi.hoisted(() => {
  class MockTimeoutError extends Error {}
  return {
    mockGetPublicResumeBySlug: vi.fn(),
    mockIncrementDownloadCountServer: vi.fn(),
    mockTrackPublicEvent: vi.fn(),
    mockDetermineSource: vi.fn(() => "direct"),
    mockSerializeTemplate: vi.fn(),
    mockRenderHtmlToPdf: vi.fn(),
    mockApplyRateLimit: vi.fn(),
    mockRateLimitResponse: vi.fn((error: Error) =>
      NextResponse.json({ error: error.message }, { status: 429 })
    ),
    mockWithTimeout: vi.fn(async (promise: Promise<unknown>) => promise),
    mockTimeoutResponse: vi.fn((error: Error) =>
      NextResponse.json({ error: error.message, code: "TIMEOUT" }, { status: 504 })
    ),
    mockParseStoredConsent: vi.fn(() => ({ resumeAnalytics: false })),
    mockIsConsentGranted: vi.fn(() => false),
    mockLaunchFlags: {
      features: {
        publicSharing: true,
      },
    },
    MockTimeoutError,
  };
});

vi.mock("@/lib/services/sharing-service", () => ({
  sharingService: {
    getPublicResumeBySlug: mockGetPublicResumeBySlug,
  },
}));

vi.mock("@/lib/services/sharing-service-server", () => ({
  incrementDownloadCountServer: mockIncrementDownloadCountServer,
}));

vi.mock("@/lib/services/analytics-service-server", () => ({
  analyticsServiceServer: {
    trackPublicEvent: mockTrackPublicEvent,
    determineSource: mockDetermineSource,
  },
}));

vi.mock("@/lib/services/template-serializer", () => ({
  serializeTemplate: mockSerializeTemplate,
}));

vi.mock("@/lib/services/pdf-renderer", () => ({
  renderHtmlToPdf: mockRenderHtmlToPdf,
}));

vi.mock("@/lib/api/rate-limit", () => ({
  applyRateLimit: mockApplyRateLimit,
  rateLimitResponse: mockRateLimitResponse,
}));

vi.mock("@/lib/api/timeout", () => ({
  withTimeout: mockWithTimeout,
  timeoutResponse: mockTimeoutResponse,
  TimeoutError: MockTimeoutError,
}));

vi.mock("@/lib/services/logger", () => ({
  logger: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn(),
    child: () => ({
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    }),
  },
}));

vi.mock("@/lib/privacy/consent", () => ({
  COOKIE_CONSENT_COOKIE_NAME: "rz-consent",
  parseStoredConsent: mockParseStoredConsent,
  isConsentGranted: mockIsConsentGranted,
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
    mockSerializeTemplate.mockResolvedValue("<html><body>resume</body></html>");
    mockRenderHtmlToPdf.mockResolvedValue(Buffer.from("pdf"));
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
    expect(response.headers.get("Content-Length")).toBe("3");
    expect(response.headers.get("X-Cache")).toBe("MISS");
    expect(mockSerializeTemplate).toHaveBeenCalledTimes(1);
    expect(mockRenderHtmlToPdf).toHaveBeenCalledTimes(1);
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
    expect(mockRenderHtmlToPdf).toHaveBeenCalledTimes(1);
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
