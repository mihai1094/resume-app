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
                "text-center py-16 border-2 border-dashed rounded-xl bg-muted/10 hover:bg-muted/20 transition-all duration-300 hover:border-primary/30",
                className
            )}
        >
            {/* Icon with gradient background */}
            <div className="relative w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/5 rounded-2xl blur-xl" />
                <div className="relative w-full h-full bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl flex items-center justify-center">
                    <Icon className="w-10 h-10 text-primary" />
                </div>
            </div>

            {/* Content */}
            <h3 className="text-xl font-semibold mb-2">{title}</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto leading-relaxed">
                {description}
            </p>

            {/* CTA Button */}
            <Button
                onClick={onAction}
                size="lg"
                className="shadow-lg hover:shadow-xl transition-shadow"
            >
                {actionLabel}
            </Button>

            {/* Decorative elements */}
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 rounded-full bg-primary/20" />
                <span>Your career story starts here</span>
                <div className="w-2 h-2 rounded-full bg-primary/20" />
            </div>
        </div>
    );
}
