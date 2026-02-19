"use client";

import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel: string;
    onAction: () => void;
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    className,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "relative overflow-hidden text-center py-20 px-4 border border-dashed rounded-3xl bg-card hover:bg-muted/5 transition-all duration-500 hover:border-primary/30 group",
                className
            )}
        >
            {/* Animated Ambient Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-blue-500/5 opacity-40 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            {/* Subtle Background Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 dark:opacity-10 pointer-events-none" />

            <div className="relative z-10 w-full max-w-lg mx-auto flex flex-col items-center">
                {/* Icon with animated gradient background */}
                <div className="relative w-24 h-24 mb-8">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-blue-500/30 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-700 opacity-70 group-hover:opacity-100 group-hover:animate-pulse" />
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-blue-500/20 rounded-3xl group-hover:scale-105 transition-transform duration-500" />
                    <div className="relative w-full h-full bg-card/60 backdrop-blur-md border border-white/10 dark:border-white/5 rounded-3xl flex items-center justify-center shadow-inner group-hover:-translate-y-1 transition-transform duration-500">
                        <Icon className="w-10 h-10 text-primary drop-shadow-sm" strokeWidth={1.5} />
                    </div>
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-3 tracking-tight">{title}</h3>
                <p className="text-muted-foreground mb-8 text-base leading-relaxed max-w-sm mx-auto">
                    {description}
                </p>

                {/* CTA Button */}
                <Button
                    onClick={onAction}
                    size="lg"
                    className="shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 px-8 font-medium"
                >
                    {actionLabel}
                </Button>
            </div>
        </div>
    );
}
