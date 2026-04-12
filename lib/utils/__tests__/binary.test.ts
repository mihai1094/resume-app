import { describe, expect, it } from "vitest";
import { bufferToExactBytes } from "../binary";

describe("bufferToExactBytes", () => {
  it("copies only the meaningful bytes from a pooled Buffer", () => {
    const pooled = Buffer.from(Uint8Array.from([1, 2, 3, 4, 5]));

    expect(pooled.length).toBe(5);
    expect(pooled.buffer.byteLength).toBeGreaterThan(pooled.length);

    const exact = bufferToExactBytes(pooled);

    expect(exact.byteLength).toBe(5);
    expect(Array.from(exact)).toEqual([1, 2, 3, 4, 5]);
  });
});
