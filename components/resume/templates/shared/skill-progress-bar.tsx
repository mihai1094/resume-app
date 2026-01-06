"use client";

import { cn } from "@/lib/utils";

interface SkillProgressBarProps {
  name: string;
  level?: "beginner" | "intermediate" | "advanced" | "expert";
  percentage?: number;
  color: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const levelToPercentage: Record<string, number> = {
  beginner: 25,
  intermediate: 50,
  advanced: 75,
  expert: 95,
};

/**
 * Horizontal skill progress bar with optional label
 * Used in Cascade, Infographic templates
 */
export function SkillProgressBar({
  name,
  level,
  percentage,
  color,
  showLabel = true,
  size = "md",
  className,
}: SkillProgressBarProps) {
  const fillPercentage = percentage ?? (level ? levelToPercentage[level] : 50);

  const heights = {
    sm: "h-1.5",
    md: "h-2",
    lg: "h-2.5",
  };

  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium truncate pr-2">{name}</span>
          {percentage !== undefined && (
            <span className="text-[10px] text-gray-400">{fillPercentage}%</span>
          )}
        </div>
      )}
      <div className={cn("w-full bg-gray-200 rounded-full overflow-hidden", heights[size])}>
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${fillPercentage}%`,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}

interface SkillProgressBarGroupProps {
  skills: Array<{
    name: string;
    level?: "beginner" | "intermediate" | "advanced" | "expert";
  }>;
  color: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Group of skill progress bars
 */
export function SkillProgressBarGroup({
  skills,
  color,
  size = "md",
  className,
}: SkillProgressBarGroupProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {skills.map((skill, index) => (
        <SkillProgressBar
          key={index}
          name={skill.name}
          level={skill.level}
          color={color}
          size={size}
        />
      ))}
    </div>
  );
}
