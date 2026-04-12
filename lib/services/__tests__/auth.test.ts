import { describe, it, expect, vi, beforeEach } from "vitest";
import { validatePassword } from "../auth";

// We test validatePassword directly (pure function).
// AuthService methods depend heavily on Firebase SDK singletons,
// so we test the pure utilities here and the integration via API route tests.

describe("validatePassword", () => {
  it("accepts a valid password", () => {
    const result = validatePassword("Str0ng!Pass");
    expect(result.isValid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("rejects passwords shorter than 8 characters", () => {
    const result = validatePassword("Ab1!xyz");
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain(
      "Password must be at least 8 characters long"
    );
  });

  it("rejects passwords without uppercase letters", () => {
    const result = validatePassword("str0ng!pass");
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("uppercase"))).toBe(true);
  });

  it("rejects passwords without lowercase letters", () => {
    const result = validatePassword("STR0NG!PASS");
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("lowercase"))).toBe(true);
  });

  it("rejects passwords without numbers", () => {
    const result = validatePassword("Strong!Pass");
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("number"))).toBe(true);
  });

  it("rejects passwords without special characters", () => {
    const result = validatePassword("Str0ngPass1");
    expect(result.isValid).toBe(false);
    expect(result.errors.some((e) => e.includes("special character"))).toBe(
      true
    );
  });

  it("returns multiple errors for a completely weak password", () => {
    const result = validatePassword("abc");
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(3);
  });

  it("rejects empty string", () => {
    const result = validatePassword("");
    expect(result.isValid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(4);
  });

  it("accepts password with all required character types", () => {
    const result = validatePassword("MyP@ssw0rd");
    expect(result.isValid).toBe(true);
  });

  it("accepts various special characters", () => {
    const specialChars = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', ',', '.', '?', '"', ':', '{', '}', '|', '<', '>'];
    for (const char of specialChars) {
      const result = validatePassword(`Abcdefg1${char}`);
      expect(result.isValid).toBe(true);
    }
  });
});
