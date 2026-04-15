import { describe, it, expect } from "vitest";
import {
  formatLinkedinDisplay,
  formatGithubDisplay,
  formatWebsiteDisplay,
  formatEmailDisplay,
  truncateMiddle,
  truncateEnd,
} from "../contact-display";

describe("contact-display", () => {
  describe("truncateEnd", () => {
    it("returns input unchanged when under limit", () => {
      expect(truncateEnd("hello", 10)).toBe("hello");
    });

    it("truncates with ellipsis when over limit", () => {
      expect(truncateEnd("hello world", 8)).toBe("hello w…");
    });

    it("handles empty input", () => {
      expect(truncateEnd("", 10)).toBe("");
    });

    it("returns ellipsis for tiny maxLength", () => {
      expect(truncateEnd("hello", 1)).toBe("…");
    });
  });

  describe("truncateMiddle", () => {
    it("returns input unchanged when under limit", () => {
      expect(truncateMiddle("hello", 10)).toBe("hello");
    });

    it("truncates in the middle keeping both ends", () => {
      const result = truncateMiddle("abcdefghijklmnop", 10);
      expect(result).toContain("…");
      expect(result.length).toBe(10);
      expect(result.startsWith("abcde")).toBe(true);
      expect(result.endsWith("mnop")).toBe(true);
    });

    it("handles empty input", () => {
      expect(truncateMiddle("", 10)).toBe("");
    });
  });

  describe("formatLinkedinDisplay", () => {
    it("returns /in/<handle> from full URL", () => {
      expect(formatLinkedinDisplay("https://www.linkedin.com/in/jordan-parker")).toBe(
        "/in/jordan-parker",
      );
    });

    it("handles URL without protocol", () => {
      expect(formatLinkedinDisplay("linkedin.com/in/jordan")).toBe("/in/jordan");
    });

    it("strips trailing slash", () => {
      expect(formatLinkedinDisplay("https://linkedin.com/in/jordan/")).toBe("/in/jordan");
    });

    it("truncates long handles", () => {
      const result = formatLinkedinDisplay(
        "https://linkedin.com/in/jordanparkerasdasdasdasdasdasd",
        20,
      );
      expect(result.length).toBeLessThanOrEqual(20);
      expect(result.startsWith("/in/")).toBe(true);
      expect(result.endsWith("…")).toBe(true);
    });

    it("handles company URLs", () => {
      expect(formatLinkedinDisplay("https://linkedin.com/company/acme")).toBe("/company/acme");
    });

    it("handles empty / null / undefined", () => {
      expect(formatLinkedinDisplay("")).toBe("");
      expect(formatLinkedinDisplay(null)).toBe("");
      expect(formatLinkedinDisplay(undefined)).toBe("");
    });

    it("returns cleaned URL for non-LinkedIn input", () => {
      expect(formatLinkedinDisplay("jordanparker")).toBe("jordanparker");
    });
  });

  describe("formatGithubDisplay", () => {
    it("returns username from full URL", () => {
      expect(formatGithubDisplay("https://github.com/jordan-parker")).toBe("jordan-parker");
    });

    it("keeps repo path if present", () => {
      expect(formatGithubDisplay("https://github.com/jordan/my-repo")).toBe("jordan/my-repo");
    });

    it("strips www.", () => {
      expect(formatGithubDisplay("https://www.github.com/jordan")).toBe("jordan");
    });

    it("truncates long paths", () => {
      const result = formatGithubDisplay(
        "https://github.com/someverylongusername/some-very-long-repo-name",
        20,
      );
      expect(result.length).toBeLessThanOrEqual(20);
      expect(result.endsWith("…")).toBe(true);
    });

    it("handles empty / null / undefined", () => {
      expect(formatGithubDisplay("")).toBe("");
      expect(formatGithubDisplay(null)).toBe("");
      expect(formatGithubDisplay(undefined)).toBe("");
    });

    it("returns cleaned URL for non-GitHub input", () => {
      expect(formatGithubDisplay("jordanparker")).toBe("jordanparker");
    });
  });

  describe("formatWebsiteDisplay", () => {
    it("strips protocol and www", () => {
      expect(formatWebsiteDisplay("https://www.example.com")).toBe("example.com");
    });

    it("strips trailing slash", () => {
      expect(formatWebsiteDisplay("https://example.com/")).toBe("example.com");
    });

    it("keeps path", () => {
      expect(formatWebsiteDisplay("https://example.com/portfolio")).toBe("example.com/portfolio");
    });

    it("truncates long URLs", () => {
      const result = formatWebsiteDisplay(
        "https://example.com/very/long/path/to/some/nested/resource",
        25,
      );
      expect(result.length).toBeLessThanOrEqual(25);
      expect(result.endsWith("…")).toBe(true);
    });

    it("handles empty / null / undefined", () => {
      expect(formatWebsiteDisplay("")).toBe("");
      expect(formatWebsiteDisplay(null)).toBe("");
      expect(formatWebsiteDisplay(undefined)).toBe("");
    });
  });

  describe("formatEmailDisplay", () => {
    it("returns short emails unchanged", () => {
      expect(formatEmailDisplay("a@b.com")).toBe("a@b.com");
    });

    it("truncates in the middle for long emails", () => {
      const result = formatEmailDisplay("verylongusername@verylongdomain.com", 20);
      expect(result.length).toBeLessThanOrEqual(20);
      expect(result).toContain("…");
      // domain tail should still be visible
      expect(result.endsWith("n.com") || result.endsWith("domain.com")).toBe(true);
    });

    it("trims whitespace", () => {
      expect(formatEmailDisplay("  a@b.com  ")).toBe("a@b.com");
    });

    it("handles empty / null / undefined", () => {
      expect(formatEmailDisplay("")).toBe("");
      expect(formatEmailDisplay(null)).toBe("");
      expect(formatEmailDisplay(undefined)).toBe("");
    });
  });
});
