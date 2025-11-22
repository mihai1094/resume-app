"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const PREVIEW_TEMPLATES = [
    {
        id: "modern",
        name: "Modern",
        color: "from-blue-500/20 to-purple-500/20",
    },
    {
        id: "professional",
        name: "Professional",
        color: "from-slate-500/20 to-gray-500/20",
    },
    {
        id: "creative",
        name: "Creative",
        color: "from-pink-500/20 to-orange-500/20",
    },
];

export function InteractiveResumePreview() {
    const [currentTemplate, setCurrentTemplate] = useState(0);

    const nextTemplate = () => {
        setCurrentTemplate((prev) => (prev + 1) % PREVIEW_TEMPLATES.length);
    };

    const prevTemplate = () => {
        setCurrentTemplate(
            (prev) => (prev - 1 + PREVIEW_TEMPLATES.length) % PREVIEW_TEMPLATES.length
        );
    };

    const template = PREVIEW_TEMPLATES[currentTemplate];

    return (
        <div className="relative">
            {/* Template Switcher Controls */}
            <div className="absolute -top-12 left-0 right-0 flex items-center justify-end gap-2 z-30">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={prevTemplate}
                    className="h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur-sm"
                >
                    <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="flex gap-1.5">
                    {PREVIEW_TEMPLATES.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentTemplate(index)}
                            className={cn(
                                "h-1.5 rounded-full transition-all",
                                currentTemplate === index
                                    ? "w-6 bg-primary"
                                    : "w-1.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
                            )}
                            aria-label={`Switch to template ${index + 1}`}
                        />
                    ))}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={nextTemplate}
                    className="h-8 w-8 p-0 rounded-full bg-background/80 backdrop-blur-sm"
                >
                    <ChevronRight className="w-4 h-4" />
                </Button>
            </div>

            {/* Floating card with mock resume preview */}
            <Card
                className={cn(
                    "p-8 shadow-2xl border-none bg-white/80 backdrop-blur-sm relative overflow-hidden group rotate-1 hover:rotate-0 transition-all duration-500",
                    `bg-gradient-to-br ${template.color}`
                )}
            >
                {/* Subtle gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="space-y-6 relative">
                    {/* Header */}
                    <div className="space-y-3">
                        <div className="h-4 bg-gradient-to-r from-foreground to-foreground/30 rounded-full w-1/2" />
                        <div className="h-3 bg-muted rounded-full w-2/3" />
                        <div className="h-3 bg-muted rounded-full w-1/2" />
                    </div>

                    {/* Content blocks */}
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="h-3 bg-primary/20 rounded-full w-1/4" />
                            <div className="h-2 bg-muted rounded-full w-full" />
                            <div className="h-2 bg-muted rounded-full w-5/6" />
                            <div className="h-2 bg-muted rounded-full w-4/5" />
                        </div>

                        <div className="space-y-2">
                            <div className="h-3 bg-primary/20 rounded-full w-1/3" />
                            <div className="h-2 bg-muted rounded-full w-full" />
                            <div className="h-2 bg-muted rounded-full w-11/12" />
                        </div>
                    </div>
                </div>

                {/* AI badge overlay */}
                <div className="absolute top-4 right-4">
                    <Badge className="shadow-lg">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI Optimized
                    </Badge>
                </div>

                {/* Template name badge */}
                <div className="absolute bottom-4 left-4">
                    <Badge variant="secondary" className="text-xs">
                        {template.name} Template
                    </Badge>
                </div>
            </Card>

            {/* Floating elements */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
        </div>
    );
}
