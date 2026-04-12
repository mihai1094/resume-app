"use client";

import { Button } from "@/components/ui/button";
import { LucideIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel: string;
    onAction: () => void;
    className?: string;
    tips?: string[];
    aiActionLabel?: string;
    onAiAction?: () => void;
    /** Generic secondary action rendered as a ghost button below the primary CTA */
    secondaryActionLabel?: string;
    onSecondaryAction?: () => void;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    className,
    tips,
    aiActionLabel,
    onAiAction,
    secondaryActionLabel,
    onSecondaryAction,
}: EmptyStateProps) {
    return (
        <div
            className={cn(
                "text-center py-16 px-4 border border-dashed rounded-2xl bg-card",
                className
            )}
        >
            <div className="w-full max-w-lg mx-auto flex flex-col items-center">
                {/* Icon */}
                <div className="w-16 h-16 mb-6 rounded-2xl bg-muted flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-3 tracking-tight">{title}</h3>
                <p className="text-muted-foreground mb-8 text-base leading-relaxed max-w-sm mx-auto">
                    {description}
                </p>

                {tips && tips.length > 0 && (
                    <div className="w-full max-w-sm mx-auto text-left mb-6 space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Tips for a great section</p>
                        <ul className="space-y-1.5">
                            {tips.map((tip, i) => (
                                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                    <span className="mt-1.5 w-1 h-1 rounded-full bg-primary/60 shrink-0" />
                                    {tip}
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* CTA Button */}
                <Button
                    onClick={onAction}
                    size="lg"
                    className="px-8 font-medium"
                >
                    {actionLabel}
                </Button>
                {onAiAction && aiActionLabel && (
                    <Button
                        onClick={onAiAction}
                        variant="outline"
                        size="sm"
                        className="mt-3 gap-1.5"
                    >
                        <Sparkles className="w-3.5 h-3.5" />
                        {aiActionLabel}
                    </Button>
                )}
                {onSecondaryAction && secondaryActionLabel && (
                    <Button
                        onClick={onSecondaryAction}
                        variant="ghost"
                        size="sm"
                        className="mt-3 text-muted-foreground hover:text-foreground"
                    >
                        {secondaryActionLabel}
                    </Button>
                )}
            </div>
        </div>
    );
}
