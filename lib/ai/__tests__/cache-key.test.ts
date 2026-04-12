import { describe, it, expect } from "vitest";
import { hashCacheKey, stableStringify } from "../cache-key";

describe("stableStringify", () => {
  it("produces same output regardless of key order", () => {
    const a = stableStringify({ b: 2, a: 1 });
    const b = stableStringify({ a: 1, b: 2 });
    expect(a).toBe(b);
  });

  it("handles nested objects with stable ordering", () => {
    const a = stableStringify({ x: { b: 2, a: 1 }, y: 3 });
    const b = stableStringify({ y: 3, x: { a: 1, b: 2 } });
    expect(a).toBe(b);
  });

  it("handles arrays (order-sensitive)", () => {
    const a = stableStringify([1, 2, 3]);
    const b = stableStringify([1, 3, 2]);
    expect(a).not.toBe(b);
  });

  it("handles null and undefined", () => {
    expect(stableStringify(null)).toBe("null");
    // undefined at top level
    expect(stableStringify(undefined)).toBe(undefined);
  });

  it("omits undefined values in objects", () => {
    const result = stableStringify({ a: 1, b: undefined });
    expect(result).toBe('{"a":1}');
  });

  it("handles Date objects", () => {
    const date = new Date("2025-01-15T00:00:00Z");
    const result = stableStringify({ date });
    expect(result).toContain("2025-01-15");
  });

  it("handles circular references", () => {
    const obj: Record<string, unknown> = { a: 1 };
    obj.self = obj;
    const result = stableStringify(obj);
    expect(result).toContain("[Circular]");
  });

  it("handles strings", () => {
    expect(stableStringify("hello")).toBe('"hello"');
  });

  it("handles numbers", () => {
    expect(stableStringify(42)).toBe("42");
  });
});

describe("hashCacheKey", () => {
  it("returns a hex string", () => {
    const hash = hashCacheKey("test");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("returns same hash for same input", () => {
    const a = hashCacheKey({ position: "Engineer", company: "Acme" });
    const b = hashCacheKey({ position: "Engineer", company: "Acme" });
    expect(a).toBe(b);
  });

  it("returns same hash regardless of key order", () => {
    const a = hashCacheKey({ company: "Acme", position: "Engineer" });
    const b = hashCacheKey({ position: "Engineer", company: "Acme" });
    expect(a).toBe(b);
  });

  it("returns different hash for different input", () => {
    const a = hashCacheKey({ position: "Engineer" });
    const b = hashCacheKey({ position: "Designer" });
    expect(a).not.toBe(b);
  });

  it("handles string input", () => {
    const hash = hashCacheKey("user-123");
    expect(hash).toMatch(/^[a-f0-9]{64}$/);
  });
});
