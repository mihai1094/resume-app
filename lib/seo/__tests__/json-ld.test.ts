import { describe, expect, it } from "vitest";
import { serializeJsonLd } from "../json-ld";

describe("serializeJsonLd", () => {
  it("escapes closing script tags and HTML-significant characters", () => {
    const payload = {
      name: '</script><script>alert("xss")</script>',
      summary: "<b>hello</b> & goodbye",
    };

    const serialized = serializeJsonLd(payload);

    expect(serialized).not.toContain("</script>");
    expect(serialized).toContain("\\u003c/script\\u003e\\u003cscript\\u003e");
    expect(serialized).toContain("\\u003cb\\u003ehello\\u003c/b\\u003e");
    expect(serialized).toContain("\\u0026 goodbye");
  });
});
