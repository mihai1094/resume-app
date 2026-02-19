"use client";

import { useEffect, useState } from "react";
import { WorkExperience } from "@/lib/types/resume";
import { Industry, SeniorityLevel } from "@/lib/ai/content-types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, Briefcase, ChevronDown, X } from "lucide-react";
import { useFormArray } from "@/hooks/use-form-array";
import { useArrayFieldValidation } from "@/hooks/use-array-field-validation";
import { FormField, FormDatePicker, FormCheckbox, LocationField } from "@/components/forms";
import { cn } from "@/lib/utils";
import { WritingTips } from "../writing-tips";
import { useBulletTips } from "@/hooks/use-bullet-tips";
import { SortableList, DragHandle } from "@/components/ui/sortable-list";
import { EXAMPLE_RESUME_DATA } from "@/lib/constants/example-data";
import { ValidationError } from "@/lib/validation/resume-validation";
import { EmptyState } from "@/components/ui/empty-state";
import { ConfirmationDialog } from "@/components/shared/confirmation-dialog";
import { toast } from "sonner";
import { AiAction } from "@/components/ai/ai-action";
import { AiPreviewSheet } from "@/components/ai/ai-preview-sheet";
import { AiActionContract } from "@/lib/ai/action-contract";
import { useAiAction } from "@/hooks/use-ai-action";
import { authPost } from "@/lib/api/auth-fetch";
import { useGhostSuggestion } from "@/hooks/use-ghost-suggestion";
import { GhostSuggestion } from "./ghost-suggestion";

interface WorkExperienceFormProps {
  experiences: WorkExperience[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<WorkExperience>) => void;
  onRemove: (id: string) => void;
  onReorder: (items: WorkExperience[]) => void;
  validationErrors?: ValidationError[];
  showErrors?: boolean;
  industry?: Industry;
  seniorityLevel?: SeniorityLevel;
  jobDescription?: string;
}

interface BulletItemProps {
  bullet: string;
  bulletIndex: number;
  expId: string;
  position?: string;
  company?: string;
  focusedBullet: { expId: string; bulletIndex: number } | null;
  onFocus: () => void;
  onBlur: () => void;
  onChange: (value: string) => void;
  onRemove: () => void;
  placeholder: string;
  /** Enable ghost suggestions */
  enableGhostSuggestions?: boolean;
  industry?: Industry;
  seniorityLevel?: SeniorityLevel;
  jobDescription?: string;
}

function isEndDateBeforeStartDate(startDate?: string, endDate?: string): boolean {
  if (!startDate || !endDate) return false;
  return new Date(startDate) > new Date(endDate);
}

function hasMetrics(text: string): boolean {
  return /\b\d[\d,.]*\s*(%|k|M|B|x|\+|days?|hours?|weeks?|months?)|[$€£]\s*\d|\d+\s*(percent|people|users|clients|projects)/i.test(
    text
  );
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function BulletItem({
  bullet,
  bulletIndex,
  expId,
  position,
  company,
  focusedBullet,
  onFocus,
  onBlur,
  onChange,
  onRemove,
  placeholder,
  enableGhostSuggestions = true,
  industry,
  seniorityLevel,
  jobDescription,
}: BulletItemProps) {
  const tips = useBulletTips(bullet);
  const isFocused =
    focusedBullet?.expId === expId &&
    focusedBullet?.bulletIndex === bulletIndex;

  // Ghost suggestions - only when focused and enabled
  const ghost = useGhostSuggestion({
    text: bullet,
    enabled: enableGhostSuggestions && isFocused && bullet.trim().length >= 15,
    context: {
      position,
      company,
      sectionType: "bullet",
    },
    jobDescription,
    debounceMs: 2500,
  });

  const [improveSheetOpen, setImproveSheetOpen] = useState(false);
  const [quantifySheetOpen, setQuantifySheetOpen] = useState(false);

  type ImproveSuggestion = { type: string; note: string };
  type QuantifySuggestion = { id: string; approach: string; example: string; reasoning: string };

  const [improveSuggestions, setImproveSuggestions] = useState<ImproveSuggestion[]>([]);
  const [quantifySuggestions, setQuantifySuggestions] = useState<QuantifySuggestion[]>([]);

  const wc = wordCount(bullet);
  const alreadyHasMetrics = hasMetrics(bullet);

  const improveDisabledReason =
    wc < 5 ? "Add at least 5 words to improve this bullet" : undefined;

  const quantifyDisabledReason = alreadyHasMetrics
    ? "This bullet already has metrics — nice work!"
    : wc < 6
      ? "Add more detail before quantifying"
      : undefined;

  const improveAction = useAiAction<string>({
    surface: "work-experience",
    actionName: "improve-bullet",
    perform: async () => {
      const response = await authPost("/api/ai/improve-bullet", {
        bulletPoint: bullet,
        role: position,
        industry,
        seniorityLevel,
        jobDescription,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to improve bullet");
      }
      const data = await response.json();
      setImproveSuggestions(data.result?.suggestions || []);
      return data.result?.improvedVersion || bullet;
    },
    onApply: (value) => onChange(value),
  });

  const quantifyAction = useAiAction<string>({
    surface: "work-experience",
    actionName: "quantify-bullet",
    perform: async () => {
      const response = await authPost("/api/ai/quantify-achievement", {
        statement: bullet,
        industry,
        seniorityLevel,
        jobDescription,
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to quantify achievement");
      }
      const data = await response.json();
      const allSuggestions: QuantifySuggestion[] = data.suggestions || [];
      setQuantifySuggestions(allSuggestions);
      return allSuggestions[0]?.example || bullet;
    },
    onApply: (value) => onChange(value),
  });

  const improveContract: AiActionContract = {
    inputs: ["section", "custom", "jobDescription"],
    output: "Rewritten bullet with stronger verb and clearer outcome",
    description:
      "Rewrites your bullet using action verbs and result-focused language — without inventing data.",
  };

  const quantifyContract: AiActionContract = {
    inputs: ["section", "custom", "jobDescription"],
    output: "2–3 versions with realistic metric ranges to choose from",
    description:
      "Adds believable metrics based on your role and industry — you replace ranges with your real numbers.",
  };

  return (
    <div className="group/bullet relative">
      <div className="flex items-start gap-3">
        <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
        <div className="flex-1 w-full min-w-0">
          <Textarea
            value={bullet}
            onChange={(e) => onChange(e.target.value)}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={placeholder}
            rows={2}
            className="w-full resize-none bg-muted/20 focus:bg-background transition-colors"
          />
          {isFocused && tips.length > 0 && (
            <div className="absolute left-0 top-full mt-2 z-10">
              <WritingTips
                tips={tips}
                onInsertSuggestion={(suggestion) => {
                  onChange(bullet ? `${bullet} ${suggestion}` : suggestion);
                }}
              />
            </div>
          )}
          {/* Ghost suggestion - shows AI improvement after pause */}
          {isFocused && (ghost.isLoading || ghost.isVisible) && (
            <GhostSuggestion
              suggestion={ghost.suggestion}
              isLoading={ghost.isLoading}
              isVisible={ghost.isVisible}
              onAccept={() => {
                const accepted = ghost.accept();
                if (accepted) {
                  onChange(accepted);
                  toast.success("Suggestion applied");
                }
              }}
              onDismiss={ghost.dismiss}
            />
          )}
        </div>
      </div>
      <div className="flex gap-1 items-center justify-end mt-2 ml-4 sm:ml-0">
        <AiAction
          label="Improve"
          status={improveAction.status}
          onClick={() => {
            setImproveSheetOpen(true);
            improveAction.run();
          }}
          contract={improveContract}
          disabled={!!improveDisabledReason}
          disabledReason={improveDisabledReason}
          className="h-8"
        />
        <AiAction
          label="Quantify"
          status={quantifyAction.status}
          onClick={() => {
            setQuantifySheetOpen(true);
            quantifyAction.run();
          }}
          contract={quantifyContract}
          disabled={!!quantifyDisabledReason}
          disabledReason={quantifyDisabledReason}
          className="h-8"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="opacity-0 group-hover/bullet:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <AiPreviewSheet
        open={improveSheetOpen}
        onOpenChange={setImproveSheetOpen}
        title="Improve bullet"
        description="Review the suggested rewrite before applying."
        contract={improveContract}
        status={improveAction.status}
        suggestion={improveAction.suggestion || ""}
        previousText={bullet}
        onApply={() => improveAction.apply(bullet)}
        onUndo={improveAction.undo}
        canUndo={improveAction.canUndo}
      >
        {improveSuggestions.length > 0 && (
          <div className="mt-3 space-y-1.5">
            <p className="text-xs text-muted-foreground">What changed:</p>
            <ul className="space-y-1.5">
              {improveSuggestions.map((s, i) => (
                <li key={i} className="flex gap-2 items-start text-xs">
                  <Badge variant="outline" className="shrink-0 text-[10px] mt-0.5">
                    {s.type}
                  </Badge>
                  <span className="text-muted-foreground">{s.note}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </AiPreviewSheet>

      <AiPreviewSheet
        open={quantifySheetOpen}
        onOpenChange={setQuantifySheetOpen}
        title="Quantify bullet"
        description="Add metrics to your achievement."
        contract={quantifyContract}
        status={quantifyAction.status}
        suggestion={quantifyAction.suggestion || ""}
        previousText={bullet}
        onApply={() => quantifyAction.apply(bullet)}
        onUndo={quantifyAction.undo}
        canUndo={quantifyAction.canUndo}
      >
        {quantifySuggestions.length > 1 && (
          <div className="mt-3 space-y-2">
            <p className="text-xs text-muted-foreground">Pick the approach that fits:</p>
            {quantifySuggestions.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => quantifyAction.setSuggestion(s.example)}
                className={cn(
                  "w-full text-left p-3 rounded-lg border text-sm transition-colors",
                  quantifyAction.suggestion === s.example
                    ? "border-primary bg-primary/5"
                    : "hover:border-muted-foreground/50"
                )}
              >
                <span className="font-medium text-xs text-primary">{s.approach}</span>
                <p className="mt-1 text-foreground">{s.example}</p>
                {s.reasoning && (
                  <p className="text-xs text-muted-foreground mt-1">{s.reasoning}</p>
                )}
              </button>
            ))}
            <p className="text-[11px] text-muted-foreground/70 pt-1">
              Replace the ranges with your actual numbers before applying.
            </p>
          </div>
        )}
      </AiPreviewSheet>
    </div>
  );
}

export function WorkExperienceForm({
  experiences,
  onAdd,
  onUpdate,
  onRemove,
  onReorder,
  validationErrors = [],
  showErrors = false,
  industry,
  seniorityLevel,
  jobDescription,
}: WorkExperienceFormProps) {
  const [focusedBullet, setFocusedBullet] = useState<{
    expId: string;
    bulletIndex: number;
  } | null>(null);

  const isItemComplete = (exp: WorkExperience): boolean => {
    return !!(exp.company && exp.position && exp.startDate);
  };

  const {
    items,
    isExpanded,
    handleAdd,
    handleUpdate,
    handleRemove,
    handleToggle,
    confirmationState,
    closeConfirmation,
    handleConfirm,
  } = useFormArray({
    items: experiences,
    onAdd,
    onUpdate,
    onRemove,
    isItemComplete,
    autoExpandIncomplete: true,
  });

  // Use centralized validation hook - no inline validation needed
  const { getFieldError, markFieldTouched, markErrors } =
    useArrayFieldValidation(validationErrors, "experience");

  useEffect(() => {
    if (showErrors && validationErrors.length > 0) {
      markErrors(validationErrors);
    }
    // Only re-run when showErrors changes, not when validationErrors changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showErrors, markErrors]);

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div />
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="Share your professional journey"
            description="Highlight your career achievements and the impact you've made."
            actionLabel="Add Position"
            onAction={handleAdd}
          />
        ) : (
          <SortableList
            items={items}
            onReorder={onReorder}
            keyExtractor={(item) => item.id}
            renderItem={(exp, index, isDragging) => {
              const isExpandedItem = isExpanded(exp.id);
              const isComplete = isItemComplete(exp);
              const dateError = getFieldError(index, "dates");

              return (
                <div
                  className={cn(
                    "group border rounded-lg bg-card transition-all duration-200",
                    isExpandedItem
                      ? "ring-2 ring-primary/20 shadow-lg"
                      : "hover:border-primary/50",
                    isDragging &&
                    "shadow-xl ring-2 ring-primary/20 rotate-1 z-50"
                  )}
                >
                  <div
                    className="flex items-center gap-4 p-4 cursor-pointer"
                    onClick={() => handleToggle(exp.id)}
                  >
                    <DragHandle className="shrink-0" />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4
                          className={cn(
                            "font-medium truncate",
                            !exp.position && "text-muted-foreground italic"
                          )}
                        >
                          {exp.position || "(No Position)"}
                        </h4>
                        {isComplete && (
                          <Badge
                            variant="secondary"
                            className="h-5 px-1.5 text-[10px] bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20"
                          >
                            Complete
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        {exp.company || "(No Company)"}
                        {exp.startDate &&
                          ` • ${exp.startDate} - ${exp.current ? "Present" : exp.endDate || "Present"
                          }`}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(exp.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <div
                        className={cn(
                          "transition-transform duration-200",
                          isExpandedItem && "rotate-180"
                        )}
                      >
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </div>
                  </div>

                  {isExpandedItem && (
                    <div className="px-6 pb-6 pt-2 space-y-6 animate-in slide-in-from-top-2 duration-200 border-t">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          label="Position Title"
                          value={exp.position}
                          onChange={(val) =>
                            handleUpdate(exp.id, { position: val })
                          }
                          onBlur={() => markFieldTouched(index, "position")}
                          placeholder={
                            EXAMPLE_RESUME_DATA.workExperience.position
                          }
                          required
                          error={getFieldError(index, "position")}
                        />
                        <FormField
                          label="Company Name"
                          value={exp.company}
                          onChange={(val) =>
                            handleUpdate(exp.id, { company: val })
                          }
                          onBlur={() => markFieldTouched(index, "company")}
                          placeholder={
                            EXAMPLE_RESUME_DATA.workExperience.company
                          }
                          required
                          error={getFieldError(index, "company")}
                        />
                      </div>

                      <LocationField
                        label="Location"
                        value={exp.location}
                        onChange={(val) =>
                          handleUpdate(exp.id, { location: val })
                        }
                        onBlur={() => markFieldTouched(index, "location")}
                        placeholder={
                          EXAMPLE_RESUME_DATA.workExperience.location
                        }
                        error={getFieldError(index, "location")}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormDatePicker
                          label="Start Date"
                          value={exp.startDate}
                          onChange={(val) => {
                            if (
                              exp.endDate &&
                              !exp.current &&
                              isEndDateBeforeStartDate(val, exp.endDate)
                            ) {
                              handleUpdate(exp.id, { startDate: val, endDate: "" });
                              toast.error("End date was cleared because it cannot be earlier than start date");
                            } else {
                              handleUpdate(exp.id, { startDate: val });
                            }
                            markFieldTouched(index, "dates");
                          }}
                          required
                          error={dateError}
                          defaultYear={new Date().getFullYear() - 2}
                        />
                        <div className="space-y-2">
                          <FormDatePicker
                            label="End Date"
                            value={exp.endDate}
                            onChange={(val) => {
                              if (isEndDateBeforeStartDate(exp.startDate, val)) {
                                markFieldTouched(index, "dates");
                                toast.error("End date cannot be earlier than start date");
                                return;
                              }
                              handleUpdate(exp.id, { endDate: val });
                              markFieldTouched(index, "dates");
                            }}
                            disabled={exp.current}
                            error={dateError}
                          />
                          <FormCheckbox
                            label="I currently work here"
                            checked={exp.current}
                            onCheckedChange={(checked) =>
                              handleUpdate(exp.id, {
                                current: checked as boolean,
                                endDate: checked ? "" : exp.endDate,
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">
                            Description
                          </label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleUpdate(exp.id, {
                                description: [...exp.description, ""],
                              })
                            }
                            className="h-8 text-xs"
                          >
                            <Plus className="w-3 h-3 mr-1" />
                            Add Bullet
                          </Button>
                        </div>

                        <div className="space-y-3 pl-2">
                          {exp.description.map((bullet, bulletIndex) => (
                            <BulletItem
                              key={bulletIndex}
                              bullet={bullet}
                              bulletIndex={bulletIndex}
                              expId={exp.id}
                              position={exp.position}
                              company={exp.company}
                              focusedBullet={focusedBullet}
                              onFocus={() =>
                                setFocusedBullet({ expId: exp.id, bulletIndex })
                              }
                              onBlur={() => setFocusedBullet(null)}
                              onChange={(value) => {
                                const newDesc = [...exp.description];
                                newDesc[bulletIndex] = value;
                                handleUpdate(exp.id, { description: newDesc });
                              }}
                              onRemove={() => {
                                const newDesc = exp.description.filter(
                                  (_, i) => i !== bulletIndex
                                );
                                handleUpdate(exp.id, { description: newDesc });
                              }}
                              placeholder={
                                EXAMPLE_RESUME_DATA.workExperience.description[
                                bulletIndex %
                                EXAMPLE_RESUME_DATA.workExperience
                                  .description.length
                                ]
                              }
                              industry={industry}
                              seniorityLevel={seniorityLevel}
                              jobDescription={jobDescription}
                            />
                          ))}
                        </div>
                        {getFieldError(index, "description") && (
                          <p className="text-xs text-destructive">
                            {getFieldError(index, "description")}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            }}
          />
        )}

        <Button
          onClick={handleAdd}
          variant="outline"
          className="w-full py-6 border-dashed hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Another Position
          {confirmationState && (
            <ConfirmationDialog
              open={confirmationState.isOpen}
              title={confirmationState.title}
              description={confirmationState.description}
              onConfirm={handleConfirm}
              onCancel={closeConfirmation}
              isDangerous={confirmationState.isDangerous}
            />
          )}
        </Button>
      </div>

      {confirmationState && (
        <ConfirmationDialog
          open={confirmationState.isOpen}
          title={confirmationState.title}
          description={confirmationState.description}
          onConfirm={handleConfirm}
          onCancel={closeConfirmation}
          isDangerous={confirmationState.isDangerous}
        />
      )}
    </div>
  );
}
