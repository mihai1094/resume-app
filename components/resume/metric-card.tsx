"use client";

import { motion, AnimatePresence } from "framer-motion";
import { LucideIcon, ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MetricScore, ActionableItem } from "@/lib/services/resume-scoring";

interface MetricCardProps extends MetricScore {
    id: string;
    icon: LucideIcon;
    label: string;
    expanded: boolean;
    onToggle: () => void;
    onJumpToSection?: (sectionId: string) => void;
}

export function MetricCard({
    id,
    icon: Icon,
    label,
    score,
    maxScore,
    status,
    feedback,
    actionableItems = [],
    expanded,
    onToggle,
    onJumpToSection,
}: MetricCardProps) {
    const percentage = (score / maxScore) * 100;

    const getStatusIcon = () => {
        if (status === "excellent") return "✅";
        if (status === "good") return "✅";
        if (status === "fair") return "⚠️";
        return "❌";
    };

    const getStatusColor = () => {
        if (status === "excellent") return "text-green-500";
        if (status === "good") return "text-blue-500";
        if (status === "fair") return "text-orange-500";
        return "text-red-500";
    };

    const getBarColor = () => {
        if (status === "excellent") return "bg-green-500";
        if (status === "good") return "bg-blue-500";
        if (status === "fair") return "bg-orange-500";
        return "bg-red-500";
    };

    return (
        <div className="border rounded-lg overflow-hidden">
            {/* Main Card */}
            <button
                onClick={onToggle}
                className="w-full p-4 hover:bg-muted/50 transition-colors text-left"
            >
                <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className={cn("flex-shrink-0 mt-0.5", getStatusColor())}>
                        <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                        {/* Label and Score */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">{getStatusIcon()}</span>
                                <span className="font-medium">{label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className={cn("font-bold", getStatusColor())}>
                                    {score}/{maxScore}
                                </span>
                                {expanded ? (
                                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                )}
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                            <motion.div
                                className={cn("absolute inset-y-0 left-0 rounded-full", getBarColor())}
                                initial={{ width: 0 }}
                                animate={{ width: `${percentage}%` }}
                                transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
                            />
                        </div>

                        {/* Feedback */}
                        <div className="text-sm text-muted-foreground mt-2">{feedback}</div>
                    </div>
                </div>
            </button>

            {/* Expandable Details */}
            <AnimatePresence>
                {expanded && actionableItems.length > 0 && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t bg-muted/20"
                    >
                        <div className="p-4 space-y-2">
                            <div className="text-sm font-medium mb-3">Action Items:</div>
                            {actionableItems.map((item, idx) => (
                                <div
                                    key={item.id}
                                    className="flex items-start gap-2 p-2 rounded bg-background"
                                >
                                    <Badge
                                        variant={
                                            item.priority === "high"
                                                ? "destructive"
                                                : item.priority === "medium"
                                                    ? "default"
                                                    : "secondary"
                                        }
                                        className="text-xs flex-shrink-0"
                                    >
                                        {idx + 1}
                                    </Badge>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium">{item.title}</div>
                                        <div className="text-xs text-muted-foreground mt-0.5">
                                            {item.description}
                                        </div>
                                    </div>
                                    {item.sectionId && onJumpToSection && (
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="flex-shrink-0 text-xs"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onJumpToSection(item.sectionId!);
                                            }}
                                        >
                                            Fix
                                        </Button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
