import { describe, it, expect } from "vitest";
import {
    filterBullets,
    getBulletsByCategory,
    getCategories,
    BULLET_LIBRARY,
} from "../bullet-library";

describe("Bullet Library", () => {
    describe("BULLET_LIBRARY", () => {
        it("contains bullet points", () => {
            expect(BULLET_LIBRARY.length).toBeGreaterThan(0);
        });

        it("has valid structure for each bullet", () => {
            BULLET_LIBRARY.forEach((bullet) => {
                expect(bullet).toHaveProperty("id");
                expect(bullet).toHaveProperty("text");
                expect(bullet).toHaveProperty("category");
                expect(bullet).toHaveProperty("roles");
                expect(bullet).toHaveProperty("keywords");
                expect(Array.isArray(bullet.roles)).toBe(true);
                expect(Array.isArray(bullet.keywords)).toBe(true);
            });
        });
    });

    describe("filterBullets", () => {
        it("returns bullets matching job title", () => {
            const results = filterBullets("", "Software Engineer");
            expect(results.length).toBeGreaterThan(0);
            results.forEach((bullet) => {
                const matchesRole =
                    bullet.roles.includes("*") ||
                    bullet.roles.some((role) =>
                        role.toLowerCase().includes("software engineer")
                    );
                expect(matchesRole || bullet.category === "Software Engineering").toBe(
                    true
                );
            });
        });

        it("returns bullets matching search query", () => {
            const results = filterBullets("machine learning");
            expect(results.length).toBeGreaterThan(0);
            results.forEach((bullet) => {
                const matchesQuery =
                    bullet.text.toLowerCase().includes("machine learning") ||
                    bullet.keywords.some((k) => k.includes("machine learning")) ||
                    bullet.category.toLowerCase().includes("machine learning");
                expect(matchesQuery).toBe(true);
            });
        });

        it("returns bullets matching both job title and query", () => {
            const results = filterBullets("react", "Software Engineer");
            expect(results.length).toBeGreaterThan(0);
        });

        it("returns empty array when no matches", () => {
            const results = filterBullets("xyzabc123nonexistent");
            expect(results).toEqual([]);
        });

        it("is case-insensitive", () => {
            const lowerResults = filterBullets("python");
            const upperResults = filterBullets("PYTHON");
            expect(lowerResults.length).toBe(upperResults.length);
        });
    });

    describe("getBulletsByCategory", () => {
        it("returns bullets for a specific category", () => {
            const results = getBulletsByCategory("Software Engineering");
            expect(results.length).toBeGreaterThan(0);
            results.forEach((bullet) => {
                expect(bullet.category).toBe("Software Engineering");
            });
        });

        it("returns empty array for non-existent category", () => {
            const results = getBulletsByCategory("Nonexistent Category");
            expect(results).toEqual([]);
        });
    });

    describe("getCategories", () => {
        it("returns all unique categories", () => {
            const categories = getCategories();
            expect(categories.length).toBeGreaterThan(0);
            expect(Array.isArray(categories)).toBe(true);

            // Check for duplicates
            const uniqueCategories = new Set(categories);
            expect(uniqueCategories.size).toBe(categories.length);
        });

        it("returns sorted categories", () => {
            const categories = getCategories();
            const sorted = [...categories].sort();
            expect(categories).toEqual(sorted);
        });

        it("includes expected categories", () => {
            const categories = getCategories();
            expect(categories).toContain("Software Engineering");
            expect(categories).toContain("Product Management");
            expect(categories).toContain("Data Science");
        });
    });
});
