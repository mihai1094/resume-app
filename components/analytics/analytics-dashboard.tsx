"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Eye,
  Download,
  Share2,
  TrendingUp,
  TrendingDown,
  Minus,
  Link2,
  Clock,
  Lock,
} from "lucide-react";
import {
  AnalyticsSummary,
  RecentActivity,
  formatSource,
  getCountryName,
} from "@/lib/types/analytics";
import { format, formatDistanceToNow } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { cn } from "@/lib/utils";

interface AnalyticsDashboardProps {
  summary: AnalyticsSummary;
  recentActivity: RecentActivity[];
  isPremium: boolean;
  isLoading?: boolean;
  resumeName?: string;
}

// Chart colors
const CHART_COLORS = {
  views: "#0ea5e9", // sky-500
  downloads: "#22c55e", // green-500
  shares: "#a855f7", // purple-500
};

const SOURCE_COLORS: Record<string, string> = {
  direct: "#3b82f6", // blue-500
  social: "#ec4899", // pink-500
  referral: "#f97316", // orange-500
  qr: "#14b8a6", // teal-500
  unknown: "#6b7280", // gray-500
};

/**
 * Stat Card Component
 */
function StatCard({
  title,
  value,
  trend,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  trend?: number;
  icon: React.ElementType;
  color: string;
}) {
  const TrendIcon =
    trend === undefined || trend === 0
      ? Minus
      : trend > 0
      ? TrendingUp
      : TrendingDown;

  const trendColor =
    trend === undefined || trend === 0
      ? "text-muted-foreground"
      : trend > 0
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>
            {trend !== undefined && (
              <div className={cn("flex items-center gap-1 mt-1 text-sm", trendColor)}>
                <TrendIcon className="w-4 h-4" />
                <span>
                  {trend > 0 ? "+" : ""}
                  {trend}% vs last week
                </span>
              </div>
            )}
          </div>
          <div
            className="p-3 rounded-full"
            style={{ backgroundColor: `${color}20` }}
          >
            <Icon className="w-6 h-6" style={{ color }} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Premium Lock Overlay
 */
function PremiumLock({ feature }: { feature: string }) {
  return (
    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center rounded-lg z-10">
      <div className="text-center p-4">
        <Lock className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
        <p className="text-sm font-medium text-muted-foreground">
          {feature}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Upgrade to Premium to unlock
        </p>
      </div>
    </div>
  );
}

/**
 * Views Over Time Chart
 */
function ViewsChart({
  data,
  isPremium,
}: {
  data: AnalyticsSummary["viewsByDay"];
  isPremium: boolean;
}) {
  // Only show last 7 days for free users
  const chartData = isPremium ? data : data.slice(-7);

  // Format dates for display
  const formattedData = chartData.map((d) => ({
    ...d,
    dateLabel: format(new Date(d.date), "MMM d"),
  }));

  return (
    <Card className="relative">
      {!isPremium && <PremiumLock feature="Full 30-day history" />}
      <CardHeader>
        <CardTitle className="text-lg">Views Over Time</CardTitle>
        <CardDescription>
          {isPremium ? "Last 30 days" : "Last 7 days"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="dateLabel"
                tick={{ fontSize: 12 }}
                tickLine={false}
              />
              <YAxis tick={{ fontSize: 12 }} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--popover))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="views"
                stroke={CHART_COLORS.views}
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Views"
              />
              <Line
                type="monotone"
                dataKey="downloads"
                stroke={CHART_COLORS.downloads}
                strokeWidth={2}
                dot={{ r: 3 }}
                name="Downloads"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Traffic Sources Pie Chart
 */
function SourcesChart({
  data,
  isPremium,
}: {
  data: AnalyticsSummary["viewsBySource"];
  isPremium: boolean;
}) {
  const chartData = data.map((d) => ({
    name: formatSource(d.source),
    value: d.count,
    fill: SOURCE_COLORS[d.source] || SOURCE_COLORS.unknown,
  }));

  const total = chartData.reduce((sum, d) => sum + d.value, 0);

  return (
    <Card className="relative">
      {!isPremium && <PremiumLock feature="Traffic source breakdown" />}
      <CardHeader>
        <CardTitle className="text-lg">Traffic Sources</CardTitle>
        <CardDescription>Where your views come from</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => [
                    `${value} (${Math.round((Number(value) / total) * 100)}%)`,
                    "Views",
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No data yet
            </div>
          )}
        </div>
        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 mt-4">
          {chartData.map((entry, index) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.fill }}
              />
              <span className="text-sm text-muted-foreground">
                {entry.name}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Top Countries Bar Chart
 */
function CountriesChart({
  data,
  isPremium,
}: {
  data: AnalyticsSummary["viewsByCountry"];
  isPremium: boolean;
}) {
  // Show top 5 countries
  const chartData = data.slice(0, 5);

  return (
    <Card className="relative">
      {!isPremium && <PremiumLock feature="Geographic insights" />}
      <CardHeader>
        <CardTitle className="text-lg">Top Countries</CardTitle>
        <CardDescription>Where your viewers are located</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[250px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis type="number" tick={{ fontSize: 12 }} />
                <YAxis
                  dataKey="country"
                  type="category"
                  tick={{ fontSize: 12 }}
                  width={100}
                />
                <Tooltip />
                <Bar dataKey="count" fill={CHART_COLORS.views} radius={4} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              No data yet
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Top Referrers List
 */
function ReferrersList({
  data,
  isPremium,
}: {
  data: AnalyticsSummary["topReferrers"];
  isPremium: boolean;
}) {
  return (
    <Card className="relative">
      {!isPremium && <PremiumLock feature="Referrer tracking" />}
      <CardHeader>
        <CardTitle className="text-lg">Top Referrers</CardTitle>
        <CardDescription>Sites linking to your resume</CardDescription>
      </CardHeader>
      <CardContent>
        {data.length > 0 ? (
          <div className="space-y-3">
            {data.slice(0, 5).map((referrer, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 border-b last:border-0"
              >
                <div className="flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium truncate max-w-[200px]">
                    {referrer.referrer}
                  </span>
                </div>
                <Badge variant="secondary">{referrer.count}</Badge>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No referrers yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Recent Activity Feed
 */
function ActivityFeed({
  activities,
  isPremium,
}: {
  activities: RecentActivity[];
  isPremium: boolean;
}) {
  const getActivityIcon = (type: RecentActivity["type"]) => {
    switch (type) {
      case "view":
        return Eye;
      case "download":
        return Download;
      case "share":
        return Share2;
      default:
        return Eye;
    }
  };

  const getActivityColor = (type: RecentActivity["type"]) => {
    switch (type) {
      case "view":
        return "text-blue-500";
      case "download":
        return "text-green-500";
      case "share":
        return "text-purple-500";
      default:
        return "text-gray-500";
    }
  };

  return (
    <Card className="relative">
      {!isPremium && <PremiumLock feature="Activity feed" />}
      <CardHeader>
        <CardTitle className="text-lg">Recent Activity</CardTitle>
        <CardDescription>Latest events on your resume</CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length > 0 ? (
          <div className="space-y-4 max-h-[400px] overflow-y-auto">
            {activities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              const colorClass = getActivityColor(activity.type);

              return (
                <div
                  key={activity.id}
                  className="flex items-start gap-3 pb-3 border-b last:border-0"
                >
                  <div
                    className={cn(
                      "p-2 rounded-full bg-muted flex-shrink-0",
                      colorClass
                    )}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">
                      <span className="capitalize">{activity.type}</span>
                      {activity.country && (
                        <span className="text-muted-foreground ml-1">
                          from {getCountryName(activity.country)}
                        </span>
                      )}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      <span>
                        {formatDistanceToNow(activity.timestamp, {
                          addSuffix: true,
                        })}
                      </span>
                      {activity.referrer && activity.referrer !== "direct" && (
                        <>
                          <span>via</span>
                          <span className="truncate max-w-[150px]">
                            {activity.referrer}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No activity yet
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Loading Skeleton
 */
function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-4 w-32 mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

/**
 * Main Analytics Dashboard Component
 */
export function AnalyticsDashboard({
  summary,
  recentActivity,
  isPremium,
  isLoading = false,
  resumeName,
}: AnalyticsDashboardProps) {
  if (isLoading) {
    return <AnalyticsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      {resumeName && (
        <div>
          <h2 className="text-xl font-semibold">Analytics for {resumeName}</h2>
          <p className="text-sm text-muted-foreground">
            Track how your public resume is performing
          </p>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard
          title="Total Views"
          value={summary.totalViews}
          trend={isPremium ? summary.viewsTrend : undefined}
          icon={Eye}
          color={CHART_COLORS.views}
        />
        <StatCard
          title="Total Downloads"
          value={summary.totalDownloads}
          trend={isPremium ? summary.downloadsTrend : undefined}
          icon={Download}
          color={CHART_COLORS.downloads}
        />
        <StatCard
          title="Total Shares"
          value={summary.totalShares}
          icon={Share2}
          color={CHART_COLORS.shares}
        />
      </div>

      {/* Views Over Time Chart */}
      <ViewsChart data={summary.viewsByDay} isPremium={isPremium} />

      {/* Secondary Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SourcesChart data={summary.viewsBySource} isPremium={isPremium} />
        <CountriesChart data={summary.viewsByCountry} isPremium={isPremium} />
        <ReferrersList data={summary.topReferrers} isPremium={isPremium} />
        <ActivityFeed activities={recentActivity} isPremium={isPremium} />
      </div>

      {/* Upgrade CTA for free users */}
      {!isPremium && (
        <Card className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/20">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Unlock Full Analytics</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Get 30-day history, geographic insights, referrer tracking,
                  and more with Premium.
                </p>
              </div>
              <Badge
                variant="secondary"
                className="bg-purple-500/20 text-purple-700 dark:text-purple-300"
              >
                Premium
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
