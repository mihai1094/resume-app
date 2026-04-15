"use client";

import { useEffect, useState } from "react";
import { ResumeData } from "@/lib/types/resume";
import { SortableList, DragHandle } from "@/components/ui/sortable-list";
import { EXAMPLE_RESUME_DATA } from "@/lib/constants/example-data";
import { useFormArray } from "@/hooks/use-form-array";
import { useArrayFieldValidation } from "@/hooks/use-array-field-validation";
import { EmptyState } from "@/components/ui/empty-state";
import { SECTION_GUIDANCE } from "@/lib/constants/section-guidance";
import { ValidationError } from "@/lib/validation/resume-validation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { FormField, FormDatePicker, FormCheckbox, LocationField, RichTextEditor } from "@/components/forms";
import { cn } from "@/lib/utils";
import { detectGibberish } from "@/lib/utils/gibberish";
import { WritingTips } from "../writing-tips";
import { useBulletTips } from "@/hooks/use-bullet-tips";
import { AiAction } from "@/components/ai/ai-action";
import { AiPreviewSheet } from "@/components/ai/ai-preview-sheet";
import { AiActionContract } from "@/lib/ai/action-contract";
import { useAiAction } from "@/hooks/use-ai-action";
import { authPost } from "@/lib/api/auth-fetch";
import { useGhostSuggestion } from "@/hooks/use-ghost-suggestion";
import { GhostSuggestion } from "./ghost-suggestion";
import { toast } from "sonner";
import {
  GraduationCap,
  School,
  Award,
  Calendar,
  Plus,
  Trash2,
  ChevronDown,
  X,
} from "lucide-react";

interface EducationFormProps {
  education: ResumeData["education"];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<ResumeData["education"][0]>) => void;
  onRemove: (id: string) => void;
  onReorder: (items: ResumeData["education"]) => void;
  validationErrors?: ValidationError[];
  showErrors?: boolean;
}

interface BulletItemProps {
  bullet: string;
  bulletIndex: number;
  eduId: string;
  institution?: string;
  degree?: string;
  focusedBullet: { eduId: string; bulletIndex: number } | null;
  onFocus: () => void;
  onBlur: () => void;
  onChange: (value: string) => void;
  onRemove: () => void;
  placeholder: string;
}

function BulletItem({
  bullet,
  bulletIndex,
  eduId,
  institution,
  degree,
  focusedBullet,
  onFocus,
  onBlur,
  onChange,
  onRemove,
  placeholder,
}: BulletItemProps) {
  const tips = useBulletTips(bullet);
  const isFocused =
    focusedBullet?.eduId === eduId &&
    focusedBullet?.bulletIndex === bulletIndex;

  const ghost = useGhostSuggestion({
    text: bullet,
    enabled: isFocused && bullet.trim().length >= 15,
    context: {
      position: degree,
      company: institution,
      sectionType: "bullet",
    },
    debounceMs: 2500,
  });

  const [improveSheetOpen, setImproveSheetOpen] = useState(false);

  type ImproveSuggestion = { type: string; note: string };
  const [improveSuggestions, setImproveSuggestions] = useState<ImproveSuggestion[]>([]);

  const gibberishError = detectGibberish(bullet);
  const wordCount = bullet.trim().split(/\s+/).filter(Boolean).length;

  const improveDisabledReason =
    wordCount < 5 ? "Add at least 5 words to improve this bullet"
    : gibberishError ? gibberishError
    : undefined;

  const improveAction = useAiAction<string>({
    surface: "education",
    actionName: "improve-bullet",
    perform: async () => {
      const response = await authPost("/api/ai/improve-bullet", {
        bulletPoint: bullet,
        role: degree,
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

  const improveContract: AiActionContract = {
    inputs: ["section", "custom"],
    output: "Rewritten bullet with stronger verb and clearer outcome",
    description:
      "Rewrites your bullet using action verbs and result-focused language — without inventing data.",
  };

  return (
    <div className="group/bullet relative">
      <div className="flex items-start gap-3">
        <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
        <div className="flex-1 w-full min-w-0">
          <RichTextEditor
            value={bullet}
            onChange={onChange}
            onFocus={onFocus}
            onBlur={onBlur}
            placeholder={placeholder}
            className="bg-muted/20 focus:bg-background"
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
          creditOperation="improve-bullet"
          onClick={() => {
            setImproveSheetOpen(true);
            improveAction.run();
          }}
          contract={improveContract}
          disabled={!!improveDisabledReason}
          disabledReason={improveDisabledReason}
          className="h-8"
        />
        <Button
          variant="ghost"
          size="icon"
          onClick={onRemove}
          className="opacity-0 group-hover/bullet:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive"
          aria-label="Remove bullet"
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
        creditOperation="improve-bullet"
        status={improveAction.status}
        suggestion={improveAction.suggestion || ""}
        previousText={bullet}
        onApply={() => {
          const applied = improveAction.apply(bullet);
          if (applied) {
            setImproveSheetOpen(false);
          }
        }}
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
    </div>
  );
}

export function EducationForm({
  education,
  onAdd,
  onUpdate,
  onRemove,
  onReorder,
  validationErrors = [],
  showErrors = false,
}: EducationFormProps) {
  const [focusedBullet, setFocusedBullet] = useState<{
    eduId: string;
    bulletIndex: number;
  } | null>(null);

  const isItemComplete = (edu: ResumeData["education"][0]): boolean => {
    return !!(edu.institution && edu.startDate);
  };

  const {
    items,
    isExpanded,
    handleAdd,
    handleUpdate,
    handleRemove,
    handleToggle,
  } = useFormArray({
    items: education,
    onAdd,
    onUpdate,
    onRemove,
    isItemComplete,
    autoExpandIncomplete: true,
  });

  const { getFieldError, markFieldTouched, markErrors } = useArrayFieldValidation(
    validationErrors,
    "education"
  );

  useEffect(() => {
    if (showErrors && validationErrors.length > 0) {
      markErrors(validationErrors);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showErrors, markErrors]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div />
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="Showcase your academic background"
          description="Add degrees, diplomas, and relevant coursework."
          actionLabel="Add Education"
          onAction={handleAdd}
          tips={SECTION_GUIDANCE.education?.tips}
        />
      ) : (
        <SortableList
          items={items}
          onReorder={onReorder}
          keyExtractor={(item) => item.id}
          renderItem={(edu, index, isDragging) => {
            const isExpandedItem = isExpanded(edu.id);
            const isComplete = isItemComplete(edu);

            return (
              <div
                className={cn(
                  "group border rounded-lg bg-card transition-all duration-250",
                  isExpandedItem
                    ? "border-primary/30 shadow-md"
                    : "hover:border-primary/50",
                  isDragging && "shadow-xl border-primary/30 rotate-1 z-50"
                )}
              >
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer"
                  onClick={() => handleToggle(edu.id)}
                >
                  <DragHandle className="shrink-0" />

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4
                        className={cn(
                          "font-medium truncate",
                          !edu.institution && "text-muted-foreground italic"
                        )}
                      >
                        {edu.institution || "(No Institution)"}
                      </h4>
                      {isComplete && (
                        <Badge
                          variant="secondary"
                          className="h-5 px-1.5 text-[10px] bg-success/10 text-success hover:bg-success/20 border-success/20"
                        >
                          Complete
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground truncate">
                      {edu.degree} {edu.field && `in ${edu.field}`}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(edu.id);
                      }}
                      aria-label="Remove education entry"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Institution"
                        value={edu.institution}
                        onChange={(val) =>
                          handleUpdate(edu.id, { institution: val })
                        }
                        onBlur={() => markFieldTouched(index, "institution")}
                        placeholder={EXAMPLE_RESUME_DATA.education.institution}
                        required
                        error={getFieldError(index, "institution")}
                        icon={<School className="w-4 h-4" />}
                      />
                      <LocationField
                        label="Location"
                        value={edu.location}
                        onChange={(val) =>
                          handleUpdate(edu.id, { location: val })
                        }
                        onBlur={() => markFieldTouched(index, "location")}
                        placeholder={EXAMPLE_RESUME_DATA.education.location}
                        error={getFieldError(index, "location")}
                        icon={<School className="w-4 h-4" />}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        label="Degree"
                        value={edu.degree}
                        onChange={(val) =>
                          handleUpdate(edu.id, { degree: val })
                        }
                        onBlur={() => markFieldTouched(index, "degree")}
                        placeholder={EXAMPLE_RESUME_DATA.education.degree}
                        error={getFieldError(index, "degree")}
                        icon={<Award className="w-4 h-4" />}
                      />
                      <FormField
                        label="Field of Study"
                        value={edu.field}
                        onChange={(val) => handleUpdate(edu.id, { field: val })}
                        onBlur={() => markFieldTouched(index, "field")}
                        placeholder={EXAMPLE_RESUME_DATA.education.field}
                        required
                        error={getFieldError(index, "field")}
                        icon={<GraduationCap className="w-4 h-4" />}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormDatePicker
                        label="Start Date"
                        value={edu.startDate}
                        onChange={(val) => {
                          handleUpdate(edu.id, { startDate: val });
                          markFieldTouched(index, "dates");
                        }}
                        placeholder="Select start date"
                        required
                        error={getFieldError(index, "dates")}
                        maxDate={!edu.current && edu.endDate ? edu.endDate : undefined}
                        icon={<Calendar className="w-4 h-4" />}
                      />
                      <FormDatePicker
                        label="End Date"
                        value={edu.endDate}
                        onChange={(val) => {
                          handleUpdate(edu.id, { endDate: val });
                          markFieldTouched(index, "dates");
                        }}
                        placeholder="Select end date"
                        disabled={edu.current}
                        minDate={edu.startDate || undefined}
                        icon={<Calendar className="w-4 h-4" />}
                      />
                      <FormField
                        label="Grade / GPA"
                        value={edu.gpa || ""}
                        onChange={(val) => handleUpdate(edu.id, { gpa: val })}
                        onBlur={() => markFieldTouched(index, "gpa")}
                        placeholder=""
                        labelTooltip="Add your academic score or classification, if relevant."
                        icon={<Award className="w-4 h-4" />}
                      />
                    </div>

                    <FormCheckbox
                      label="I currently study here"
                      checked={edu.current}
                      onCheckedChange={(checked) =>
                        handleUpdate(edu.id, {
                          current: checked as boolean,
                          endDate: checked ? "" : edu.endDate,
                        })
                      }
                    />

                    <Separator />

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-medium">
                          Achievements & Activities (Optional)
                        </label>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleUpdate(edu.id, {
                              description: [...(edu.description || []), ""],
                            })
                          }
                          className="h-8 text-xs"
                        >
                          <Plus className="w-3 h-3 mr-1" />
                          Add Bullet
                        </Button>
                      </div>

                      <div className="space-y-3 pl-2">
                        {(edu.description || []).map((bullet, bulletIndex) => (
                          <BulletItem
                            key={bulletIndex}
                            bullet={bullet}
                            bulletIndex={bulletIndex}
                            eduId={edu.id}
                            institution={edu.institution}
                            degree={edu.degree}
                            focusedBullet={focusedBullet}
                            onFocus={() =>
                              setFocusedBullet({ eduId: edu.id, bulletIndex })
                            }
                            onBlur={() => setFocusedBullet(null)}
                            onChange={(value) => {
                              const newDesc = [...(edu.description || [])];
                              newDesc[bulletIndex] = value;
                              handleUpdate(edu.id, { description: newDesc });
                            }}
                            onRemove={() => {
                              const newDesc = (edu.description || []).filter(
                                (_, i) => i !== bulletIndex
                              );
                              handleUpdate(edu.id, { description: newDesc });
                            }}
                            placeholder={
                              EXAMPLE_RESUME_DATA.education.description[
                                bulletIndex % EXAMPLE_RESUME_DATA.education.description.length
                              ]
                            }
                          />
                        ))}
                      </div>

                      {(!edu.description || edu.description.length === 0) && (
                        <p className="text-xs text-muted-foreground">
                          Add honors, relevant coursework, activities, or achievements
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

      <Button onClick={handleAdd} className="w-full" variant="outline">
        <Plus className="w-4 h-4 mr-2" />
        Add Another Education
      </Button>
    </div>
  );
}
