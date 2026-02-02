import { createHash } from "crypto";

function normalizeForHash(value: unknown, seen: WeakSet<object>): unknown {
  if (value === null || value === undefined) {
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value !== "object") {
    return value;
  }

  if (seen.has(value as object)) {
    return "[Circular]";
  }
  seen.add(value as object);

  if (Array.isArray(value)) {
    return value.map((item) => normalizeForHash(item, seen));
  }

  const record = value as Record<string, unknown>;
  const sortedKeys = Object.keys(record).sort();
  const normalized: Record<string, unknown> = {};

  for (const key of sortedKeys) {
    const entry = record[key];
    if (entry === undefined) continue;
    normalized[key] = normalizeForHash(entry, seen);
  }

  return normalized;
}

export function stableStringify(value: unknown): string {
  const normalized = normalizeForHash(value, new WeakSet());
  return JSON.stringify(normalized);
}

export function hashCacheKey(value: unknown): string {
  const payload = stableStringify(value);
  return createHash("sha256").update(payload).digest("hex");
}
