import { describe, it, expect } from "vitest";
import {
  areSkillsEquivalent,
  dedupeSuggestions,
  filterDuplicates,
  normalizeSkillName,
} from "../skills-normalize";

describe("normalizeSkillName", () => {
  it("handles empty/falsy input", () => {
    expect(normalizeSkillName("")).toBe("");
    expect(normalizeSkillName("   ")).toBe("");
  });

  it("is case-insensitive", () => {
    expect(normalizeSkillName("REACT")).toBe(normalizeSkillName("react"));
    expect(normalizeSkillName("Python")).toBe(normalizeSkillName("python"));
  });

  it("strips punctuation and spacing", () => {
    expect(normalizeSkillName("React.js")).toBe(normalizeSkillName("ReactJS"));
    expect(normalizeSkillName("Node JS")).toBe(normalizeSkillName("nodejs"));
    expect(normalizeSkillName("Next-JS")).toBe(normalizeSkillName("Next.JS"));
  });

  it("resolves common abbreviation aliases", () => {
    expect(normalizeSkillName("JS")).toBe(normalizeSkillName("JavaScript"));
    expect(normalizeSkillName("TS")).toBe(normalizeSkillName("TypeScript"));
    expect(normalizeSkillName("k8s")).toBe(normalizeSkillName("Kubernetes"));
    expect(normalizeSkillName("ML")).toBe(normalizeSkillName("Machine Learning"));
    expect(normalizeSkillName("AI")).toBe(normalizeSkillName("Artificial Intelligence"));
    expect(normalizeSkillName("AWS")).toBe(normalizeSkillName("Amazon Web Services"));
    expect(normalizeSkillName("GCP")).toBe(normalizeSkillName("Google Cloud Platform"));
    expect(normalizeSkillName("RN")).toBe(normalizeSkillName("React Native"));
  });

  it("preserves C++, C#, and .NET as distinct skills via aliases", () => {
    const cpp = normalizeSkillName("C++");
    const csharp = normalizeSkillName("C#");
    const dotnet = normalizeSkillName(".NET");
    expect(cpp).toBe(normalizeSkillName("cpp"));
    expect(csharp).toBe(normalizeSkillName("csharp"));
    expect(dotnet).toBe(normalizeSkillName("dotnet"));
    // They must not collapse into the same key
    expect(cpp).not.toBe(csharp);
    expect(csharp).not.toBe(dotnet);
  });

  it("treats CI/CD variants as equivalent", () => {
    expect(normalizeSkillName("CI/CD")).toBe(normalizeSkillName("CICD"));
    expect(normalizeSkillName("CI/CD")).toBe(normalizeSkillName("Continuous Integration"));
  });

  it("treats PostgreSQL aliases as equivalent", () => {
    expect(normalizeSkillName("Postgres")).toBe(normalizeSkillName("PostgreSQL"));
  });

  it("does not over-collapse distinct skills", () => {
    // React and React Native are different skills and must stay separate
    expect(normalizeSkillName("React")).not.toBe(normalizeSkillName("React Native"));
    // Angular and AngularJS → both map to angular (historically equivalent)
    // but Vue and Nuxt must not collapse
    expect(normalizeSkillName("Vue")).not.toBe(normalizeSkillName("Nuxt"));
  });
});

describe("areSkillsEquivalent", () => {
  it("returns true for the same canonical form", () => {
    expect(areSkillsEquivalent("JS", "JavaScript")).toBe(true);
    expect(areSkillsEquivalent("react.js", "ReactJS")).toBe(true);
  });

  it("returns false for distinct skills", () => {
    expect(areSkillsEquivalent("React", "Vue")).toBe(false);
    expect(areSkillsEquivalent("C++", "C#")).toBe(false);
  });

  it("returns false when either input is empty", () => {
    expect(areSkillsEquivalent("", "React")).toBe(false);
    expect(areSkillsEquivalent("React", "")).toBe(false);
  });
});

describe("filterDuplicates", () => {
  it("returns all suggestions when existing list is empty", () => {
    const suggestions = [{ name: "React" }, { name: "Vue" }];
    expect(filterDuplicates(suggestions, [])).toEqual(suggestions);
  });

  it("filters out exact name matches", () => {
    const existing = [{ name: "React" }];
    const suggestions = [{ name: "React" }, { name: "Vue" }];
    expect(filterDuplicates(suggestions, existing)).toEqual([{ name: "Vue" }]);
  });

  it("filters out alias matches", () => {
    const existing = [{ name: "JavaScript" }];
    const suggestions = [
      { name: "JS" },
      { name: "TypeScript" },
      { name: "javascript" },
    ];
    const result = filterDuplicates(suggestions, existing);
    expect(result).toEqual([{ name: "TypeScript" }]);
  });

  it("filters out punctuation-variant matches", () => {
    const existing = [{ name: "Node.js" }];
    const suggestions = [{ name: "NodeJS" }, { name: "Express" }];
    expect(filterDuplicates(suggestions, existing)).toEqual([{ name: "Express" }]);
  });

  it("keeps suggestions whose normalized form is empty-rejected safely", () => {
    const suggestions = [{ name: "" }, { name: "React" }];
    // Empty-name suggestions are always filtered (cannot be canonicalized)
    expect(filterDuplicates(suggestions, [{ name: "Vue" }])).toEqual([{ name: "React" }]);
  });
});

describe("dedupeSuggestions", () => {
  it("removes same-name duplicates", () => {
    const input = [{ name: "React" }, { name: "React" }];
    expect(dedupeSuggestions(input)).toEqual([{ name: "React" }]);
  });

  it("removes alias-level duplicates, keeping first occurrence", () => {
    const input = [
      { name: "JavaScript" },
      { name: "JS" },
      { name: "TypeScript" },
    ];
    expect(dedupeSuggestions(input)).toEqual([
      { name: "JavaScript" },
      { name: "TypeScript" },
    ]);
  });
});
