"use client";

import { ApplicationStats as ApplicationStatsType } from "@/lib/types/application";
import { cn } from "@/lib/utils";
import {
  Briefcase,
  Send,
  MessageSquare,
  Users,
  Trophy,
  XCircle,
  TrendingUp,
  BarChart3,
} from "lucide-react";

interface ApplicationStatsProps {
  stats: ApplicationStatsType;
  className?: string;
}

export function ApplicationStats({ stats, className }: ApplicationStatsProps) {
  const statItems = [
    {
      label: "Total",
      value: stats.total,
      icon: Briefcase,
      color: "text-foreground",
      bgColor: "bg-muted",
    },
    {
      label: "Active",
      value: stats.activeApplications,
      icon: TrendingUp,
      color: "text-blue-600",
      bgColor: "bg-blue-500/10",
    },
    {
      label: "Response Rate",
      value: `${stats.responseRate}%`,
      icon: MessageSquare,
      color: "text-yellow-600",
      bgColor: "bg-yellow-500/10",
    },
    {
      label: "Interview Rate",
      value: `${stats.interviewRate}%`,
      icon: Users,
      color: "text-purple-600",
      bgColor: "bg-purple-500/10",
    },
    {
      label: "Offers",
      value: stats.byStatus.offer,
      icon: Trophy,
      color: "text-green-600",
      bgColor: "bg-green-500/10",
    },
  ];

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3", className)}>
      {statItems.map((item) => (
        <div
          key={item.label}
          className="bg-card border rounded-lg p-4 flex items-center gap-3"
        >
          <div
            className={cn(
              "h-10 w-10 rounded-full flex items-center justify-center shrink-0",
              item.bgColor
            )}
          >
            <item.icon className={cn("h-5 w-5", item.color)} />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground truncate">{item.label}</p>
            <p className="text-lg font-bold truncate">{item.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
