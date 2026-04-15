import { describe, it, expect } from "vitest";
import { cleanPastedText, cleanPastedTextSingleLine } from "../paste-cleanup";

describe("cleanPastedText", () => {
  it("strips bullet markers", () => {
    expect(cleanPastedText("• Led a team of 5")).toBe("Led a team of 5");
    expect(cleanPastedText("● Managed budgets")).toBe("Managed budgets");
    expect(cleanPastedText("○ Created dashboards")).toBe("Created dashboards");
    expect(cleanPastedText("▪ Built APIs")).toBe("Built APIs");
    expect(cleanPastedText("► Deployed to AWS")).toBe("Deployed to AWS");
    expect(cleanPastedText("■ Designed systems")).toBe("Designed systems");
  });

  it("strips dash/asterisk bullets", () => {
    expect(cleanPastedText("- Led a team")).toBe("Led a team");
    expect(cleanPastedText("– Led a team")).toBe("Led a team");
    expect(cleanPastedText("— Led a team")).toBe("Led a team");
    expect(cleanPastedText("* Led a team")).toBe("Led a team");
  });

  it("strips numbered list prefixes", () => {
    expect(cleanPastedText("1. First item")).toBe("First item");
    expect(cleanPastedText("12) Twelfth item")).toBe("Twelfth item");
  });

  it("does not strip markdown bold asterisks", () => {
    expect(cleanPastedText("**bold text**")).toBe("**bold text**");
  });

  it("replaces non-breaking spaces", () => {
    expect(cleanPastedText("hello\u00A0world")).toBe("hello world");
  });

  it("removes zero-width characters", () => {
    expect(cleanPastedText("hel\u200Blo\uFEFF")).toBe("hello");
  });

  it("normalizes smart quotes", () => {
    expect(cleanPastedText("\u201CHello\u201D")).toBe('"Hello"');
    expect(cleanPastedText("\u2018it\u2019s\u201A")).toBe("'it's'");
  });

  it("normalizes dashes", () => {
    expect(cleanPastedText("2020\u20132023")).toBe("2020-2023");
    expect(cleanPastedText("something\u2014else")).toBe("something-else");
  });

  it("normalizes ellipsis", () => {
    expect(cleanPastedText("etc\u2026")).toBe("etc...");
  });

  it("replaces tabs with spaces", () => {
    expect(cleanPastedText("col1\tcol2")).toBe("col1 col2");
  });

  it("collapses multiple spaces", () => {
    expect(cleanPastedText("too   many    spaces")).toBe("too many spaces");
  });

  it("trims each line", () => {
    expect(cleanPastedText("  line one  \n  line two  ")).toBe("line one\nline two");
  });

  it("collapses excessive newlines", () => {
    expect(cleanPastedText("a\n\n\n\n\nb")).toBe("a\n\nb");
  });

  it("handles multi-line CV paste", () => {
    const input = `• Led a cross-functional team of 8 engineers
• Increased revenue by 40% through  optimization
  ● Deployed microservices   architecture
  - Managed $2M annual budget`;

    const expected = `Led a cross-functional team of 8 engineers
Increased revenue by 40% through optimization
Deployed microservices architecture
Managed $2M annual budget`;

    expect(cleanPastedText(input)).toBe(expected);
  });

  it("handles PDF artifacts", () => {
    const input = "Senior\u200B Developer\u00A0at\u00A0 Company\u200D Inc\uFEFF.";
    expect(cleanPastedText(input)).toBe("Senior Developer at Company Inc.");
  });

  it("returns empty string for empty input", () => {
    expect(cleanPastedText("")).toBe("");
    expect(cleanPastedText("   ")).toBe("");
  });
});

describe("cleanPastedTextSingleLine", () => {
  it("collapses newlines into spaces", () => {
    expect(cleanPastedTextSingleLine("line one\nline two\nline three")).toBe(
      "line one line two line three"
    );
  });

  it("applies all cleanup plus newline collapse", () => {
    const input = "• First bullet\n● Second bullet\n- Third";
    expect(cleanPastedTextSingleLine(input)).toBe(
      "First bullet Second bullet Third"
    );
  });
});
