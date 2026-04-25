// @vitest-environment node

import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextResponse } from "next/server";
import { makeRequest } from "@/tests/mocks/next";

const {
  mockVerifyAuth,
  mockHandleApiError,
  mockSerializeTemplate,
  mockSerializeCoverLetterTemplate,
  mockRenderHtmlToPdf,
} = vi.hoisted(() => ({
  mockVerifyAuth: vi.fn(),
  mockHandleApiError: vi.fn(),
  mockSerializeTemplate: vi.fn(),
  mockSerializeCoverLetterTemplate: vi.fn(),
  mockRenderHtmlToPdf: vi.fn(),
}));

vi.mock("@/lib/api/auth-middleware", () => ({
  verifyAuth: mockVerifyAuth,
}));

vi.mock("@/lib/api/error-handler", () => ({
  handleApiError: mockHandleApiError,
}));

vi.mock("@/lib/services/template-serializer", () => ({
  serializeTemplate: mockSerializeTemplate,
  serializeCoverLetterTemplate: mockSerializeCoverLetterTemplate,
}));

vi.mock("@/lib/services/pdf-renderer", () => ({
  renderHtmlToPdf: mockRenderHtmlToPdf,
}));

vi.mock("@/lib/services/logger", () => ({
  logger: {
    child: () => ({
      info: vi.fn(),
      error: vi.fn(),
    }),
  },
}));

import { POST } from "../route";

describe("POST /api/user/export-pdf", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockVerifyAuth.mockResolvedValue({
      success: true,
      user: { uid: "user-1", email: "user@example.com", emailVerified: true },
    });
    mockHandleApiError.mockImplementation((error: Error) =>
      NextResponse.json({ error: error.message }, { status: 500 })
    );
    mockSerializeTemplate.mockResolvedValue("<html>resume</html>");
    mockSerializeCoverLetterTemplate.mockResolvedValue("<html>cover-letter</html>");
    mockRenderHtmlToPdf.mockResolvedValue(Buffer.from("%PDF-1.4 mocked"));
  });

  it("returns the auth middleware response when authentication fails", async () => {
    mockVerifyAuth.mockResolvedValue({
      success: false,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    });

    const response = await POST(
      makeRequest("/api/user/export-pdf", { data: { personalInfo: {} } })
    );

    expect(response.status).toBe(401);
    expect(mockSerializeTemplate).not.toHaveBeenCalled();
    expect(mockRenderHtmlToPdf).not.toHaveBeenCalled();
  });

  it("rejects oversized bodies using the content-length guard", async () => {
    const response = await POST(
      makeRequest(
        "/api/user/export-pdf",
        { data: { personalInfo: {} } },
        { headers: { "content-length": String(1024 * 1024 + 1) } }
      )
    );
    const payload = await response.json();

    expect(response.status).toBe(413);
    expect(payload.error).toBe("Request body too large");
    expect(mockSerializeTemplate).not.toHaveBeenCalled();
  });

  it("returns 400 for invalid request bodies", async () => {
    const response = await POST(
      makeRequest("/api/user/export-pdf", { data: "nope" })
    );
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.error).toBe("Invalid request body");
  });

  it("serializes a resume, renders the PDF, and returns attachment headers", async () => {
    const response = await POST(
      makeRequest("/api/user/export-pdf", {
        data: { personalInfo: { firstName: "Jane" } },
        templateId: "modern",
        customization: { primaryColor: "#123456" },
      })
    );

    expect(response.status).toBe(200);
    expect(mockSerializeTemplate).toHaveBeenCalledWith(
      { personalInfo: { firstName: "Jane" } },
      "modern",
      { primaryColor: "#123456" }
    );
    expect(mockRenderHtmlToPdf).toHaveBeenCalledWith("<html>resume</html>");
    expect(response.headers.get("Content-Type")).toBe("application/pdf");
    expect(response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="resume.pdf"'
    );
    expect(response.headers.get("Content-Length")).toBe(
      String(Buffer.from("%PDF-1.4 mocked").byteLength)
    );
  });

  it("serializes cover letters with a safe template and returns the cover-letter filename", async () => {
    const response = await POST(
      makeRequest("/api/user/export-pdf", {
        data: {
          senderName: "Jane Doe",
          recipient: { company: "Acme" },
        },
        templateId: "not-a-real-template",
        documentType: "cover-letter",
      })
    );

    expect(response.status).toBe(200);
    expect(mockSerializeCoverLetterTemplate).toHaveBeenCalledWith(
      {
        senderName: "Jane Doe",
        recipient: { company: "Acme" },
      },
      "modern"
    );
    expect(response.headers.get("Content-Disposition")).toBe(
      'attachment; filename="cover-letter.pdf"'
    );
  });

  it("rejects requests from users whose email is not verified", async () => {
    mockVerifyAuth.mockResolvedValue({
      success: false,
      response: NextResponse.json(
        {
          error: "Email verification required",
          code: "EMAIL_NOT_VERIFIED",
          message: "Please verify your email address to use this feature.",
        },
        { status: 403 }
      ),
    });

    const response = await POST(
      makeRequest("/api/user/export-pdf", {
        data: { personalInfo: { firstName: "Jane" } },
        templateId: "modern",
      })
    );
    const payload = await response.json();

    expect(response.status).toBe(403);
    expect(payload.code).toBe("EMAIL_NOT_VERIFIED");
    expect(mockSerializeTemplate).not.toHaveBeenCalled();
    expect(mockRenderHtmlToPdf).not.toHaveBeenCalled();
  });
});
