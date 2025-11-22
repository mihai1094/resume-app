"use client";

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface Activity {
    id: string;
    name: string;
    location: string;
    action: string;
    timestamp: Date;
}

const MOCK_ACTIVITIES: Omit<Activity, "id" | "timestamp">[] = [
    { name: "Sarah Chen", location: "San Francisco", action: "created a resume" },
    { name: "Michael Rodriguez", location: "NYC", action: "downloaded their resume" },
    { name: "Emily Thompson", location: "London", action: "created a resume" },
    { name: "David Kim", location: "Toronto", action: "imported their CV" },
    { name: "Jessica Martinez", location: "Austin", action: "created a resume" },
    { name: "Alex Johnson", location: "Seattle", action: "downloaded their resume" },
    { name: "Maria Garcia", location: "Miami", action: "created a resume" },
    { name: "James Wilson", location: "Boston", action: "imported their CV" },
];

function generateActivity(): Activity {
    const template = MOCK_ACTIVITIES[Math.floor(Math.random() * MOCK_ACTIVITIES.length)];
    return {
        ...template,
        id: Math.random().toString(36).substr(2, 9),
        timestamp: new Date(),
    };
}

export function RealTimeActivity() {
    const [activities, setActivities] = useState<Activity[]>([]);
    const [latestActivity, setLatestActivity] = useState<Activity | null>(null);

    useEffect(() => {
        // Initial activities
        const initial = Array.from({ length: 3 }, generateActivity);
        setActivities(initial);

        // Add new activity every 8-15 seconds
        const interval = setInterval(() => {
            const newActivity = generateActivity();
            setLatestActivity(newActivity);

            setTimeout(() => {
                setActivities((prev) => [newActivity, ...prev.slice(0, 4)]);
                setLatestActivity(null);
            }, 500);
        }, Math.random() * 7000 + 8000); // 8-15 seconds

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="fixed bottom-24 left-4 z-40 max-w-sm hidden lg:block">
            <div className="space-y-2">
                {/* New activity animation */}
                {latestActivity && (
                    <Card
                        className="p-3 bg-background/95 backdrop-blur-sm border-primary/50 shadow-lg animate-in slide-in-from-left duration-500"
                    >
                        <ActivityItem activity={latestActivity} isNew />
                    </Card>
                )}

                {/* Recent activities */}
                <Card className="p-3 bg-background/95 backdrop-blur-sm shadow-lg">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Live Activity
                        </div>
                        <div className="space-y-2">
                            {activities.slice(0, 3).map((activity, index) => (
                                <ActivityItem
                                    key={activity.id}
                                    activity={activity}
                                    className={cn(
                                        "transition-opacity duration-300",
                                        index > 0 && "opacity-60"
                                    )}
                                />
                            ))}
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}

function ActivityItem({
    activity,
    isNew = false,
    className,
}: {
    activity: Activity;
    isNew?: boolean;
    className?: string;
}) {
    const initials = activity.name
        .split(" ")
        .map((n) => n[0])
        .join("");

    return (
        <div className={cn("flex items-center gap-2", className)}>
            <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                    {initials}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
                <p className="text-sm">
                    <span className="font-semibold">{activity.name}</span>
                    {" from "}
                    <span className="text-muted-foreground">{activity.location}</span>
                </p>
                <p className="text-xs text-muted-foreground">{activity.action}</p>
            </div>
            {isNew && (
                <div className="text-xs font-semibold text-primary">Just now</div>
            )}
        </div>
    );
}
