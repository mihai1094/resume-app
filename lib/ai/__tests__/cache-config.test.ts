import { describe, it, expect } from "vitest";
import {
  CACHE_TIERS,
  FEATURE_CACHE_TIER,
  getCacheConfig,
  ttlDaysToMs,
  ttlDaysToMinutes,
  type CacheTier,
} from "../cache-config";

describe("cache-config", () => {
  describe("CACHE_TIERS", () => {
    it("should have all required tiers defined", () => {
      expect(CACHE_TIERS).toHaveProperty("frequent");
      expect(CACHE_TIERS).toHaveProperty("standard");
      expect(CACHE_TIERS).toHaveProperty("expensive");
      expect(CACHE_TIERS).toHaveProperty("stable");
      expect(CACHE_TIERS).toHaveProperty("highVolume");
    });

    it("should have valid configuration for each tier", () => {
      Object.entries(CACHE_TIERS).forEach(([tier, config]) => {
        expect(config.maxSize).toBeGreaterThan(0);
        expect(config.ttlDays).toBeGreaterThan(0);
        expect(config.costPerRequest).toBeGreaterThanOrEqual(0);
      });
    });

    it("should have frequent tier with larger cache size than expensive", () => {
      expect(CACHE_TIERS.frequent.maxSize).toBeGreaterThan(
        CACHE_TIERS.expensive.maxSize
      );
    });

    it("should have stable tier with longer TTL than expensive", () => {
      expect(CACHE_TIERS.stable.ttlDays).toBeGreaterThan(
        CACHE_TIERS.expensive.ttlDays
      );
    });

    it("should have expensive tier with higher cost per request", () => {
      expect(CACHE_TIERS.expensive.costPerRequest).toBeGreaterThan(
        CACHE_TIERS.frequent.costPerRequest
      );
    });

    it("should have highVolume tier with largest maxSize", () => {
      const maxSizes = Object.values(CACHE_TIERS).map((t) => t.maxSize);
      expect(CACHE_TIERS.highVolume.maxSize).toBe(Math.max(...maxSizes));
    });
  });

  describe("FEATURE_CACHE_TIER", () => {
    it("should map all AI features to valid tiers", () => {
      const validTiers = Object.keys(CACHE_TIERS) as CacheTier[];

      Object.entries(FEATURE_CACHE_TIER).forEach(([feature, tier]) => {
        expect(validTiers).toContain(tier);
      });
    });

    it("should have bulletPoints in frequent tier", () => {
      expect(FEATURE_CACHE_TIER.bulletPoints).toBe("frequent");
    });

    it("should have ats in expensive tier", () => {
      expect(FEATURE_CACHE_TIER.ats).toBe("expensive");
    });

    it("should have skills in stable tier", () => {
      expect(FEATURE_CACHE_TIER.skills).toBe("stable");
    });

    it("should have writingAssistant in highVolume tier", () => {
      expect(FEATURE_CACHE_TIER.writingAssistant).toBe("highVolume");
    });
  });

  describe("getCacheConfig", () => {
    it("should return config for known features", () => {
      const config = getCacheConfig("bulletPoints");
      expect(config).toEqual(CACHE_TIERS.frequent);
    });

    it("should return config for ats feature", () => {
      const config = getCacheConfig("ats");
      expect(config).toEqual(CACHE_TIERS.expensive);
    });

    it("should return standard tier for unknown features", () => {
      const config = getCacheConfig("unknownFeature");
      expect(config).toEqual(CACHE_TIERS.standard);
    });

    it("should return config with all required properties", () => {
      const config = getCacheConfig("summary");
      expect(config).toHaveProperty("maxSize");
      expect(config).toHaveProperty("ttlDays");
      expect(config).toHaveProperty("costPerRequest");
    });
  });

  describe("ttlDaysToMs", () => {
    it("should convert 1 day to correct milliseconds", () => {
      expect(ttlDaysToMs(1)).toBe(24 * 60 * 60 * 1000);
    });

    it("should convert 7 days to correct milliseconds", () => {
      expect(ttlDaysToMs(7)).toBe(7 * 24 * 60 * 60 * 1000);
    });

    it("should convert 30 days to correct milliseconds", () => {
      expect(ttlDaysToMs(30)).toBe(30 * 24 * 60 * 60 * 1000);
    });

    it("should handle 0 days", () => {
      expect(ttlDaysToMs(0)).toBe(0);
    });
  });

  describe("ttlDaysToMinutes", () => {
    it("should convert 1 day to correct minutes", () => {
      expect(ttlDaysToMinutes(1)).toBe(24 * 60);
    });

    it("should convert 7 days to correct minutes", () => {
      expect(ttlDaysToMinutes(7)).toBe(7 * 24 * 60);
    });

    it("should convert 30 days to correct minutes", () => {
      expect(ttlDaysToMinutes(30)).toBe(30 * 24 * 60);
    });

    it("should handle 0 days", () => {
      expect(ttlDaysToMinutes(0)).toBe(0);
    });
  });

  describe("tier consistency", () => {
    it("should have all mapped features with corresponding tier configs", () => {
      Object.values(FEATURE_CACHE_TIER).forEach((tier) => {
        expect(CACHE_TIERS[tier]).toBeDefined();
      });
    });

    it("should not have any undefined tier mappings", () => {
      Object.entries(FEATURE_CACHE_TIER).forEach(([feature, tier]) => {
        expect(tier).toBeDefined();
        expect(tier).not.toBeNull();
      });
    });
  });
});
