"use client";

import { useState } from "react";
import { useAchievements } from "@/hooks/use-achievements";
import { Achievement, AchievementId } from "@/lib/types/achievements";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Trophy, Lock, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface AchievementCardProps {
  achievement: Achievement;
}

function AchievementCard({ achievement }: AchievementCardProps) {
  const isUnlocked = !!achievement.unlockedAt;

  return (
    <div
      className={cn(
        "relative p-4 rounded-lg border transition-all duration-200",
        isUnlocked
          ? "bg-gradient-to-br from-primary/5 to-primary/10 border-primary/30"
          : "bg-muted/30 border-muted opacity-60"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center text-2xl shrink-0",
            isUnlocked ? "bg-primary/20" : "bg-muted"
          )}
        >
          {isUnlocked ? achievement.icon : <Lock className="w-5 h-5 text-muted-foreground" />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3
              className={cn(
                "font-semibold truncate",
                !isUnlocked && "text-muted-foreground"
              )}
            >
              {achievement.title}
            </h3>
            {isUnlocked && (
              <Badge variant="secondary" className="shrink-0 text-xs">
                +{achievement.points}
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {achievement.description}
          </p>
          {achievement.progress && !isUnlocked && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                <span>Progress</span>
                <span>
                  {achievement.progress.current}/{achievement.progress.target}
                </span>
              </div>
              <Progress
                value={
                  (achievement.progress.current / achievement.progress.target) *
                  100
                }
                className="h-1.5"
              />
            </div>
          )}
          {isUnlocked && achievement.unlockedAt && (
            <p className="text-xs text-muted-foreground mt-1">
              Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function AchievementsPanel() {
  const {
    achievements,
    totalPoints,
    level,
    getUnlockedCount,
    getProgressToNextLevel,
  } = useAchievements();

  const unlockedCount = getUnlockedCount();
  const totalCount = Object.keys(achievements).length;
  const levelProgress = getProgressToNextLevel();

  const achievementsList = Object.values(achievements);
  const unlockedAchievements = achievementsList.filter((a) => a.unlockedAt);
  const lockedAchievements = achievementsList.filter((a) => !a.unlockedAt);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 relative"
        >
          <Trophy className="w-4 h-4 text-amber-500" />
          <span className="hidden sm:inline">Level {level}</span>
          <Badge
            variant="secondary"
            className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
          >
            {unlockedCount}
          </Badge>
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-500" />
            Achievements
          </SheetTitle>
        </SheetHeader>

        {/* Level & Points Summary */}
        <div className="mt-6 p-4 rounded-lg bg-gradient-to-br from-primary/10 to-amber-500/10 border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <Star className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <p className="font-bold text-lg">Level {level}</p>
                <p className="text-sm text-muted-foreground">
                  {totalPoints} total points
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold">
                {unlockedCount}/{totalCount}
              </p>
              <p className="text-xs text-muted-foreground">Unlocked</p>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
              <span>Progress to Level {level + 1}</span>
              <span>{levelProgress.percentage}%</span>
            </div>
            <Progress value={levelProgress.percentage} className="h-2" />
          </div>
        </div>

        {/* Unlocked Achievements */}
        {unlockedAchievements.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Unlocked ({unlockedAchievements.length})
            </h3>
            <div className="space-y-3">
              {unlockedAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                />
              ))}
            </div>
          </div>
        )}

        {/* Locked Achievements */}
        {lockedAchievements.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <Lock className="w-3 h-3" />
              Locked ({lockedAchievements.length})
            </h3>
            <div className="space-y-3">
              {lockedAchievements.map((achievement) => (
                <AchievementCard
                  key={achievement.id}
                  achievement={achievement}
                />
              ))}
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
