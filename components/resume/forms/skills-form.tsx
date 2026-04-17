"use client";

import { Skill, ResumeData } from "@/lib/types/resume";
import { Industry, SeniorityLevel, SuggestedSkill } from "@/lib/ai/content-types";
import { Button } from "@/components/ui/button";
import { Plus, X, Sparkles, Loader2, EyeOff, Eye, ListPlus, CheckCircle2 } from "lucide-react";
import { useRef, useState, useMemo, useEffect } from "react";
import { CategoryCombobox } from "./category-combobox";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AiAction } from "@/components/ai/ai-action";
import { AiPreviewSheet } from "@/components/ai/ai-preview-sheet";
import { SkillsSuggestionInvite } from "@/components/ai/skills-suggestion-invite";
import {
  SkillSuggestionCard,
  isDemonstrable,
} from "@/components/ai/skill-suggestion-card";
import { SectionOrderSchematic } from "@/components/resume/section-order-schematic";
import { AiActionStatus } from "@/hooks/use-ai-action";
import { AiActionContract } from "@/lib/ai/action-contract";
import { authPost } from "@/lib/api/auth-fetch";
import { launchFlags } from "@/config/launch";
import { supportsSkillsAtTop } from "@/lib/constants/template-capabilities";
import { logger } from "@/lib/services/logger";
import { cn, getSkillCategoryOrder, reorderSkillCategories } from "@/lib/utils";
import { buildSkillsContext } from "@/lib/ai/skills-context";
import { SkillCategoryOrderer } from "./skill-category-orderer";

interface SkillsFormProps {
  skills: Skill[];
  onAdd: (skill: Omit<Skill, "id">) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Skill>) => void;
  /**
   * Bulk-replace the flat skills array. Used by the category orderer to
   * reshuffle skills so categories render in a new order (templates iterate
   * `Object.keys(groupSkillsByCategory(...))`, which preserves insertion order).
   */
  onSetSkills?: (skills: Skill[]) => void;
  jobTitle?: string;
  jobDescription?: string;
  industry?: Industry;
  seniorityLevel?: SeniorityLevel;
  /** Full resume — enables rich context (work history, projects, certs) for AI suggestions. */
  resume?: ResumeData;
  /**
   * Active template ID — used to determine whether this template supports
   * rendering Skills above Experience.
   */
  templateId?: string;
  /** Current section-order choice from TemplateCustomization. */
  sectionOrder?: "experience-first" | "skills-first";
  /** Setter from the editor; flips customization.sectionOrder. */
  onSectionOrderChange?: (order: "experience-first" | "skills-first") => void;
}

const skillsLogger = logger.child({ module: "SkillsForm" });
const SKILL_NAME_MAX_LENGTH = 100;
const INDUSTRY_SECTION_HIDE_THRESHOLD = 15;
const SUCCESS_AUTO_CLOSE_MS = 1500;

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
  showLevel,
  onClick,
  onToggleVisibility,
}: {
  level: Skill["level"];
  showLevel?: boolean;
  onClick: () => void;
  onToggleVisibility: () => void;
}) {
  const key = (level ?? "intermediate") as LevelKey;
  const meta = LEVEL_META[key] ?? LEVEL_META.intermediate;

  return (
    <div className="inline-flex items-center gap-1 shrink-0">
      <button
        type="button"
        onClick={onClick}
        title={`${meta.label} — click to change`}
        aria-label={`Proficiency: ${meta.label}. Click to cycle.`}
        className={cn(
          "inline-flex items-center justify-center gap-1.5 px-2 h-6 w-[108px]",
          "rounded-full border text-[11px] font-medium",
          "transition-colors cursor-pointer select-none",
          !showLevel ? "opacity-40" : "",
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
      <button
        type="button"
        onClick={onToggleVisibility}
        title={showLevel ? "Hide level from resume" : "Show level on resume"}
        aria-label={showLevel ? "Hide level from resume" : "Show level on resume"}
        aria-pressed={Boolean(showLevel)}
        className={cn(
          "p-1 rounded-md transition-colors",
          showLevel
            ? "text-muted-foreground/60 hover:text-foreground hover:bg-muted/50"
            : "text-muted-foreground/30 hover:text-muted-foreground/60 hover:bg-muted/50"
        )}
      >
        {showLevel ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
}

function SkillRow({
  skill,
  onUpdate,
  onRemove,
  existingCategories,
}: {
  skill: Skill;
  onUpdate: (id: string, updates: Partial<Skill>) => void;
  onRemove: (id: string) => void;
  existingCategories: string[];
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
        showLevel={skill.showLevel}
        onClick={() => onUpdate(skill.id, { level: cycleLevel(skill.level) })}
        onToggleVisibility={() => onUpdate(skill.id, { showLevel: !skill.showLevel })}
      />

      <CategoryCombobox
        value={skill.category ?? "Other"}
        onValueChange={(v) => onUpdate(skill.id, { category: v })}
        existingCategories={existingCategories}
      />

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
  output: "Skills cited from your work history, projects, and certifications",
  description:
    "Reads your work history and suggests skills you've actually demonstrated, plus common ones for your industry.",
};

export function SkillsForm({
  skills,
  onAdd,
  onRemove,
  onUpdate,
  onSetSkills,
  jobTitle,
  jobDescription,
  industry,
  seniorityLevel,
  resume,
  templateId,
  sectionOrder,
  onSectionOrderChange,
}: SkillsFormProps) {
  const layoutSupported = supportsSkillsAtTop(templateId);
  const currentOrder: "experience-first" | "skills-first" =
    sectionOrder ?? "experience-first";
  const showLayoutControl = typeof onSectionOrderChange === "function";
  const canUseAiSkillSuggestions = launchFlags.features.aiSuggestSkills;
  const [suggestions, setSuggestions] = useState<SuggestedSkill[]>([]);
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [suggestionStatus, setSuggestionStatus] = useState<AiActionStatus>("idle");
  const [suggestionSheetOpen, setSuggestionSheetOpen] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [newSkillName, setNewSkillName] = useState("");
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkCategory, setBulkCategory] = useState("Technical Skills");
  const [bulkInput, setBulkInput] = useState("");
  const lastAddedRef = useRef<string[]>([]);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const existingCategories = useMemo(
    () => [...new Set(skills.map((s) => s.category))],
    [skills]
  );

  const categoryOrder = useMemo(() => getSkillCategoryOrder(skills), [skills]);

  const categoryCounts = useMemo(() => {
    return skills.reduce<Record<string, number>>((acc, skill) => {
      const key = skill.category || "Other";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});
  }, [skills]);

  const canReorderCategories =
    typeof onSetSkills === "function" && categoryOrder.length >= 2;

  const { demonstrable, aspirational } = useMemo(() => {
    const d: SuggestedSkill[] = [];
    const a: SuggestedSkill[] = [];
    for (const s of suggestions) {
      if (isDemonstrable(s.source)) d.push(s);
      else a.push(s);
    }
    return { demonstrable: d, aspirational: a };
  }, [suggestions]);

  const hideIndustrySection = skills.length >= INDUSTRY_SECTION_HIDE_THRESHOLD;

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  const handleQuickAdd = () => {
    const trimmed = newSkillName.trim();
    if (!trimmed) return;
    onAdd({ name: trimmed, category: "Other", level: "intermediate" });
    setNewSkillName("");
    toast.success(`Added ${trimmed}`);
  };

  const bulkCount = bulkInput
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0).length;

  const handleBulkAdd = () => {
    const names = bulkInput
      .split(",")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && s.length <= SKILL_NAME_MAX_LENGTH);

    if (names.length === 0) return;

    const existingNames = new Set(skills.map((s) => s.name.toLowerCase()));
    const newNames = names.filter((n) => !existingNames.has(n.toLowerCase()));
    const skipped = names.length - newNames.length;

    newNames.forEach((name) => {
      onAdd({ name, category: bulkCategory, level: "intermediate" });
    });

    setBulkInput("");
    if (newNames.length === 0) {
      toast.info("All skills already exist");
    } else {
      const msg = `Added ${newNames.length} skill${newNames.length !== 1 ? "s" : ""}`;
      toast.success(
        skipped > 0
          ? `${msg} (${skipped} duplicate${skipped !== 1 ? "s" : ""} skipped)`
          : msg
      );
    }
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
    setSelectedNames(new Set());
    setSuccessCount(0);
    setSuggestionStatus("running");
    setSuggestionSheetOpen(true);

    try {
      // Build rich resume-derived context if the full resume is available.
      // Falls back to flat props otherwise (e.g. in tests).
      const context = resume
        ? buildSkillsContext(resume, { anonymizeCompanies: true })
        : {};

      const response = await authPost("/api/ai/suggest-skills", {
        jobTitle,
        ...(jobDescription?.trim() ? { jobDescription: jobDescription.trim() } : {}),
        industry,
        seniorityLevel,
        ...context,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get skill suggestions");
      }

      const data = await response.json();
      const raw: SuggestedSkill[] = Array.isArray(data.skills) ? data.skills : [];
      const existingNames = new Set(skills.map((s) => s.name.toLowerCase()));
      const filtered = raw.filter(
        (s) => !existingNames.has(s.name.toLowerCase())
      );

      // Pre-check demonstrable suggestions — user sees their safe wins selected.
      const preChecked = new Set(
        filtered.filter((s) => isDemonstrable(s.source)).map((s) => s.name)
      );

      setSuggestions(filtered);
      setSelectedNames(preChecked);
      setSuggestionStatus("ready");

      toast.success(
        data.meta?.fromCache
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

  const toggleSelection = (name: string) => {
    setSelectedNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const handleAddSelected = () => {
    const toAdd = suggestions.filter((s) => selectedNames.has(s.name));
    if (toAdd.length === 0) {
      toast.info("Select at least one skill to add");
      return;
    }

    toAdd.forEach((s) => {
      onAdd({
        name: s.name,
        category: s.category,
        level: s.relevance === "high" ? "advanced" : "intermediate",
      });
    });

    lastAddedRef.current = [
      ...lastAddedRef.current,
      ...toAdd.map((s) => s.name.toLowerCase()),
    ];
    setSuccessCount(toAdd.length);

    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setSuggestionSheetOpen(false);
    }, SUCCESS_AUTO_CLOSE_MS);
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
    setSuggestionStatus("ready");
    toast.info(`Removed ${removedCount} AI-suggested skill${removedCount > 1 ? "s" : ""}`);
  };

  const handleSheetOpenChange = (open: boolean) => {
    setSuggestionSheetOpen(open);
    if (!open) {
      // Reset transient UI state but keep lastAddedRef so Undo still works.
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
      setSuccessCount(0);
    }
  };

  const canTrySuggestions = Boolean(jobTitle && jobTitle.trim().length >= 2);
  const selectedCount = selectedNames.size;
  const showInvite = canUseAiSkillSuggestions && canTrySuggestions;

  return (
    <div className="space-y-5">
      {/* Section position (layout control) */}
      {showLayoutControl && (
        <LayoutPositionControl
          currentOrder={currentOrder}
          supported={layoutSupported}
          onChange={(order) => onSectionOrderChange?.(order)}
        />
      )}

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
            disabled={!canTrySuggestions}
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

      {/* Bulk add toggle + panel */}
      <div>
        <button
          type="button"
          onClick={() => setBulkOpen(!bulkOpen)}
          className={cn(
            "flex items-center gap-1.5 text-xs transition-colors",
            bulkOpen
              ? "text-primary font-medium"
              : "text-muted-foreground/60 hover:text-primary/80"
          )}
        >
          <ListPlus className="w-3.5 h-3.5" />
          Add multiple at once
        </button>

        {bulkOpen && (
          <div className="mt-2 rounded-xl border border-dashed border-primary/25 bg-primary/[0.02] p-3 space-y-2.5">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground/60 shrink-0 w-16">Category</span>
              <CategoryCombobox
                value={bulkCategory}
                onValueChange={setBulkCategory}
                existingCategories={existingCategories}
                triggerClassName="h-7 w-full max-w-[200px]"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground/60 shrink-0 w-16">Skills</span>
              <Input
                value={bulkInput}
                onChange={(e) => setBulkInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key !== "Enter") return;
                  e.preventDefault();
                  handleBulkAdd();
                }}
                placeholder="JavaScript, TypeScript, Python, Go..."
                className="h-7 text-sm flex-1"
                aria-label="Comma-separated skill names"
              />
              {bulkCount > 0 && (
                <Button
                  size="sm"
                  onClick={handleBulkAdd}
                  className="h-7 px-3 text-xs shrink-0"
                >
                  Add {bulkCount} skill{bulkCount !== 1 ? "s" : ""}
                </Button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* AI invite card (dismissible, warm) */}
      {showInvite && (
        <SkillsSuggestionInvite
          onAccept={handleGetSuggestions}
          disabled={isLoadingSuggestions}
        />
      )}

      {/* Category order (drag to reorder how categories appear on the resume) */}
      {canReorderCategories && (
        <SkillCategoryOrderer
          order={categoryOrder}
          counts={categoryCounts}
          onReorder={(nextOrder) =>
            onSetSkills?.(reorderSkillCategories(skills, nextOrder))
          }
        />
      )}

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
              existingCategories={existingCategories}
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
          onOpenChange={handleSheetOpenChange}
          title="Skills from your work history"
          description="Reviewed and cited — pick the ones to add."
          contract={SKILLS_CONTRACT}
          creditOperation="suggest-skills"
          status={suggestionStatus}
          onUndo={undoAppliedSuggestions}
          canUndo={lastAddedRef.current.length > 0}
          hideDefaultPreview
          footer={
            successCount > 0 ? null : suggestionStatus === "ready" &&
              suggestions.length > 0 ? (
              <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                <p className="text-xs text-muted-foreground">
                  {selectedCount} of {suggestions.length} selected
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSheetOpenChange(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddSelected}
                    disabled={selectedCount === 0}
                    className="gap-1.5"
                  >
                    <Plus className="h-4 w-4" />
                    Add {selectedCount || ""} selected skill
                    {selectedCount === 1 ? "" : "s"}
                  </Button>
                </div>
              </div>
            ) : null
          }
        >
          {suggestionStatus === "running" ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <p className="text-sm">
                Reading your work history and finding skills you&rsquo;ve demonstrated…
              </p>
            </div>
          ) : successCount > 0 ? (
            <SuccessMoment count={successCount} />
          ) : suggestionStatus === "ready" && suggestions.length > 0 ? (
            <SuggestionList
              demonstrable={demonstrable}
              aspirational={aspirational}
              selectedNames={selectedNames}
              onToggle={toggleSelection}
              hideAspirational={hideIndustrySection}
              jobTitle={jobTitle}
            />
          ) : suggestionStatus === "error" ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <p className="text-sm">
                Something went wrong. Try again in a moment.
              </p>
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

/**
 * Two-section layout: "From your experience" (pre-checked, demonstrable) and
 * "Common in your industry" (unchecked, aspirational). Second section is
 * hidden when the user already has 15+ skills to avoid bloat.
 */
function SuggestionList({
  demonstrable,
  aspirational,
  selectedNames,
  onToggle,
  hideAspirational,
  jobTitle,
}: {
  demonstrable: SuggestedSkill[];
  aspirational: SuggestedSkill[];
  selectedNames: Set<string>;
  onToggle: (name: string) => void;
  hideAspirational: boolean;
  jobTitle?: string;
}) {
  return (
    <div className="space-y-6">
      {jobTitle && (
        <p className="font-serif text-[15px] leading-snug text-foreground/80 tracking-tight">
          Reviewed your history as{" "}
          <span className="text-foreground italic">{jobTitle}</span>. Pick the
          skills worth adding.
        </p>
      )}
      {demonstrable.length > 0 && (
        <section className="space-y-2" aria-labelledby="demonstrable-heading">
          <header className="flex items-center justify-between gap-3">
            <h3
              id="demonstrable-heading"
              className="font-serif text-sm tracking-tight text-foreground"
            >
              From your experience
            </h3>
            <span className="text-[10px] uppercase tracking-wider text-amber-700/70 font-semibold">
              Cited &middot; pre-selected
            </span>
          </header>
          <p className="text-xs text-muted-foreground/70 -mt-1">
            Skills I found in your bullet points, projects, or certifications.
          </p>
          <div className="space-y-2">
            {demonstrable.map((s) => (
              <SkillSuggestionCard
                key={s.name}
                id={`skill-sug-${slug(s.name)}`}
                suggestion={s}
                checked={selectedNames.has(s.name)}
                onToggle={() => onToggle(s.name)}
              />
            ))}
          </div>
        </section>
      )}

      {!hideAspirational && aspirational.length > 0 && (
        <section className="space-y-2" aria-labelledby="aspirational-heading">
          <header className="flex items-center justify-between gap-3">
            <h3
              id="aspirational-heading"
              className="font-serif text-sm tracking-tight text-muted-foreground"
            >
              Common in your industry
            </h3>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground/50 font-semibold">
              Add only if genuine
            </span>
          </header>
          <p className="text-xs text-muted-foreground/60 -mt-1">
            Skills frequently paired with your role. Only check the ones you
            actually have — honesty beats coverage.
          </p>
          <div className="space-y-2">
            {aspirational.map((s) => (
              <SkillSuggestionCard
                key={s.name}
                id={`skill-sug-${slug(s.name)}`}
                suggestion={s}
                checked={selectedNames.has(s.name)}
                onToggle={() => onToggle(s.name)}
              />
            ))}
          </div>
        </section>
      )}

      {demonstrable.length === 0 &&
        (hideAspirational || aspirational.length === 0) && (
          <div className="py-6 text-center text-sm text-muted-foreground">
            Nothing new to suggest — your skills section already covers the
            ground.
          </div>
        )}
    </div>
  );
}

function SuccessMoment({ count }: { count: number }) {
  return (
    <div
      className="flex flex-col items-center justify-center py-12 text-center"
      role="status"
      aria-live="polite"
    >
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100/60 text-amber-700 mb-4">
        <CheckCircle2 className="h-6 w-6" />
      </span>
      <p className="font-serif text-lg tracking-tight text-foreground">
        {count} skill{count === 1 ? "" : "s"} added.
      </p>
      <p className="text-sm text-muted-foreground mt-1">
        Your skills section is now stronger.
      </p>
    </div>
  );
}

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/**
 * Compact segmented control for the SkillsForm — lets the user move the
 * Skills section above Experience in templates that support it. Mirrors the
 * richer Layout section in TemplateCustomizer; both bind to the same
 * TemplateCustomization.sectionOrder state.
 *
 * When the active template doesn't support reordering, the control degrades
 * to a "fixed in this template" pill + a link to the gallery filtered to
 * compatible templates.
 */
function LayoutPositionControl({
  currentOrder,
  supported,
  onChange,
}: {
  currentOrder: "experience-first" | "skills-first";
  supported: boolean;
  onChange: (order: "experience-first" | "skills-first") => void;
}) {
  if (!supported) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-3 py-2.5">
        <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground/70 font-semibold">
          Section position
        </p>
        <div className="mt-1 flex items-center gap-2">
          <SectionOrderSchematic order="experience-first" size="sm" muted />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-foreground/80">
              Fixed for this template
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground/70 font-semibold">
          Section position
        </p>
      </div>
      <div
        role="radiogroup"
        aria-label="Skills section position"
        className="grid grid-cols-2 gap-2"
      >
        <PositionOption
          order="experience-first"
          label="After Experience"
          hint="Default"
          selected={currentOrder === "experience-first"}
          onSelect={() => onChange("experience-first")}
        />
        <PositionOption
          order="skills-first"
          label="Before Experience"
          hint="Skills-first"
          selected={currentOrder === "skills-first"}
          onSelect={() => onChange("skills-first")}
        />
      </div>
    </div>
  );
}

function PositionOption({
  order,
  label,
  hint,
  selected,
  onSelect,
}: {
  order: "experience-first" | "skills-first";
  label: string;
  hint: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "group flex items-center gap-2 rounded-lg border px-2.5 py-2 text-left transition-all",
        selected
          ? "border-primary bg-primary/[0.04] ring-1 ring-primary/30"
          : "border-border/60 bg-background hover:border-primary/30 hover:bg-muted/30"
      )}
    >
      <SectionOrderSchematic
        order={order}
        size="sm"
        highlighted={selected}
      />
      <div className="min-w-0 flex-1">
        <p className={cn(
          "text-xs font-medium leading-tight",
          selected ? "text-foreground" : "text-foreground/80"
        )}>
          {label}
        </p>
        <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
          {hint}
        </p>
      </div>
    </button>
  );
}
