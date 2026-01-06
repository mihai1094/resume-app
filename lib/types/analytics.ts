/**
 * Resume Analytics Types
 *
 * Types for tracking and displaying resume view/download analytics.
 */

import { Timestamp } from "firebase/firestore";

/**
 * Analytics event types
 */
export type AnalyticsEventType = "view" | "download" | "share";

/**
 * Traffic source types
 */
export type TrafficSource = "direct" | "qr" | "social" | "referral" | "unknown";

/**
 * Individual analytics event
 */
export interface AnalyticsEvent {
  id?: string;
  type: AnalyticsEventType;
  timestamp: Timestamp;
  source: TrafficSource;
  country?: string;
  referrer?: string;
  userAgent?: string;
}

/**
 * Data for tracking an event (client-side)
 */
export interface TrackEventData {
  resumeId: string;
  type: AnalyticsEventType;
  source?: TrafficSource;
  referrer?: string;
}

/**
 * Daily view count for charts
 */
export interface DailyViewCount {
  date: string; // YYYY-MM-DD format
  views: number;
  downloads: number;
}

/**
 * Country stats
 */
export interface CountryStats {
  country: string;
  countryCode: string;
  count: number;
}

/**
 * Referrer stats
 */
export interface ReferrerStats {
  referrer: string;
  count: number;
}

/**
 * Source stats for pie chart
 */
export interface SourceStats {
  source: TrafficSource;
  count: number;
}

/**
 * Summary analytics for dashboard
 */
export interface AnalyticsSummary {
  totalViews: number;
  totalDownloads: number;
  totalShares: number;
  viewsByDay: DailyViewCount[];
  viewsByCountry: CountryStats[];
  viewsBySource: SourceStats[];
  topReferrers: ReferrerStats[];
  // Trend data (compared to previous period)
  viewsTrend: number; // percentage change
  downloadsTrend: number;
}

/**
 * Recent activity item for activity feed
 */
export interface RecentActivity {
  id: string;
  type: AnalyticsEventType;
  timestamp: Date;
  source: TrafficSource;
  country?: string;
  referrer?: string;
}

/**
 * Full analytics data structure
 */
export interface ResumeAnalytics {
  resumeId: string;
  summary: AnalyticsSummary;
  recentActivity: RecentActivity[];
  lastUpdated: Date;
}

/**
 * Default empty analytics summary
 */
export const EMPTY_ANALYTICS_SUMMARY: AnalyticsSummary = {
  totalViews: 0,
  totalDownloads: 0,
  totalShares: 0,
  viewsByDay: [],
  viewsByCountry: [],
  viewsBySource: [],
  topReferrers: [],
  viewsTrend: 0,
  downloadsTrend: 0,
};

/**
 * Country code to name mapping (common countries)
 */
export const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  CA: "Canada",
  AU: "Australia",
  DE: "Germany",
  FR: "France",
  IN: "India",
  BR: "Brazil",
  NL: "Netherlands",
  ES: "Spain",
  IT: "Italy",
  JP: "Japan",
  SG: "Singapore",
  AE: "UAE",
  SE: "Sweden",
  CH: "Switzerland",
  PL: "Poland",
  BE: "Belgium",
  AT: "Austria",
  DK: "Denmark",
  NO: "Norway",
  FI: "Finland",
  IE: "Ireland",
  NZ: "New Zealand",
  PT: "Portugal",
  RO: "Romania",
  CZ: "Czech Republic",
  HU: "Hungary",
  IL: "Israel",
  MX: "Mexico",
  AR: "Argentina",
  CL: "Chile",
  CO: "Colombia",
  ZA: "South Africa",
  MY: "Malaysia",
  PH: "Philippines",
  ID: "Indonesia",
  TH: "Thailand",
  VN: "Vietnam",
  KR: "South Korea",
  TW: "Taiwan",
  HK: "Hong Kong",
  CN: "China",
  RU: "Russia",
  UA: "Ukraine",
  TR: "Turkey",
  EG: "Egypt",
  NG: "Nigeria",
  KE: "Kenya",
  PK: "Pakistan",
  BD: "Bangladesh",
  XX: "Unknown",
};

/**
 * Get country name from code
 */
export function getCountryName(code: string): string {
  return COUNTRY_NAMES[code.toUpperCase()] || code;
}

/**
 * Format source for display
 */
export function formatSource(source: TrafficSource): string {
  const labels: Record<TrafficSource, string> = {
    direct: "Direct",
    qr: "QR Code",
    social: "Social Media",
    referral: "Referral",
    unknown: "Unknown",
  };
  return labels[source] || source;
}
