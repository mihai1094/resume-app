"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Briefcase, Search } from "lucide-react";
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center space-y-3">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Briefcase className="w-8 h-8 text-primary" />
          </div>
        </div>
        <h2 className="text-3xl font-bold tracking-tight">
          What role are you targeting?
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Tell us your target job title so we can personalize your resume with
          relevant templates and content suggestions
        </p>
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
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && customTitle.trim()) {
                handleCustomTitleSubmit();
              }
            }}
            className="w-full pl-12 pr-4 py-4 text-lg border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>
      </div>

      {/* Common Job Titles */}
      <div className="max-w-4xl mx-auto">
        <h3 className="text-sm font-medium text-muted-foreground mb-4 text-center">
          Popular job titles
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
          {filteredTitles.map((title) => {
            const isSelected = selectedJobTitle === title;

            return (
              <Card
                key={title}
                className={cn(
                  "p-4 cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-0.5",
                  "border-2 text-center",
                  isSelected
                    ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => handleSelectTitle(title)}
              >
                <p className="text-sm font-medium">{title}</p>
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

      {/* Selected Job Title Display */}
      {selectedJobTitle && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-primary/5 border-2 border-primary/20 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    Target Position
                  </p>
                  <p className="font-semibold">{selectedJobTitle}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  onSelectJobTitle("");
                  setCustomTitle("");
                  setSearchQuery("");
                }}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Change
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
