"use client";

import { Skill } from "@/lib/types/resume";
import { Industry, SeniorityLevel } from "@/lib/ai/content-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, X, Sparkles, Loader2, CheckCircle2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRef, useState, useEffect } from "react";
import { SKILL_CATEGORIES } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AiAction } from "@/components/ai/ai-action";
import { AiPreviewSheet } from "@/components/ai/ai-preview-sheet";
import { AiActionStatus } from "@/hooks/use-ai-action";
import { AiActionContract } from "@/lib/ai/action-contract";
import { authPost } from "@/lib/api/auth-fetch";
import { launchFlags } from "@/config/launch";
import { logger } from "@/lib/services/logger";
import { cn } from "@/lib/utils";

interface SkillsFormProps {
  skills: Skill[];
  onAdd: (skill: Omit<Skill, "id">) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Skill>) => void;
  jobTitle?: string;
  jobDescription?: string;
  industry?: Industry;
  seniorityLevel?: SeniorityLevel;
}

interface SkillSuggestion {
  name: string;
  category: string;
  relevance: "high" | "medium";
  reason: string;
}

const skillsLogger = logger.child({ module: "SkillsForm" });
const SKILL_NAME_MAX_LENGTH = 100;

const LEVEL_ORDER = ["beginner", "intermediate", "advanced", "expert"] as const;
type LevelKey = (typeof LEVEL_ORDER)[number];

const LEVEL_META: Record<LevelKey, { label: string; dots: number; cls: string }> = {
  beginner: {
    label: "Beginner",
    dots: 1,
    cls: "bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200",
  },
  intermediate: {
    label: "Intermediate",
    dots: 2,
    cls: "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100",
  },
  advanced: {
    label: "Advanced",
    dots: 3,
    cls: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100",
  },
  expert: {
    label: "Expert",
    dots: 4,
    cls: "bg-primary/10 text-primary border-primary/30 hover:bg-primary/20",
  },
};

function cycleLevel(current: Skill["level"]): Skill["level"] {
  const idx = LEVEL_ORDER.indexOf((current ?? "intermediate") as LevelKey);
  return LEVEL_ORDER[(idx + 1) % LEVEL_ORDER.length];
}

function LevelBadge({
  level,
  onClick,
}: {
  level: Skill["level"];
  onClick: () => void;
}) {
  const key = (level ?? "intermediate") as LevelKey;
  const meta = LEVEL_META[key] ?? LEVEL_META.intermediate;

  return (
    <button
      type="button"
      onClick={onClick}
      title={`${meta.label} — click to change`}
      aria-label={`Proficiency: ${meta.label}. Click to cycle.`}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 px-2 h-6 w-[108px] shrink-0",
        "rounded-full border text-[11px] font-medium",
        "transition-colors cursor-pointer select-none",
        meta.cls
      )}
    >
      <span className="flex items-center gap-[3px]" aria-hidden="true">
        {[1, 2, 3, 4].map((d) => (
          <span
            key={d}
            className={cn(
              "w-[4px] h-[4px] rounded-full",
              d <= meta.dots ? "bg-current" : "bg-current opacity-20"
            )}
          />
        ))}
      </span>
      <span>{meta.label}</span>
    </button>
  );
}

function SkillRow({
  skill,
  onUpdate,
  onRemove,
}: {
  skill: Skill;
  onUpdate: (id: string, updates: Partial<Skill>) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="group flex items-center gap-2 py-2 border-b border-border/40 last:border-0 -mx-1 px-1 rounded-md hover:bg-muted/20 transition-colors">
      <Input
        value={skill.name}
        onChange={(e) => onUpdate(skill.id, { name: e.target.value })}
        placeholder="Skill name"
        maxLength={SKILL_NAME_MAX_LENGTH}
        className={cn(
          "h-7 border-0 bg-transparent px-0 py-0 text-sm font-medium",
          "focus-visible:ring-0 placeholder:text-muted-foreground/40",
          "flex-1 min-w-0"
        )}
      />

      <LevelBadge
        level={skill.level}
        onClick={() => onUpdate(skill.id, { level: cycleLevel(skill.level) })}
      />

      <Select
        value={skill.category ?? "Other"}
        onValueChange={(v) => onUpdate(skill.id, { category: v })}
      >
        <SelectTrigger
          className={cn(
            "h-6 w-[130px] shrink-0 border border-border/40 bg-transparent",
            "text-xs text-muted-foreground focus:ring-0 hover:bg-muted/50 transition-colors",
            "px-2"
          )}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SKILL_CATEGORIES.map((cat) => (
            <SelectItem key={cat} value={cat} className="text-xs">
              {cat}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <button
        type="button"
        onClick={() => onRemove(skill.id)}
        aria-label={`Remove ${skill.name || "skill"}`}
        className={cn(
          "shrink-0 p-1 rounded-md",
          "text-transparent group-hover:text-muted-foreground/50",
          "hover:bg-destructive/10 hover:!text-destructive",
          "transition-colors"
        )}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

const SKILLS_CONTRACT: AiActionContract = {
  inputs: ["resume", "section", "userPreferences", "jobDescription"],
  output: "List of relevant skills by category",
  description: "Uses your job title to suggest missing, high-impact skills.",
};

export function SkillsForm({
  skills,
  onAdd,
  onRemove,
  onUpdate,
  jobTitle,
  jobDescription,
  industry,
  seniorityLevel,
}: SkillsFormProps) {
  const canUseAiSkillSuggestions = launchFlags.features.aiSuggestSkills;
  const [suggestions, setSuggestions] = useState<SkillSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [addedSuggestions, setAddedSuggestions] = useState<Set<string>>(new Set());
  const [suggestionStatus, setSuggestionStatus] = useState<AiActionStatus>("idle");
  const [suggestionSheetOpen, setSuggestionSheetOpen] = useState(false);
  const [newSkillName, setNewSkillName] = useState("");
  const lastAddedRef = useRef<string[]>([]);
  const autoFetchedForJobTitle = useRef<string | null>(null);

  useEffect(() => {
    const shouldAutoFetch =
      canUseAiSkillSuggestions &&
      jobTitle &&
      jobTitle.trim().length >= 2 &&
      skills.length === 0 &&
      autoFetchedForJobTitle.current !== jobTitle &&
      suggestionStatus === "idle";

    if (shouldAutoFetch) {
      autoFetchedForJobTitle.current = jobTitle;
      const timer = setTimeout(() => {
        handleGetSuggestions();
      }, 500);
      return () => clearTimeout(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canUseAiSkillSuggestions, jobTitle, skills.length, suggestionStatus]);

  const handleQuickAdd = () => {
    const trimmed = newSkillName.trim();
    if (!trimmed) return;
    onAdd({ name: trimmed, category: "Other", level: "intermediate" });
    setNewSkillName("");
    toast.success(`Added ${trimmed}`);
  };

  const handleGetSuggestions = async () => {
    if (!canUseAiSkillSuggestions) {
      toast.info("AI skill suggestions are not available in this release yet.");
      return;
    }
    if (!jobTitle || jobTitle.trim().length < 2) {
      toast.error("Please enter a job title in Personal Info first");
      return;
    }

    setIsLoadingSuggestions(true);
    setSuggestions([]);
    setSuggestionStatus("running");
    setSuggestionSheetOpen(true);

    try {
      const response = await authPost("/api/ai/suggest-skills", {
        jobTitle,
        ...(jobDescription?.trim() ? { jobDescription: jobDescription.trim() } : {}),
        industry,
        seniorityLevel,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get skill suggestions");
      }

      const data = await response.json();
      const skillSuggestions: SkillSuggestion[] = data.skills;
      const existingNames = new Set(skills.map((s) => s.name.toLowerCase()));
      const filtered = skillSuggestions.filter(
        (s) => !existingNames.has(s.name.toLowerCase())
      );

      setSuggestions(filtered);
      setSuggestionStatus("ready");

      toast.success(
        data.meta.fromCache
          ? `Got ${filtered.length} suggestions instantly ⚡`
          : `Found ${filtered.length} relevant skill suggestions ✨`
      );
    } catch (error) {
      skillsLogger.error("Failed to get skill suggestions", error, {
        jobTitle,
        hasJobDescription: Boolean(jobDescription?.trim()),
        industry,
        seniorityLevel,
      });
      setSuggestionStatus("error");
      toast.error(
        error instanceof Error ? error.message : "Failed to get suggestions. Please try again."
      );
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleAddSuggestion = (suggestion: SkillSuggestion) => {
    onAdd({
      name: suggestion.name,
      category: suggestion.category,
      level: suggestion.relevance === "high" ? "advanced" : "intermediate",
    });
    setAddedSuggestions((prev) => new Set(prev).add(suggestion.name));
    lastAddedRef.current = [...lastAddedRef.current, suggestion.name.toLowerCase()];
    toast.success(`Added ${suggestion.name}`);
  };

  const undoAppliedSuggestions = () => {
    if (!lastAddedRef.current.length) {
      toast.info("Nothing to undo yet");
      return;
    }
    const removeSet = new Set(lastAddedRef.current);
    const removedCount = lastAddedRef.current.length;
    skills.forEach((skill) => {
      if (removeSet.has(skill.name.toLowerCase())) onRemove(skill.id);
    });
    lastAddedRef.current = [];
    setAddedSuggestions(new Set());
    setSuggestionStatus("ready");
    toast.info(`Removed ${removedCount} AI-suggested skill${removedCount > 1 ? "s" : ""}`);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {skills.length === 0
            ? "No skills added yet"
            : `${skills.length} skill${skills.length !== 1 ? "s" : ""}`}
        </p>
        {canUseAiSkillSuggestions && (
          <AiAction
            label="Suggest"
            status={suggestionStatus}
            creditOperation="suggest-skills"
            onClick={handleGetSuggestions}
            contract={SKILLS_CONTRACT}
            disabled={!jobTitle || jobTitle.trim().length < 2}
          />
        )}
      </div>

      {/* Add input */}
      <div className="flex items-center gap-2 rounded-xl border border-dashed border-primary/25 bg-primary/[0.02] px-3 py-2">
        <Plus className="w-4 h-4 text-primary/50 shrink-0" />
        <Input
          value={newSkillName}
          onChange={(e) => setNewSkillName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key !== "Enter") return;
            e.preventDefault();
            handleQuickAdd();
          }}
          placeholder="Type a skill and press Enter..."
          maxLength={SKILL_NAME_MAX_LENGTH}
          className="h-8 border-0 bg-transparent px-0 text-sm focus-visible:ring-0 placeholder:text-muted-foreground/50 flex-1"
          aria-label="Add skill"
        />
        {newSkillName.trim() && (
          <Button size="sm" onClick={handleQuickAdd} className="h-7 px-3 text-xs shrink-0">
            Add
          </Button>
        )}
      </div>

      {/* Skills table */}
      {skills.length > 0 ? (
        <div>
          {/* Column headers */}
          <div className="flex items-center gap-2 pb-1.5 mb-0.5 border-b border-border/30">
            <span className="flex-1 text-[10px] uppercase tracking-wider text-muted-foreground/40 font-semibold">
              Skill
            </span>
            <span className="w-[108px] text-[10px] uppercase tracking-wider text-muted-foreground/40 font-semibold text-center shrink-0">
              Level
            </span>
            <span className="w-[130px] text-[10px] uppercase tracking-wider text-muted-foreground/40 font-semibold text-center shrink-0">
              Category
            </span>
            <span className="w-6 shrink-0" />
          </div>

          {skills.map((skill) => (
            <SkillRow
              key={skill.id}
              skill={skill}
              onUpdate={onUpdate}
              onRemove={onRemove}
            />
          ))}
        </div>
      ) : (
        <p className="text-sm text-center text-muted-foreground/40 py-6">
          Add your first skill above to get started
        </p>
      )}

      {/* Tip */}
      {skills.length > 0 && (
        <p className="text-xs text-muted-foreground/50 flex items-center gap-1.5 pt-1">
          <Sparkles className="w-3.5 h-3.5 shrink-0" />
          Click the level badge to cycle: Beginner → Intermediate → Advanced → Expert
        </p>
      )}

      {/* AI Suggestions sheet */}
      {canUseAiSkillSuggestions && (
        <AiPreviewSheet
          open={suggestionSheetOpen}
          onOpenChange={setSuggestionSheetOpen}
          title="AI Skill Suggestions"
          description="Click + to add skills to your resume."
          contract={SKILLS_CONTRACT}
          creditOperation="suggest-skills"
          status={suggestionStatus}
          onUndo={undoAppliedSuggestions}
          canUndo={lastAddedRef.current.length > 0}
        >
          {suggestionStatus === "running" ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm">Analyzing your profile and finding relevant skills...</p>
            </div>
          ) : suggestions.length > 0 ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                {suggestions.filter((s) => !addedSuggestions.has(s.name)).length} skills suggested
                for <span className="font-medium">{jobTitle}</span>
              </p>
              <div className="grid grid-cols-1 gap-3">
                {suggestions.map((suggestion, index) => {
                  const isAdded = addedSuggestions.has(suggestion.name);
                  return (
                    <div
                      key={index}
                      className={cn(
                        "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                        isAdded
                          ? "bg-emerald-50 border-emerald-200"
                          : "bg-background hover:bg-muted/50"
                      )}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{suggestion.name}</span>
                          <Badge
                            variant={suggestion.relevance === "high" ? "default" : "secondary"}
                            className="text-xs"
                          >
                            {suggestion.relevance}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {suggestion.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                      </div>
                      <Button
                        size="sm"
                        variant={isAdded ? "ghost" : "default"}
                        onClick={() => handleAddSuggestion(suggestion)}
                        disabled={isAdded}
                        className="shrink-0"
                      >
                        {isAdded ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-1.5" />
                            Added
                          </>
                        ) : (
                          <>
                            <Plus className="w-4 h-4 mr-1.5" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Sparkles className="h-8 w-8 mb-4" />
              <p className="text-sm">No suggestions available yet.</p>
            </div>
          )}
        </AiPreviewSheet>
      )}
    </div>
  );
}
