import "server-only";

import { Timestamp } from "firebase-admin/firestore";
import { getAdminDb } from "@/lib/firebase/admin";
import {
  type AnalyticsEventType,
  type AnalyticsSummary,
  type RecentActivity,
  type TrafficSource,
  EMPTY_ANALYTICS_SUMMARY,
  getCountryName,
} from "@/lib/types/analytics";
import { format, subDays, startOfDay, isAfter } from "date-fns";

interface ServerEvent {
  id: string;
  type: AnalyticsEventType;
  timestamp: Date;
  source: TrafficSource;
  country?: string;
  referrer?: string;
}

class AnalyticsServiceServer {
  private readonly ANALYTICS_COLLECTION = "analytics";
  private readonly EVENTS_SUBCOLLECTION = "events";
  private readonly PUBLIC_RESUMES_COLLECTION = "publicResumes";
  private readonly USERS_COLLECTION = "users";
  private readonly SAVED_RESUMES_COLLECTION = "savedResumes";

  determineSource(referrer?: string): TrafficSource {
    if (!referrer || referrer === "direct") {
      return "direct";
    }

    const lowerReferrer = referrer.toLowerCase();
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

    if (lowerReferrer.includes("qr") || lowerReferrer.includes("scan")) {
      return "qr";
    }

    return "referral";
  }

  async trackPublicEvent(
    resumeId: string,
    eventData: {
      type: AnalyticsEventType;
      source?: TrafficSource;
      country?: string;
      referrer?: string;
    }
  ): Promise<boolean> {
    const publicResumeDoc = await getAdminDb()
      .collection(this.PUBLIC_RESUMES_COLLECTION)
      .doc(resumeId)
      .get();

    if (!publicResumeDoc.exists || publicResumeDoc.data()?.isPublic !== true) {
      return false;
    }

    const sanitizedReferrer = this.sanitizeReferrer(eventData.referrer);

    await getAdminDb()
      .collection(this.ANALYTICS_COLLECTION)
      .doc(resumeId)
      .collection(this.EVENTS_SUBCOLLECTION)
      .add({
        type: eventData.type,
        timestamp: Timestamp.now(),
        source: eventData.source || "unknown",
        country: eventData.country,
        referrer: sanitizedReferrer,
      });

    return true;
  }

  private sanitizeReferrer(referrer?: string): string | undefined {
    if (!referrer || typeof referrer !== "string") {
      return undefined;
    }

    const value = referrer.trim();
    if (!value) {
      return undefined;
    }

    try {
      return new URL(value).hostname.replace(/^www\./, "").slice(0, 120);
    } catch {
      return value.replace(/^www\./, "").slice(0, 120);
    }
  }

  private async isResumeOwner(userId: string, resumeId: string): Promise<boolean> {
    const savedResumeDoc = await getAdminDb()
      .collection(this.USERS_COLLECTION)
      .doc(userId)
      .collection(this.SAVED_RESUMES_COLLECTION)
      .doc(resumeId)
      .get();

    if (savedResumeDoc.exists) {
      return true;
    }

    const publicResumeDoc = await getAdminDb()
      .collection(this.PUBLIC_RESUMES_COLLECTION)
      .doc(resumeId)
      .get();

    return publicResumeDoc.exists && publicResumeDoc.data()?.userId === userId;
  }

  private toServerEvent(
    id: string,
    data: Record<string, unknown>
  ): ServerEvent | null {
    const timestamp = data.timestamp as { toDate?: () => Date } | undefined;
    if (!timestamp?.toDate || !data.type) {
      return null;
    }

    return {
      id,
      type: data.type as AnalyticsEventType,
      timestamp: timestamp.toDate(),
      source: (data.source || "unknown") as TrafficSource,
      country: data.country as string | undefined,
      referrer: data.referrer as string | undefined,
    };
  }

  async getAnalyticsForOwner(
    userId: string,
    resumeId: string,
    activityLimit: number = 20
  ): Promise<{ summary: AnalyticsSummary; recentActivity: RecentActivity[] }> {
    const isOwner = await this.isResumeOwner(userId, resumeId);
    if (!isOwner) {
      throw new Error("FORBIDDEN");
    }

    const snapshot = await getAdminDb()
      .collection(this.ANALYTICS_COLLECTION)
      .doc(resumeId)
      .collection(this.EVENTS_SUBCOLLECTION)
      .get();

    if (snapshot.empty) {
      return {
        summary: EMPTY_ANALYTICS_SUMMARY,
        recentActivity: [],
      };
    }

    const events = snapshot.docs
      .map((doc) => this.toServerEvent(doc.id, doc.data()))
      .filter((event): event is ServerEvent => Boolean(event));

    const recentActivity = events
      .slice()
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, activityLimit)
      .map((event) => ({
        id: event.id,
        type: event.type,
        timestamp: event.timestamp,
        source: event.source,
        country: event.country,
        referrer: event.referrer,
      }));

    return {
      summary: this.aggregateEvents(events),
      recentActivity,
    };
  }

  private aggregateEvents(events: ServerEvent[]): AnalyticsSummary {
    const totalViews = events.filter((e) => e.type === "view").length;
    const totalDownloads = events.filter((e) => e.type === "download").length;
    const totalShares = events.filter((e) => e.type === "share").length;

    const viewsByDay = this.aggregateByDay(events);
    const viewsByCountry = this.aggregateByCountry(events);
    const viewsBySource = this.aggregateBySource(events);
    const topReferrers = this.aggregateByReferrer(events);
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

  private aggregateByDay(events: ServerEvent[]) {
    const thirtyDaysAgo = subDays(new Date(), 30);
    const dailyMap = new Map<string, { views: number; downloads: number }>();

    for (let i = 0; i < 30; i++) {
      const date = format(subDays(new Date(), i), "yyyy-MM-dd");
      dailyMap.set(date, { views: 0, downloads: 0 });
    }

    events.forEach((event) => {
      if (isAfter(event.timestamp, thirtyDaysAgo)) {
        const dateKey = format(event.timestamp, "yyyy-MM-dd");
        const entry = dailyMap.get(dateKey);
        if (!entry) return;
        if (event.type === "view") entry.views += 1;
        if (event.type === "download") entry.downloads += 1;
      }
    });

    return Array.from(dailyMap.entries())
      .map(([date, counts]) => ({
        date,
        views: counts.views,
        downloads: counts.downloads,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private aggregateByCountry(events: ServerEvent[]) {
    const countryMap = new Map<string, number>();

    events
      .filter((event) => event.type === "view" && event.country)
      .forEach((event) => {
        const countryCode = event.country!.toUpperCase();
        countryMap.set(countryCode, (countryMap.get(countryCode) || 0) + 1);
      });

    return Array.from(countryMap.entries())
      .map(([countryCode, count]) => ({
        countryCode,
        country: getCountryName(countryCode),
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private aggregateBySource(events: ServerEvent[]) {
    const sourceMap = new Map<TrafficSource, number>();

    events
      .filter((event) => event.type === "view")
      .forEach((event) => {
        const source = event.source || "unknown";
        sourceMap.set(source, (sourceMap.get(source) || 0) + 1);
      });

    return Array.from(sourceMap.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);
  }

  private aggregateByReferrer(events: ServerEvent[]) {
    const referrerMap = new Map<string, number>();

    events
      .filter((event) => event.type === "view" && event.referrer)
      .forEach((event) => {
        let domain = "Direct";
        try {
          if (event.referrer && event.referrer !== "direct") {
            domain = new URL(event.referrer).hostname.replace("www.", "");
          }
        } catch {
          domain = event.referrer || "Direct";
        }
        referrerMap.set(domain, (referrerMap.get(domain) || 0) + 1);
      });

    return Array.from(referrerMap.entries())
      .map(([referrer, count]) => ({ referrer, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
  }

  private calculateTrends(events: ServerEvent[]) {
    const now = new Date();
    const sevenDaysAgo = startOfDay(subDays(now, 7));
    const fourteenDaysAgo = startOfDay(subDays(now, 14));

    const currentViews = events.filter(
      (event) => event.type === "view" && isAfter(event.timestamp, sevenDaysAgo)
    ).length;
    const currentDownloads = events.filter(
      (event) =>
        event.type === "download" && isAfter(event.timestamp, sevenDaysAgo)
    ).length;

    const previousViews = events.filter((event) => {
      return (
        event.type === "view" &&
        isAfter(event.timestamp, fourteenDaysAgo) &&
        !isAfter(event.timestamp, sevenDaysAgo)
      );
    }).length;
    const previousDownloads = events.filter((event) => {
      return (
        event.type === "download" &&
        isAfter(event.timestamp, fourteenDaysAgo) &&
        !isAfter(event.timestamp, sevenDaysAgo)
      );
    }).length;

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
}

export const analyticsServiceServer = new AnalyticsServiceServer();
