"use client";

import { useState, useEffect } from "react";
import { Lightbulb, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export interface InlineTipProps {
    message: string;
    suggestions?: string[];
    onInsertSuggestion?: (suggestion: string) => void;
    show?: boolean;
    className?: string;
}

export function InlineTip({
    message,
    suggestions = [],
    onInsertSuggestion,
    show = true,
    className,
}: InlineTipProps) {
    const [isDismissed, setIsDismissed] = useState(false);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (show && !isDismissed) {
            // Small delay for animation
            const timer = setTimeout(() => setIsVisible(true), 50);
            return () => clearTimeout(timer);
        } else {
            setIsVisible(false);
        }
    }, [show, isDismissed]);

    if (!show || isDismissed) {
        return null;
    }

    return (
        <div
            className={cn(
                "relative bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3 transition-all duration-300",
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2",
                className
            )}
        >
            <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-foreground/80">{message}</p>

                    {suggestions && suggestions.length > 0 && (
                        <div className="mt-2 space-y-1">
                            {suggestions.map((suggestion, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => onInsertSuggestion?.(suggestion)}
                                    className="block w-full text-left text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 px-2 py-1.5 rounded transition-colors"
                                >
                                    + {suggestion}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 shrink-0"
                    onClick={() => setIsDismissed(true)}
                >
                    <X className="w-3 h-3" />
                </Button>
            </div>
        </div>
    );
}
