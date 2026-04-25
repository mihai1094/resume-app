import { describe, expect, it } from "vitest";
import { renderHtmlToPdf } from "../pdf-renderer";

describe("renderHtmlToPdf", () => {
  it("exports the function", () => {
    expect(typeof renderHtmlToPdf).toBe("function");
  });
});
