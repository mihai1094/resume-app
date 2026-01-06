/**
 * Analytics Service
 *
 * Handles tracking and retrieving resume analytics data.
 * Events are stored in Firestore: analytics/{resumeId}/events/{eventId}
 */

import {
  collection,
  doc,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import {
  AnalyticsEvent,
  AnalyticsSummary,
  RecentActivity,
  DailyViewCount,
  CountryStats,
  SourceStats,
  ReferrerStats,
  TrafficSource,
  AnalyticsEventType,
  EMPTY_ANALYTICS_SUMMARY,
  getCountryName,
} from "@/lib/types/analytics";
import { format, subDays, startOfDay, isAfter } from "date-fns";

/**
 * Analytics Service Class
 */
class AnalyticsService {
  private readonly ANALYTICS_COLLECTION = "analytics";
  private readonly EVENTS_SUBCOLLECTION = "events";

  /**
   * Track an analytics event
   */
  async trackEvent(
    resumeId: string,
    eventData: {
      type: AnalyticsEventType;
      source?: TrafficSource;
      country?: string;
      referrer?: string;
      userAgent?: string;
    }
  ): Promise<boolean> {
    try {
      const eventsRef = collection(
        db,
        this.ANALYTICS_COLLECTION,
        resumeId,
        this.EVENTS_SUBCOLLECTION
      );

      const event: Omit<AnalyticsEvent, "id"> = {
        type: eventData.type,
        timestamp: Timestamp.now(),
        source: eventData.source || "unknown",
        country: eventData.country,
        referrer: eventData.referrer,
        userAgent: eventData.userAgent,
      };

      await addDoc(eventsRef, event);
      return true;
    } catch (error) {
      console.error("Error tracking analytics event:", error);
      return false;
    }
  }

  /**
   * Get analytics summary for a resume
   */
  async getAnalyticsSummary(resumeId: string): Promise<AnalyticsSummary> {
    try {
      const eventsRef = collection(
        db,
        this.ANALYTICS_COLLECTION,
        resumeId,
        this.EVENTS_SUBCOLLECTION
      );

      // Get all events (for full analytics, we need all data)
      const snapshot = await getDocs(eventsRef);

      if (snapshot.empty) {
        return EMPTY_ANALYTICS_SUMMARY;
      }

      const events: AnalyticsEvent[] = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as AnalyticsEvent[];

      return this.aggregateEvents(events);
    } catch (error) {
      console.error("Error getting analytics summary:", error);
      return EMPTY_ANALYTICS_SUMMARY;
    }
  }

  /**
   * Get recent events for activity feed
   */
  async getRecentEvents(
    resumeId: string,
    eventLimit: number = 20
  ): Promise<RecentActivity[]> {
    try {
      const eventsRef = collection(
        db,
        this.ANALYTICS_COLLECTION,
        resumeId,
        this.EVENTS_SUBCOLLECTION
      );

      const q = query(
        eventsRef,
        orderBy("timestamp", "desc"),
        limit(eventLimit)
      );

      const snapshot = await getDocs(q);

      return snapshot.docs.map((doc) => {
        const data = doc.data() as AnalyticsEvent;
        return {
          id: doc.id,
          type: data.type,
          timestamp: data.timestamp.toDate(),
          source: data.source,
          country: data.country,
          referrer: data.referrer,
        };
      });
    } catch (error) {
      console.error("Error getting recent events:", error);
      return [];
    }
  }

  /**
   * Aggregate events into summary statistics
   */
  private aggregateEvents(events: AnalyticsEvent[]): AnalyticsSummary {
    // Basic counts
    const totalViews = events.filter((e) => e.type === "view").length;
    const totalDownloads = events.filter((e) => e.type === "download").length;
    const totalShares = events.filter((e) => e.type === "share").length;

    // Views by day (last 30 days)
    const viewsByDay = this.aggregateByDay(events);

    // Views by country
    const viewsByCountry = this.aggregateByCountry(events);

    // Views by source
    const viewsBySource = this.aggregateBySource(events);

    // Top referrers
    const topReferrers = this.aggregateByReferrer(events);

    // Calculate trends (compare last 7 days to previous 7 days)
    const { viewsTrend, downloadsTrend } = this.calculateTrends(events);

    return {
      totalViews,
      totalDownloads,
      totalShares,
      viewsByDay,
      viewsByCountry,
      viewsBySource,
      topReferrers,
      viewsTrend,
      downloadsTrend,
    };
  }

  /**
   * Aggregate events by day for the last 30 days
   */
  private aggregateByDay(events: AnalyticsEvent[]): DailyViewCount[] {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const dailyMap = new Map<string, { views: number; downloads: number }>();

    // Initialize all 30 days with zeros
    for (let i = 0; i < 30; i++) {
      const date = format(subDays(new Date(), i), "yyyy-MM-dd");
      dailyMap.set(date, { views: 0, downloads: 0 });
    }

    // Count events by day
    events.forEach((event) => {
      const eventDate = event.timestamp.toDate();
      if (isAfter(eventDate, thirtyDaysAgo)) {
        const dateKey = format(eventDate, "yyyy-MM-dd");
        const existing = dailyMap.get(dateKey);
        if (existing) {
          if (event.type === "view") {
            existing.views++;
          } else if (event.type === "download") {
            existing.downloads++;
          }
        }
      }
    });

    // Convert to array and sort by date
    return Array.from(dailyMap.entries())
      .map(([date, counts]) => ({
        date,
        views: counts.views,
        downloads: counts.downloads,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  /**
   * Aggregate views by country
   */
  private aggregateByCountry(events: AnalyticsEvent[]): CountryStats[] {
    const countryMap = new Map<string, number>();

    events
      .filter((e) => e.type === "view" && e.country)
      .forEach((event) => {
        const country = event.country!.toUpperCase();
        countryMap.set(country, (countryMap.get(country) || 0) + 1);
      });

    return Array.from(countryMap.entries())
      .map(([countryCode, count]) => ({
        countryCode,
        country: getCountryName(countryCode),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 countries
  }

  /**
   * Aggregate views by source
   */
  private aggregateBySource(events: AnalyticsEvent[]): SourceStats[] {
    const sourceMap = new Map<TrafficSource, number>();

    events
      .filter((e) => e.type === "view")
      .forEach((event) => {
        const source = event.source || "unknown";
        sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
      });

    return Array.from(sourceMap.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);
  }

  /**
   * Aggregate by referrer domain
   */
  private aggregateByReferrer(events: AnalyticsEvent[]): ReferrerStats[] {
    const referrerMap = new Map<string, number>();

    events
      .filter((e) => e.type === "view" && e.referrer)
      .forEach((event) => {
        // Extract domain from referrer URL
        let domain = "Direct";
        try {
          if (event.referrer && event.referrer !== "direct") {
            const url = new URL(event.referrer);
            domain = url.hostname.replace("www.", "");
          }
        } catch {
          domain = event.referrer || "Direct";
        }
        referrerMap.set(domain, (referrerMap.get(domain) || 0) + 1);
      });

    return Array.from(referrerMap.entries())
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // Top 10 referrers
  }

  /**
   * Calculate trend percentages (last 7 days vs previous 7 days)
   */
  private calculateTrends(events: AnalyticsEvent[]): {
    viewsTrend: number;
    downloadsTrend: number;
  } {
    const now = new Date();
    const sevenDaysAgo = startOfDay(subDays(now, 7));
    const fourteenDaysAgo = startOfDay(subDays(now, 14));

    // Current period (last 7 days)
    const currentViews = events.filter(
      (e) =>
        e.type === "view" &&
        isAfter(e.timestamp.toDate(), sevenDaysAgo)
    ).length;

    const currentDownloads = events.filter(
      (e) =>
        e.type === "download" &&
        isAfter(e.timestamp.toDate(), sevenDaysAgo)
    ).length;

    // Previous period (7-14 days ago)
    const previousViews = events.filter((e) => {
      const date = e.timestamp.toDate();
      return (
        e.type === "view" &&
        isAfter(date, fourteenDaysAgo) &&
        !isAfter(date, sevenDaysAgo)
      );
    }).length;

    const previousDownloads = events.filter((e) => {
      const date = e.timestamp.toDate();
      return (
        e.type === "download" &&
        isAfter(date, fourteenDaysAgo) &&
        !isAfter(date, sevenDaysAgo)
      );
    }).length;

    // Calculate percentage change
    const viewsTrend =
      previousViews === 0
        ? currentViews > 0
          ? 100
          : 0
        : Math.round(((currentViews - previousViews) / previousViews) * 100);

    const downloadsTrend =
      previousDownloads === 0
        ? currentDownloads > 0
          ? 100
          : 0
        : Math.round(
            ((currentDownloads - previousDownloads) / previousDownloads) * 100
          );

    return { viewsTrend, downloadsTrend };
  }

  /**
   * Determine traffic source from referrer
   */
  determineSource(referrer?: string): TrafficSource {
    if (!referrer || referrer === "direct") {
      return "direct";
    }

    const lowerReferrer = referrer.toLowerCase();

    // Social media platforms
    const socialPlatforms = [
      "facebook.com",
      "twitter.com",
      "x.com",
      "linkedin.com",
      "instagram.com",
      "tiktok.com",
      "youtube.com",
      "reddit.com",
      "pinterest.com",
      "t.co",
    ];

    if (socialPlatforms.some((p) => lowerReferrer.includes(p))) {
      return "social";
    }

    // QR code tracking (can be customized based on your QR service)
    if (lowerReferrer.includes("qr") || lowerReferrer.includes("scan")) {
      return "qr";
    }

    return "referral";
  }
}

// Export singleton instance
export const analyticsService = new AnalyticsService();
