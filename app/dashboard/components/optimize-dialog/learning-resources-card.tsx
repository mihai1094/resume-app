"use client";

import { useState } from "react";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  GraduationCap,
  Clock,
  ExternalLink,
  ChevronDown,
  Lightbulb,
  Play,
  BookOpen,
  Zap,
  Star,
} from "lucide-react";
import { LearnableSkill, YouTubeResource } from "@/lib/ai/content-types";
import { cn } from "@/lib/utils";

interface LearningResourcesCardProps {
  learnableSkills: LearnableSkill[];
}

function YouTubeVideoCard({ resource }: { resource: YouTubeResource }) {
  return (
    <a
      href={resource.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex gap-3 p-2 rounded-lg border bg-background hover:bg-accent/50 transition-all hover:shadow-md"
    >
      {/* Thumbnail */}
      <div className="relative w-28 h-16 md:w-32 md:h-18 rounded-md overflow-hidden bg-muted shrink-0">
        <Image
          src={resource.thumbnailUrl}
          alt={resource.title}
          width={128}
          height={72}
          className="w-full h-full object-cover"
          loading="lazy"
          unoptimized
        />
        {/* Play overlay */}
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center">
            <Play className="w-4 h-4 text-white fill-white ml-0.5" />
          </div>
        </div>
        {/* Duration badge */}
        <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-white text-[10px] font-medium">
          {resource.duration}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 py-0.5">
        <h4 className="font-medium text-xs md:text-sm line-clamp-2 group-hover:text-primary transition-colors">
          {resource.title}
        </h4>
        <div className="flex items-center gap-2 mt-1 text-[10px] md:text-xs text-muted-foreground">
          <span className="truncate">{resource.channelName}</span>
          <Badge
            variant="outline"
            className="text-[9px] h-4 px-1 capitalize shrink-0"
          >
            {resource.type.replace("-", " ")}
          </Badge>
        </div>
      </div>

      {/* External link icon */}
      <ExternalLink className="w-4 h-4 text-muted-foreground shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
    </a>
  );
}

function SkillCard({ skill, index }: { skill: LearnableSkill; index: number }) {
  const [isExpanded, setIsExpanded] = useState(index === 0); // First one expanded by default

  const difficultyColors = {
    easy: "bg-green-100 text-green-700 border-green-200 dark:bg-green-950/30 dark:text-green-300",
    medium: "bg-yellow-100 text-yellow-700 border-yellow-200 dark:bg-yellow-950/30 dark:text-yellow-300",
    hard: "bg-red-100 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-300",
  };

  const importanceColors = {
    critical: "bg-red-500",
    important: "bg-orange-500",
    "nice-to-have": "bg-blue-500",
  };

  return (
    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
      <Card
        className={cn(
          "overflow-hidden transition-all",
          isExpanded && "ring-2 ring-primary/20"
        )}
      >
        <CollapsibleTrigger asChild>
          <button className="w-full p-3 md:p-4 text-left hover:bg-accent/30 transition-colors">
            <div className="flex items-start gap-3">
              {/* Skill icon with importance indicator */}
              <div className="relative shrink-0">
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-primary" />
                </div>
                <div
                  className={cn(
                    "absolute -top-1 -right-1 w-3 h-3 rounded-full",
                    importanceColors[skill.importance]
                  )}
                />
              </div>

              {/* Skill info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="font-bold text-sm md:text-base">{skill.skill}</h3>
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] h-5 capitalize", difficultyColors[skill.difficultyToLearn])}
                  >
                    {skill.difficultyToLearn}
                  </Badge>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                  {skill.reason}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {skill.timeToLearn}
                  </span>
                  <span className="flex items-center gap-1 capitalize">
                    <Star className="w-3 h-3" />
                    {skill.importance}
                  </span>
                </div>
              </div>

              {/* Expand/collapse */}
              <ChevronDown
                className={cn(
                  "w-5 h-5 text-muted-foreground transition-transform shrink-0",
                  isExpanded && "rotate-180"
                )}
              />
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-3 pb-3 md:px-4 md:pb-4 space-y-3 border-t pt-3">
            {/* Interview tip */}
            <div className="flex items-start gap-2 p-2 md:p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
              <Lightbulb className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-xs font-semibold text-amber-800 dark:text-amber-200 mb-0.5">
                  Interview Tip
                </h4>
                <p className="text-xs text-amber-700 dark:text-amber-300">
                  {skill.interviewTip}
                </p>
              </div>
            </div>

            {/* YouTube resources */}
            <div>
              <h4 className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                <Play className="w-3.5 h-3.5 text-red-500" />
                Learning Resources ({skill.youtubeResources.length})
              </h4>
              <div className="space-y-2">
                {skill.youtubeResources.map((resource, idx) => (
                  <YouTubeVideoCard key={idx} resource={resource} />
                ))}
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

export function LearningResourcesCard({ learnableSkills }: LearningResourcesCardProps) {
  if (!learnableSkills || learnableSkills.length === 0) {
    return null;
  }

  // Group by importance
  const critical = learnableSkills.filter((s) => s.importance === "critical");
  const important = learnableSkills.filter((s) => s.importance === "important");
  const niceToHave = learnableSkills.filter((s) => s.importance === "nice-to-have");

  const totalResources = learnableSkills.reduce(
    (acc, skill) => acc + skill.youtubeResources.length,
    0
  );

  return (
    <Card className="p-3 md:p-6 border-2 border-blue-200 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 dark:from-blue-950/10 dark:to-cyan-950/10">
      {/* Header */}
      <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-6">
        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shrink-0">
          <GraduationCap className="w-4 h-4 md:w-5 md:h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-sm md:text-xl">Quick Wins: Skills to Learn</h3>
          <p className="text-xs md:text-sm text-muted-foreground">
            {learnableSkills.length} skills with {totalResources} curated tutorials
          </p>
        </div>
      </div>

      {/* Stats badges */}
      <div className="flex gap-1.5 md:gap-2 mb-3 md:mb-6 overflow-x-auto pb-1 -mx-1 px-1">
        {critical.length > 0 && (
          <Badge variant="destructive" className="gap-1 text-xs shrink-0">
            <Zap className="w-3 h-3" />
            {critical.length} Critical
          </Badge>
        )}
        {important.length > 0 && (
          <Badge variant="secondary" className="gap-1 text-xs shrink-0 bg-orange-100 text-orange-700 hover:bg-orange-100">
            {important.length} Important
          </Badge>
        )}
        {niceToHave.length > 0 && (
          <Badge variant="outline" className="gap-1 text-xs shrink-0">
            {niceToHave.length} Nice to Have
          </Badge>
        )}
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-2 p-2 md:p-3 bg-blue-100/50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800 mb-4">
        <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
        <p className="text-xs text-blue-800 dark:text-blue-200">
          <strong>Pro tip:</strong> Learn these skills before your interview. Even basic knowledge shows initiative and
          makes you a stronger candidate. Focus on crash courses first, then build a small project.
        </p>
      </div>

      {/* Skills list */}
      <div className="space-y-3">
        {learnableSkills.map((skill, index) => (
          <SkillCard key={skill.id} skill={skill} index={index} />
        ))}
      </div>
    </Card>
  );
}
