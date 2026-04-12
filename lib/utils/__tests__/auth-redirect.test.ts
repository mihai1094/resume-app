import { describe, expect, it } from "vitest";
import { sanitizeAuthRedirectPath } from "../auth-redirect";

describe("sanitizeAuthRedirectPath", () => {
  it("accepts same-origin relative paths", () => {
    expect(sanitizeAuthRedirectPath("/editor/new?template=modern")).toBe(
      "/editor/new?template=modern"
    );
  });

  it("rejects protocol-relative and absolute external URLs", () => {
    expect(sanitizeAuthRedirectPath("//evil.com/phish")).toBeNull();
    expect(sanitizeAuthRedirectPath("https://evil.com/phish")).toBeNull();
  });

  it("rejects non-path values", () => {
    expect(sanitizeAuthRedirectPath("javascript:alert(1)")).toBeNull();
    expect(sanitizeAuthRedirectPath(null)).toBeNull();
  });
});
