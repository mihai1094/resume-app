"use client";

import { Tip } from "@/hooks/use-bullet-tips";
import { cn } from "@/lib/utils";
import { CheckCircle2, AlertCircle, Lightbulb, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface WritingTipsProps {
    tips: Tip[];
    onInsertSuggestion?: (suggestion: string) => void;
    className?: string;
}

export function WritingTips({
    tips,
    onInsertSuggestion,
    className,
}: WritingTipsProps) {
    const [isDismissed, setIsDismissed] = useState(false);

    if (isDismissed || tips.length === 0) {
        return null;
    }

    const getIcon = (type: Tip["type"]) => {
        switch (type) {
            case "success":
                return <CheckCircle2 className="w-4 h-4 text-green-500" />;
            case "warning":
                return <AlertCircle className="w-4 h-4 text-orange-500" />;
            case "info":
                return <Lightbulb className="w-4 h-4 text-blue-500" />;
        }
    };

    const getTextColor = (type: Tip["type"]) => {
        switch (type) {
            case "success":
                return "text-muted-foreground";
            case "warning":
                return "text-foreground";
            case "info":
                return "text-foreground";
        }
    };

    return (
        <div
            className={cn(
                "w-[280px] bg-card border rounded-lg shadow-lg p-4 space-y-3 animate-in slide-in-from-right-4 duration-300",
                className
            )}
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-primary" />
                    <h3 className="text-sm font-semibold">Writing Tips</h3>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => setIsDismissed(true)}
                >
                    <X className="w-3 h-3" />
                </Button>
            </div>

            {/* Divider */}
            <div className="h-px bg-border" />

            {/* Tips */}
            <div className="space-y-3">
                {tips.map((tip) => (
                    <div key={tip.id} className="space-y-2">
                        <div className="flex items-start gap-2">
                            {getIcon(tip.type)}
                            <p className={cn("text-xs flex-1", getTextColor(tip.type))}>
                                {tip.message}
                            </p>
                        </div>

                        {/* Suggestions */}
                        {tip.suggestions && tip.suggestions.length > 0 && (
                            <div className="ml-6 space-y-1">
                                {tip.suggestions.map((suggestion, idx) => (
                                    <button
                                        key={idx}
                                        className="block w-full text-left text-xs text-primary hover:text-primary/80 hover:bg-primary/5 px-2 py-1 rounded transition-colors"
                                        onClick={() => onInsertSuggestion?.(suggestion)}
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Footer hint */}
            <div className="pt-2 border-t">
                <p className="text-[10px] text-muted-foreground">
                    Click suggestions to insert them
                </p>
            </div>
        </div>
    );
}
