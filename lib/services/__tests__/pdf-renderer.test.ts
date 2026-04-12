import { describe, expect, it } from "vitest";
import {
  isPdfRenderRequestAllowed,
  TRUSTED_PDF_ASSET_HOSTS,
} from "../pdf-renderer";

describe("isPdfRenderRequestAllowed", () => {
  it("allows safe inline protocols", () => {
    expect(isPdfRenderRequestAllowed("data:text/plain,hello")).toBe(true);
    expect(isPdfRenderRequestAllowed("blob:https://resumezeus.app/test")).toBe(true);
  });

  it("blocks localhost and private network targets", () => {
    expect(isPdfRenderRequestAllowed("http://localhost:3000/test")).toBe(false);
    expect(isPdfRenderRequestAllowed("http://127.0.0.1/test")).toBe(false);
    expect(isPdfRenderRequestAllowed("http://169.254.169.254/latest/meta-data")).toBe(false);
    expect(isPdfRenderRequestAllowed("http://10.0.0.1/test")).toBe(false);
  });

  it("blocks public network fetches unless the host is allowlisted", () => {
    expect(isPdfRenderRequestAllowed("https://example.com/file.css")).toBe(false);
    expect(
      isPdfRenderRequestAllowed(
        "https://fonts.googleapis.com/css2?family=Inter:wght@400",
        TRUSTED_PDF_ASSET_HOSTS
      )
    ).toBe(true);
  });
});
