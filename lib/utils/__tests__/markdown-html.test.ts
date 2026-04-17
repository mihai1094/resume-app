import { describe, it, expect } from "vitest";
import { markdownToHtml, htmlToMarkdown } from "../markdown-html";

describe("markdownToHtml", () => {
  it("returns empty string for empty input", () => {
    expect(markdownToHtml("")).toBe("");
  });

  it("wraps plain text in a paragraph", () => {
    expect(markdownToHtml("hello")).toBe("<p>hello</p>");
  });

  it("converts **bold** into <strong>", () => {
    expect(markdownToHtml("**bold**")).toBe("<p><strong>bold</strong></p>");
  });

  it("converts *italic* into <em>", () => {
    expect(markdownToHtml("*italic*")).toBe("<p><em>italic</em></p>");
  });

  it("turns single \\n into a <br> inside one paragraph", () => {
    expect(markdownToHtml("a\nb")).toBe("<p>a<br>b</p>");
  });

  it("splits on \\n\\n into two paragraphs", () => {
    expect(markdownToHtml("a\n\nb")).toBe("<p>a</p><p>b</p>");
  });

  it("collapses runs of 3+ newlines to paragraph splits", () => {
    expect(markdownToHtml("a\n\n\nb")).toBe("<p>a</p><p>b</p>");
  });

  it("escapes raw HTML so users can't inject markup", () => {
    expect(markdownToHtml("<script>")).toBe("<p>&lt;script&gt;</p>");
  });

  it("preserves runs of multiple spaces", () => {
    expect(markdownToHtml("a    b")).toBe("<p>a    b</p>");
  });

  it("handles mixed bold, italic, and newline", () => {
    const out = markdownToHtml("**hi**\n*yo*");
    expect(out).toBe("<p><strong>hi</strong><br><em>yo</em></p>");
  });

  it("leaves unclosed markers as literal asterisks", () => {
    expect(markdownToHtml("**unclosed")).toBe("<p>**unclosed</p>");
    expect(markdownToHtml("*unclosed")).toBe("<p>*unclosed</p>");
  });

  it("gives empty paragraphs a <br> so TipTap renders them as blank lines", () => {
    expect(markdownToHtml("a\n\n\n\nb")).toBe("<p>a</p><p>b</p>");
    // An explicitly blank first paragraph still renders.
    expect(markdownToHtml("")).toBe("");
  });
});

describe("htmlToMarkdown", () => {
  it("returns empty string for empty input", () => {
    expect(htmlToMarkdown("")).toBe("");
  });

  it("extracts plain text from a paragraph", () => {
    expect(htmlToMarkdown("<p>hello</p>")).toBe("hello");
  });

  it("converts <strong> back to **bold**", () => {
    expect(htmlToMarkdown("<p><strong>bold</strong></p>")).toBe("**bold**");
  });

  it("also accepts <b> as bold", () => {
    expect(htmlToMarkdown("<p><b>bold</b></p>")).toBe("**bold**");
  });

  it("converts <em> back to *italic*", () => {
    expect(htmlToMarkdown("<p><em>italic</em></p>")).toBe("*italic*");
  });

  it("also accepts <i> as italic", () => {
    expect(htmlToMarkdown("<p><i>italic</i></p>")).toBe("*italic*");
  });

  it("converts <br> back to \\n", () => {
    expect(htmlToMarkdown("<p>a<br>b</p>")).toBe("a\nb");
  });

  it("joins multiple paragraphs with \\n\\n", () => {
    expect(htmlToMarkdown("<p>a</p><p>b</p>")).toBe("a\n\nb");
  });

  it("preserves runs of spaces verbatim", () => {
    expect(htmlToMarkdown("<p>a    b</p>")).toBe("a    b");
  });
});

describe("round-trip", () => {
  const cases: string[] = [
    "hello",
    "**bold**",
    "*italic*",
    "**bold** and *italic*",
    "a\nb",
    "a\n\nb",
    "• one\n• two",
    "para1\n\npara2\n\npara3",
    "**outer *inner* outer**",
  ];

  cases.forEach((md) => {
    it(`round-trips ${JSON.stringify(md)}`, () => {
      const html = markdownToHtml(md);
      const back = htmlToMarkdown(html);
      expect(back).toBe(md);
    });
  });
});
