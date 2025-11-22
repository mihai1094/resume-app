"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TEMPLATES } from "@/lib/constants/templates";
import { TemplateId } from "@/lib/constants/templates";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { Goal } from "./goal-step";

interface TemplateStepProps {
    goal: Goal;
    selectedTemplate: TemplateId | null;
    onSelectTemplate: (templateId: TemplateId) => void;
}

const TEMPLATE_RECOMMENDATIONS: Record<Goal, TemplateId[]> = {
    "job-application": ["modern", "executive", "technical"],
    "career-change": ["creative", "minimalist", "adaptive"],
    "general-update": ["classic", "modern", "adaptive"],
};

export function TemplateStep({
    goal,
    selectedTemplate,
    onSelectTemplate,
}: TemplateStepProps) {
    const recommendedTemplateIds = TEMPLATE_RECOMMENDATIONS[goal];
    const recommendedTemplates = TEMPLATES.filter((t) =>
        recommendedTemplateIds.includes(t.id as TemplateId)
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-3">
                <h2 className="text-3xl font-bold tracking-tight">
                    Choose your starting point
                </h2>
                <p className="text-muted-foreground text-lg">
                    Based on your goal, we recommend these templates
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                {recommendedTemplates.map((template) => {
                    const isSelected = selectedTemplate === template.id;

                    return (
                        <Card
                            key={template.id}
                            className={cn(
                                "relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-1",
                                "border-2",
                                isSelected
                                    ? "border-primary ring-2 ring-primary/20 shadow-lg"
                                    : `border-border ${template.borderColor}`
                            )}
                            onClick={() => onSelectTemplate(template.id as TemplateId)}
                        >
                            {/* Template Preview */}
                            <div
                                className={cn(
                                    "h-48 bg-gradient-to-br flex items-center justify-center",
                                    template.color
                                )}
                            >
                                <div className="text-center space-y-2 p-6">
                                    <div className="text-6xl font-bold text-foreground/10">
                                        {template.name[0]}
                                    </div>
                                    <p className="text-xs text-muted-foreground uppercase tracking-wider">
                                        Preview
                                    </p>
                                </div>
                            </div>

                            {/* Template Info */}
                            <div className="p-6 space-y-4">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold">{template.name}</h3>
                                        {template.popularity >= 90 && (
                                            <Badge variant="secondary" className="text-xs">
                                                Popular
                                            </Badge>
                                        )}
                                    </div>
                                    <p className="text-sm text-muted-foreground">
                                        {template.description}
                                    </p>
                                </div>

                                <Button
                                    variant={isSelected ? "default" : "outline"}
                                    className="w-full"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onSelectTemplate(template.id as TemplateId);
                                    }}
                                >
                                    {isSelected ? (
                                        <>
                                            <Check className="w-4 h-4 mr-2" />
                                            Selected
                                        </>
                                    ) : (
                                        "Select Template"
                                    )}
                                </Button>
                            </div>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
