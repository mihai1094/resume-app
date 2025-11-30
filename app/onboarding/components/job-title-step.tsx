"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Briefcase, Search, HelpCircle, Check } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface JobTitleStepProps {
  selectedJobTitle: string;
  onSelectJobTitle: (title: string) => void;
}

const COMMON_JOB_TITLES = [
  "Software Engineer",
  "Product Manager",
  "Data Scientist",
  "Marketing Manager",
  "Sales Representative",
  "Business Analyst",
  "UX Designer",
  "Project Manager",
  "Financial Analyst",
  "Human Resources Manager",
  "Customer Success Manager",
  "Operations Manager",
  "Account Executive",
  "Content Writer",
  "Other",
];

export function JobTitleStep({
  selectedJobTitle,
  onSelectJobTitle,
}: JobTitleStepProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [customTitle, setCustomTitle] = useState("");

  const filteredTitles = COMMON_JOB_TITLES.filter((title) =>
    title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectTitle = (title: string) => {
    onSelectJobTitle(title);
    setCustomTitle("");
  };

  const handleCustomTitleSubmit = () => {
    if (customTitle.trim()) {
      onSelectJobTitle(customTitle.trim());
    }
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-2">
        <div className="flex justify-center mb-2">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Briefcase className="w-6 h-6 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          What is your <span className="text-primary">primary</span> target
          role?
        </h2>
        <p className="text-muted-foreground text-base max-w-2xl mx-auto">
          We'll start with this role to personalize your first resume. You can
          easily create variations for other positions later.
        </p>

        <div className="pt-2">
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <button className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors">
                  <HelpCircle className="w-4 h-4" />
                  <span>Targeting multiple roles?</span>
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  We recommend creating a master resume for your primary goal
                  first. You can then duplicate it and tailor the content for
                  other job titles.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Search Input */}
      <div className="max-w-2xl mx-auto">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search for a job title or enter your own..."
            value={customTitle || searchQuery}
            onChange={(e) => {
              const value = e.target.value;
              setCustomTitle(value);
              setSearchQuery(value);
              // Keep the parent state in sync so Next is enabled as soon as a title is typed
              onSelectJobTitle(value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && customTitle.trim()) {
                handleCustomTitleSubmit();
              }
            }}
            className="w-full pl-10 pr-4 py-3 text-base border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Common Job Titles */}
      <div className="max-w-4xl mx-auto">
        <h3 className="text-xs font-medium text-muted-foreground mb-3 text-center uppercase tracking-wider">
          Popular job titles
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
          {filteredTitles.map((title) => {
            const isSelected = selectedJobTitle === title;
            const isOther = title === "Other";

            return (
              <Card
                key={title}
                className={cn(
                  "p-3 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
                  "border-2 text-center flex items-center justify-center min-h-[60px] relative",
                  isSelected
                    ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                    : isOther
                      ? "border-dashed border-muted-foreground/30 bg-muted/30 hover:border-primary/50 hover:bg-muted/50"
                      : "border-border hover:border-primary/50"
                )}
                onClick={() => handleSelectTitle(title)}
              >
                {isSelected && (
                  <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
                <p
                  className={cn(
                    "text-xs font-medium leading-tight",
                    isOther && !isSelected && "text-muted-foreground"
                  )}
                >
                  {title}
                </p>
              </Card>
            );
          })}
        </div>

        {filteredTitles.length === 0 && searchQuery && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No matching job titles found
            </p>
            {customTitle.trim() && (
              <button
                onClick={handleCustomTitleSubmit}
                className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Use "{customTitle}"
              </button>
            )}
          </div>
        )}
      </div>


    </div>
  );
}
