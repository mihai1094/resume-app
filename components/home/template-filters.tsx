"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Filter, X } from "lucide-react";

export type TemplateFilter = {
    industry: string[];
    style: string[];
    sortBy: "popular" | "newest" | "name";
};

interface TemplateFiltersProps {
    onFilterChange: (filters: TemplateFilter) => void;
    className?: string;
}

const INDUSTRIES = [
    "All Industries",
    "Technology",
    "Healthcare",
    "Finance",
    "Marketing",
    "Education",
    "Creative",
];

const STYLES = [
    "All Styles",
    "Modern",
    "Professional",
    "Creative",
    "Minimal",
    "Bold",
];

const SORT_OPTIONS = [
    { value: "popular", label: "Most Popular" },
    { value: "newest", label: "Newest" },
    { value: "name", label: "Name (A-Z)" },
] as const;

export function TemplateFilters({ onFilterChange, className }: TemplateFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedIndustries, setSelectedIndustries] = useState<string[]>(["All Industries"]);
    const [selectedStyles, setSelectedStyles] = useState<string[]>(["All Styles"]);
    const [sortBy, setSortBy] = useState<"popular" | "newest" | "name">("popular");

    const toggleIndustry = (industry: string) => {
        let newIndustries: string[];

        if (industry === "All Industries") {
            newIndustries = ["All Industries"];
        } else {
            newIndustries = selectedIndustries.filter((i) => i !== "All Industries");
            if (selectedIndustries.includes(industry)) {
                newIndustries = newIndustries.filter((i) => i !== industry);
                if (newIndustries.length === 0) newIndustries = ["All Industries"];
            } else {
                newIndustries = [...newIndustries, industry];
            }
        }

        setSelectedIndustries(newIndustries);
        onFilterChange({ industry: newIndustries, style: selectedStyles, sortBy });
    };

    const toggleStyle = (style: string) => {
        let newStyles: string[];

        if (style === "All Styles") {
            newStyles = ["All Styles"];
        } else {
            newStyles = selectedStyles.filter((s) => s !== "All Styles");
            if (selectedStyles.includes(style)) {
                newStyles = newStyles.filter((s) => s !== style);
                if (newStyles.length === 0) newStyles = ["All Styles"];
            } else {
                newStyles = [...newStyles, style];
            }
        }

        setSelectedStyles(newStyles);
        onFilterChange({ industry: selectedIndustries, style: newStyles, sortBy });
    };

    const handleSortChange = (value: "popular" | "newest" | "name") => {
        setSortBy(value);
        onFilterChange({ industry: selectedIndustries, style: selectedStyles, sortBy: value });
    };

    const clearFilters = () => {
        setSelectedIndustries(["All Industries"]);
        setSelectedStyles(["All Styles"]);
        setSortBy("popular");
        onFilterChange({ industry: ["All Industries"], style: ["All Styles"], sortBy: "popular" });
    };

    const activeFilterCount =
        (selectedIndustries.includes("All Industries") ? 0 : selectedIndustries.length) +
        (selectedStyles.includes("All Styles") ? 0 : selectedStyles.length);

    return (
        <div className={cn("space-y-4", className)}>
            {/* Filter Toggle Button & Sort Options */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <Button
                    variant="outline"
                    onClick={() => setIsOpen(!isOpen)}
                    className="gap-2 w-full sm:w-auto justify-between sm:justify-start"
                >
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4" />
                        Filters
                    </div>
                    {activeFilterCount > 0 && (
                        <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                            {activeFilterCount}
                        </Badge>
                    )}
                </Button>

                {/* Sort Options - Scrollable on mobile */}
                <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 -mx-6 px-6 sm:mx-0 sm:px-0 scrollbar-hide">
                    {SORT_OPTIONS.map((option) => (
                        <Button
                            key={option.value}
                            variant={sortBy === option.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleSortChange(option.value)}
                            className="whitespace-nowrap flex-shrink-0"
                        >
                            {option.label}
                        </Button>
                    ))}
                </div>
            </div>

            {/* Filter Panel */}
            {isOpen && (
                <div className="border rounded-lg p-4 space-y-4 bg-background">
                    {/* Industry Filters */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold">Industry</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {INDUSTRIES.map((industry) => (
                                <Badge
                                    key={industry}
                                    variant={selectedIndustries.includes(industry) ? "default" : "outline"}
                                    className="cursor-pointer hover:bg-primary/90"
                                    onClick={() => toggleIndustry(industry)}
                                >
                                    {industry}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Style Filters */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold">Style</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {STYLES.map((style) => (
                                <Badge
                                    key={style}
                                    variant={selectedStyles.includes(style) ? "default" : "outline"}
                                    className="cursor-pointer hover:bg-primary/90"
                                    onClick={() => toggleStyle(style)}
                                >
                                    {style}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Clear Filters */}
                    {activeFilterCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearFilters}
                            className="w-full gap-2"
                        >
                            <X className="w-4 h-4" />
                            Clear All Filters
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}
