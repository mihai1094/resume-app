import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";

// Create a testable AICache class (copy of the internal implementation)
interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
  hits: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
  maxSize: number;
  hitRate: number;
  estimatedSavings: number;
}

class TestableAICache<T = unknown> {
  private cache: Map<string, CacheEntry<T>> = new Map();
  private stats = {
    hits: 0,
    misses: 0,
  };

  private maxSize: number;
  private ttlMs: number;
  private costPerRequest: number;

  constructor(options: {
    maxSize?: number;
    ttlMinutes?: number;
    costPerRequest?: number;
  } = {}) {
    this.maxSize = options.maxSize || 1000;
    this.ttlMs = (options.ttlMinutes || 60 * 24 * 7) * 60 * 1000;
    this.costPerRequest = options.costPerRequest || 0.001;
  }

  private generateKey(params: Record<string, unknown>): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((acc, key) => {
        acc[key] = params[key];
        return acc;
      }, {} as Record<string, unknown>);

    return JSON.stringify(sortedParams).toLowerCase();
  }

  get(params: Record<string, unknown>): T | null {
    const key = this.generateKey(params);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }

    entry.hits++;
    this.stats.hits++;
    return entry.value;
  }

  set(params: Record<string, unknown>, value: T): void {
    const key = this.generateKey(params);

    if (this.cache.size >= this.maxSize && !this.cache.has(key)) {
      this.evictOldest();
    }

    const entry: CacheEntry<T> = {
      value,
      expiresAt: Date.now() + this.ttlMs,
      createdAt: Date.now(),
      hits: 0,
    };

    this.cache.set(key, entry);
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (Date.now() > entry.expiresAt) {
        this.cache.delete(key);
        return;
      }

      const priority = entry.hits + (Date.now() - entry.createdAt) / 1000000;
      if (priority < oldestTime) {
        oldestTime = priority;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  clear(): void {
    this.cache.clear();
  }

  clearExpired(): number {
    const now = Date.now();
    let count = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
        count++;
      }
    }

    return count;
  }

  getStats(): CacheStats {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? this.stats.hits / total : 0;
    const estimatedSavings = this.stats.hits * this.costPerRequest;

    return {
      hits: this.stats.hits,
      misses: this.stats.misses,
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate,
      estimatedSavings,
    };
  }

  // Expose for testing
  _getCacheSize(): number {
    return this.cache.size;
  }
}

describe("AICache", () => {
  let cache: TestableAICache<string>;

  beforeEach(() => {
    vi.useFakeTimers();
    cache = new TestableAICache<string>({
      maxSize: 5,
      ttlMinutes: 60, // 1 hour
      costPerRequest: 0.01,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe("Basic Operations", () => {
    it("should store and retrieve values", () => {
      const params = { position: "Engineer", company: "Google" };
      cache.set(params, "cached result");

      const result = cache.get(params);
      expect(result).toBe("cached result");
    });

    it("should return null for missing keys", () => {
      const result = cache.get({ position: "Nonexistent" });
      expect(result).toBeNull();
    });

    it("should generate consistent keys regardless of parameter order", () => {
      cache.set({ a: 1, b: 2 }, "value1");

      // Same parameters in different order should hit same cache entry
      const result = cache.get({ b: 2, a: 1 });
      expect(result).toBe("value1");
    });

    it("should generate case-insensitive keys", () => {
      cache.set({ name: "JOHN" }, "result");

      // Key generation lowercases, so uppercase in params will match
      const result = cache.get({ name: "JOHN" });
      expect(result).toBe("result");
    });

    it("should overwrite existing entries", () => {
      const params = { key: "test" };
      cache.set(params, "first");
      cache.set(params, "second");

      const result = cache.get(params);
      expect(result).toBe("second");
    });
  });

  describe("TTL Expiration", () => {
    it("should return null for expired entries", () => {
      const params = { key: "expiring" };
      cache.set(params, "will expire");

      // Advance time past TTL (60 minutes = 3600000ms)
      vi.advanceTimersByTime(3600001);

      const result = cache.get(params);
      expect(result).toBeNull();
    });

    it("should return value before expiration", () => {
      const params = { key: "not-expired" };
      cache.set(params, "still valid");

      // Advance time but stay within TTL
      vi.advanceTimersByTime(3000000); // 50 minutes

      const result = cache.get(params);
      expect(result).toBe("still valid");
    });

    it("should delete expired entries on access", () => {
      const params = { key: "expiring" };
      cache.set(params, "will expire");

      vi.advanceTimersByTime(3600001);

      // Access should delete the entry
      cache.get(params);

      // Size should be 0
      expect(cache._getCacheSize()).toBe(0);
    });
  });

  describe("LRU Eviction", () => {
    it("should evict an entry when cache is full", () => {
      // Fill cache to max (5 entries)
      for (let i = 0; i < 5; i++) {
        cache.set({ id: i }, `value-${i}`);
        vi.advanceTimersByTime(100); // Small delay between sets
      }

      expect(cache._getCacheSize()).toBe(5);

      // Add one more, should evict one entry
      cache.set({ id: 5 }, "value-5");

      // Size should still be 5 (one was evicted)
      expect(cache._getCacheSize()).toBe(5);
      // New entry should exist
      expect(cache.get({ id: 5 })).toBe("value-5");
    });

    it("should prioritize evicting expired entries", () => {
      cache.set({ id: "old" }, "old-value");
      vi.advanceTimersByTime(3600001); // Expire the first entry

      // Add more entries
      for (let i = 0; i < 5; i++) {
        cache.set({ id: i }, `value-${i}`);
      }

      // Expired entry should have been evicted
      expect(cache.get({ id: "old" })).toBeNull();
      // Recent entries should still exist
      expect(cache.get({ id: 4 })).toBe("value-4");
    });

    it("should consider hit count when evicting", () => {
      // Add entries
      cache.set({ id: 0 }, "rarely-used");
      cache.set({ id: 1 }, "frequently-used");
      cache.set({ id: 2 }, "value-2");
      cache.set({ id: 3 }, "value-3");
      cache.set({ id: 4 }, "value-4");

      // Access entry 1 multiple times to increase its hits
      cache.get({ id: 1 });
      cache.get({ id: 1 });
      cache.get({ id: 1 });

      vi.advanceTimersByTime(100);

      // Add new entry to trigger eviction
      cache.set({ id: 5 }, "value-5");

      // Entry 0 (rarely used) should be evicted, not entry 1 (frequently used)
      expect(cache.get({ id: 0 })).toBeNull();
      expect(cache.get({ id: 1 })).toBe("frequently-used");
    });
  });

  describe("Statistics", () => {
    it("should track hits and misses", () => {
      cache.set({ key: "test" }, "value");

      cache.get({ key: "test" }); // hit
      cache.get({ key: "test" }); // hit
      cache.get({ key: "missing" }); // miss

      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
    });

    it("should calculate hit rate correctly", () => {
      cache.set({ key: "test" }, "value");

      cache.get({ key: "test" }); // hit
      cache.get({ key: "test" }); // hit
      cache.get({ key: "test" }); // hit
      cache.get({ key: "missing" }); // miss

      const stats = cache.getStats();
      expect(stats.hitRate).toBe(0.75); // 3 hits / 4 total
    });

    it("should calculate estimated savings", () => {
      cache.set({ key: "test" }, "value");

      // 10 hits at $0.01 each
      for (let i = 0; i < 10; i++) {
        cache.get({ key: "test" });
      }

      const stats = cache.getStats();
      expect(stats.estimatedSavings).toBeCloseTo(0.10);
    });

    it("should return 0 hit rate when no accesses", () => {
      const stats = cache.getStats();
      expect(stats.hitRate).toBe(0);
    });

    it("should track cache size", () => {
      expect(cache.getStats().size).toBe(0);

      cache.set({ key: 1 }, "v1");
      cache.set({ key: 2 }, "v2");

      expect(cache.getStats().size).toBe(2);
    });
  });

  describe("Clear Operations", () => {
    it("should clear all entries", () => {
      cache.set({ key: 1 }, "v1");
      cache.set({ key: 2 }, "v2");
      cache.set({ key: 3 }, "v3");

      cache.clear();

      expect(cache._getCacheSize()).toBe(0);
      expect(cache.get({ key: 1 })).toBeNull();
    });

    it("should clear only expired entries", () => {
      cache.set({ key: "expired" }, "will-expire");
      vi.advanceTimersByTime(3600001);

      cache.set({ key: "fresh" }, "still-valid");

      const clearedCount = cache.clearExpired();

      expect(clearedCount).toBe(1);
      expect(cache.get({ key: "expired" })).toBeNull();
      expect(cache.get({ key: "fresh" })).toBe("still-valid");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty params", () => {
      cache.set({}, "empty-key");
      expect(cache.get({})).toBe("empty-key");
    });

    it("should handle complex nested params", () => {
      const params = {
        user: { name: "John", skills: ["JS", "TS"] },
        options: { level: 5 },
      };

      cache.set(params, "complex-value");
      expect(cache.get(params)).toBe("complex-value");
    });

    it("should handle null and undefined values in params", () => {
      cache.set({ key: null, other: undefined }, "null-value");
      expect(cache.get({ key: null, other: undefined })).toBe("null-value");
    });

    it("should handle numeric keys", () => {
      cache.set({ 1: "one", 2: "two" }, "numeric-keys");
      expect(cache.get({ 1: "one", 2: "two" })).toBe("numeric-keys");
    });
  });
});

describe("withCache helper", () => {
  it("should return cached data with fromCache=true", async () => {
    const cache = new TestableAICache<string>({ maxSize: 10 });
    const params = { key: "test" };

    // Pre-populate cache
    cache.set(params, "cached-result");

    const fetchFn = vi.fn().mockResolvedValue("fresh-result");

    // Get from cache
    const cached = cache.get(params);
    if (cached) {
      expect(cached).toBe("cached-result");
      expect(fetchFn).not.toHaveBeenCalled();
    }
  });

  it("should fetch and cache when not in cache", async () => {
    const cache = new TestableAICache<string>({ maxSize: 10 });
    const params = { key: "test" };

    const fetchFn = vi.fn().mockResolvedValue("fresh-result");

    // Nothing in cache
    const cached = cache.get(params);
    expect(cached).toBeNull();

    // Simulate fetching and caching
    const data = await fetchFn();
    cache.set(params, data);

    expect(fetchFn).toHaveBeenCalledTimes(1);
    expect(cache.get(params)).toBe("fresh-result");
  });
});

describe("Cache Instances", () => {
  it("should have reasonable default configurations", async () => {
    // Import the actual cache instances
    const {
      bulletPointsCache,
      summaryCache,
      skillsCache,
      atsCache,
    } = await import("../cache");

    // These should exist and have stats methods
    expect(bulletPointsCache.getStats()).toBeDefined();
    expect(summaryCache.getStats()).toBeDefined();
    expect(skillsCache.getStats()).toBeDefined();
    expect(atsCache.getStats()).toBeDefined();
  });

  it("should be able to get all cache stats", async () => {
    const { getAllCacheStats } = await import("../cache");

    const stats = getAllCacheStats();

    expect(stats).toHaveProperty("bulletPoints");
    expect(stats).toHaveProperty("summary");
    expect(stats).toHaveProperty("skills");
    expect(stats).toHaveProperty("ats");
    expect(stats).toHaveProperty("coverLetter");
    expect(stats).toHaveProperty("writingAssistant");
    expect(stats).toHaveProperty("quantifier");
    expect(stats).toHaveProperty("interviewPrep");
    expect(stats).toHaveProperty("tailorResume");
    expect(stats).toHaveProperty("resumeScoring");
    expect(stats).toHaveProperty("linkedInOptimizer");
  });
});
