"use client";

import { Shield, Lock, Award, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function TrustBadges() {
    const badges = [
        {
            icon: Shield,
            text: "SSL Secured",
        },
        {
            icon: Lock,
            text: "GDPR Compliant",
        },
        {
            icon: Award,
            text: "ATS Certified",
        },
        {
            icon: Users,
            text: "10,000+ Users",
        },
    ];

    return (
        <div className="flex flex-wrap items-center justify-center gap-4">
            {badges.map((badge, index) => {
                const Icon = badge.icon;
                return (
                    <Badge
                        key={index}
                        variant="outline"
                        className="px-3 py-1.5 text-xs font-medium border-muted-foreground/20"
                    >
                        <Icon className="w-3 h-3 mr-1.5" />
                        {badge.text}
                    </Badge>
                );
            })}
        </div>
    );
}
