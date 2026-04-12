/**
 * KV-backed AI cache adapter
 *
 * Wraps @vercel/kv so cache entries survive across serverless instances.
 * Falls back to in-memory AICache when KV env vars are absent (local dev).
 *
 * Interface is identical to AICache.get / AICache.set so callers
 * do not need to change.
 */

import { aiLogger } from "@/lib/services/logger";

interface KVCacheEntry<T> {
  value: T;
  hits: number;
  createdAt: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
  hitRate: number;
  estimatedSavings: number;
}

const KV_AVAILABLE =
  typeof process !== "undefined" &&
  !!process.env.KV_REST_API_URL &&
  !!process.env.KV_REST_API_TOKEN;

async function getKv() {
  const { kv } = await import("@vercel/kv");
  return kv;
}

function sortedKey(params: Record<string, unknown>): string {
  const sorted = Object.keys(params)
    .sort()
    .reduce<Record<string, unknown>>((acc, k) => {
      acc[k] = params[k];
      return acc;
    }, {});
  return JSON.stringify(sorted).toLowerCase();
}

export class KVCache<T = unknown> {
  private prefix: string;
  private ttlSeconds: number;
  private costPerRequest: number;
  private stats = { hits: 0, misses: 0 };

  constructor(options: { prefix: string; ttlSeconds: number; costPerRequest?: number }) {
    this.prefix = options.prefix;
    this.ttlSeconds = options.ttlSeconds;
    this.costPerRequest = options.costPerRequest ?? 0.001;
  }

  private buildKey(params: Record<string, unknown>): string {
    return `aicache:${this.prefix}:${sortedKey(params)}`;
  }

  async get(params: Record<string, unknown>): Promise<T | null> {
    if (!KV_AVAILABLE) return null;

    try {
      const kv = await getKv();
      const key = this.buildKey(params);
      const entry = await kv.get<KVCacheEntry<T>>(key);

      if (!entry) {
        this.stats.misses++;
        return null;
      }

      // Increment hit counter (fire-and-forget)
      kv.set(key, { ...entry, hits: entry.hits + 1 }, { ex: this.ttlSeconds }).catch(() => undefined);
      this.stats.hits++;

      aiLogger.debug("KV cache hit", { prefix: this.prefix, key: key.slice(0, 60) });
      return entry.value;
    } catch (err) {
      aiLogger.error("KV cache get error", err instanceof Error ? err : new Error(String(err)));
      this.stats.misses++;
      return null;
    }
  }

  async set(params: Record<string, unknown>, value: T): Promise<void> {
    if (!KV_AVAILABLE) return;

    try {
      const kv = await getKv();
      const key = this.buildKey(params);
      const entry: KVCacheEntry<T> = { value, hits: 0, createdAt: Date.now() };
      await kv.set(key, entry, { ex: this.ttlSeconds });
      aiLogger.debug("KV cache set", { prefix: this.prefix, key: key.slice(0, 60) });
    } catch (err) {
      aiLogger.error("KV cache set error", err instanceof Error ? err : new Error(String(err)));
    }
  }

  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: -1, // KV doesn't expose count cheaply
      maxSize: -1,
      hitRate: total > 0 ? this.stats.hits / total : 0,
      estimatedSavings: this.stats.hits * this.costPerRequest,
    };
  }

  // Compatibility stubs — KV expiry is handled server-side
  clearExpired(): void {}
  clear(): void {}
}

/**
 * Unified async cache interface
 * Implemented by both InMemoryCacheAdapter and HybridCache
 */
export interface AsyncCache<T> {
  get(params: Record<string, unknown>): Promise<T | null>;
  set(params: Record<string, unknown>, value: T): Promise<void>;
  getStats(): CacheStats;
  clearExpired(): void;
  clear(): void;
}

/**
 * Thin async adapter over the synchronous in-memory AICache.
 * Used in local dev when KV env vars are absent.
 */
export class InMemoryCacheAdapter<T> implements AsyncCache<T> {
  constructor(
    private inner: {
      get(params: Record<string, unknown>): T | null;
      set(params: Record<string, unknown>, value: T): void;
      getStats(): CacheStats;
      clearExpired(): void;
      clear(): void;
    }
  ) {}

  async get(params: Record<string, unknown>): Promise<T | null> {
    return this.inner.get(params);
  }
  async set(params: Record<string, unknown>, value: T): Promise<void> {
    this.inner.set(params, value);
  }
  getStats(): CacheStats {
    return this.inner.getStats();
  }
  clearExpired(): void {
    this.inner.clearExpired();
  }
  clear(): void {
    this.inner.clear();
  }
}

/**
 * Two-level cache: L1 = in-memory (per-instance, fast), L2 = KV (cross-instance).
 *
 * Read path:  L1 hit → return immediately.
 *             L1 miss → check L2 → backfill L1 on hit → return.
 * Write path: write to both L1 and L2 (L2 is fire-and-forget on the cold path).
 */
export class HybridCache<T> implements AsyncCache<T> {
  constructor(private l1: InMemoryCacheAdapter<T>, private l2: KVCache<T>) {}

  async get(params: Record<string, unknown>): Promise<T | null> {
    const l1Result = await this.l1.get(params);
    if (l1Result !== null) return l1Result;

    const l2Result = await this.l2.get(params);
    if (l2Result !== null) {
      // Backfill L1 so subsequent requests on this instance hit memory
      await this.l1.set(params, l2Result);
      return l2Result;
    }
    return null;
  }

  async set(params: Record<string, unknown>, value: T): Promise<void> {
    await this.l1.set(params, value);
    this.l2.set(params, value).catch(() => undefined); // fire-and-forget L2 write
  }

  getStats(): CacheStats {
    return this.l1.getStats();
  }

  clearExpired(): void {
    this.l1.clearExpired();
  }

  clear(): void {
    this.l1.clear();
  }
}
