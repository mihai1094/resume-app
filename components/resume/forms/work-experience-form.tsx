"use client";

import { useState } from "react";
import { WorkExperience } from "@/lib/types/resume";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { formatDate, calculateDuration } from "@/lib/utils";
import { useFormArray } from "@/hooks/use-form-array";
import { validateWorkExperience } from "@/lib/validation";
import {
  FormField,
  FormDatePicker,
  FormCheckbox,
} from "@/components/forms";
import { useTouchedFields } from "@/hooks/use-touched-fields";
import { cn } from "@/lib/utils";
import { useBulletTips } from "@/hooks/use-bullet-tips";
import { WritingTips } from "../writing-tips";
import { EmptyState } from "@/components/ui/empty-state";

interface WorkExperienceFormProps {
  experiences: WorkExperience[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<WorkExperience>) => void;
  onRemove: (id: string) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
}

export function WorkExperienceForm({
  experiences,
  onAdd,
  onUpdate,
  onRemove,
  onReorder,
}: WorkExperienceFormProps) {
  // State for focused bullet (to show writing tips)
  const [focusedBullet, setFocusedBullet] = useState<{ expId: string; bulletIndex: number } | null>(null);

  // Check if a work experience entry is complete
  const isEntryComplete = (exp: WorkExperience): boolean => {
    return !!(exp.position && exp.company && exp.startDate);
  };

  const {
    items,
    expandedIds,
    isExpanded,
    handleAdd,
    handleUpdate,
    handleRemove,
    handleToggle,
    dragAndDrop,
  } = useFormArray({
    items: experiences,
    onAdd,
    onUpdate,
    onRemove,
    onReorder,
    isItemComplete: isEntryComplete,
    autoExpandIncomplete: true,
  });

  const { markTouched, getFieldError: getTouchedFieldError } = useTouchedFields();
  const validationErrors = validateWorkExperience(experiences);

  const getFieldError = (index: number, field: string): string | undefined => {
    const fieldKey = `experience.${index}.${field}`;
    return getTouchedFieldError(validationErrors, fieldKey);
  };

  const markFieldTouched = (index: number, field: string) => {
    markTouched(`experience.${index}.${field}`);
  };

  const handleDescriptionChange = (
    id: string,
    index: number,
    value: string
  ) => {
    const exp = experiences.find((e) => e.id === id);
    if (!exp) return;

    const newDescription = [...exp.description];
    newDescription[index] = value;
    handleUpdate(id, { description: newDescription });
  };

  const addDescriptionBullet = (id: string) => {
    const exp = experiences.find((e) => e.id === id);
    if (!exp) return;

    handleUpdate(id, { description: [...exp.description, ""] });
  };

  const removeDescriptionBullet = (id: string, index: number) => {
    const exp = experiences.find((e) => e.id === id);
    if (!exp) return;

    const newDescription = exp.description.filter((_, i) => i !== index);
    onUpdate(id, { description: newDescription });
  };

  const handleInsertSuggestion = (expId: string, bulletIndex: number, suggestion: string) => {
    const exp = experiences.find((e) => e.id === expId);
    if (!exp) return;

    const currentText = exp.description[bulletIndex] || "";
    const newText = currentText ? `${currentText} ${suggestion}` : suggestion;
    handleDescriptionChange(expId, bulletIndex, newText);
  };

  // Get tips for focused bullet
  const focusedExp = focusedBullet ? experiences.find(e => e.id === focusedBullet.expId) : null;
  const focusedBulletText = focusedExp && focusedBullet ? focusedExp.description[focusedBullet.bulletIndex] || "" : "";
  const tips = useBulletTips(focusedBulletText);

  return (
    <div className="space-y-8">
      {/* Entry Count */}
      {experiences.length > 0 && (
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Experience History
          </h3>
          <Badge variant="secondary" className="font-normal">
            {experiences.length} {experiences.length === 1 ? "entry" : "entries"}
          </Badge>
        </div>
      )}

      {experiences.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="Build Your Professional Story"
          description="Add your work experience to showcase your achievements, skills, and career progression. Each role tells a part of your unique professional journey."
          actionLabel="Add First Experience"
          onAction={handleAdd}
        />
      ) : (
        <div className="space-y-4">
          {items.map((exp, index) => {
            const isComplete = isEntryComplete(exp);
            const isExpandedState = isExpanded(exp.id);
            const shouldShowContent = !isComplete || isExpandedState;

            return (
              <div
                key={exp.id}
                className={cn(
                  "group relative transition-all duration-200 rounded-xl border bg-card",
                  isExpandedState ? "ring-2 ring-primary/10 shadow-lg" : "hover:border-primary/50 hover:shadow-md",
                  dragAndDrop?.draggedIndex === index && "opacity-50 scale-95",
                  dragAndDrop?.dragOverIndex === index && "border-primary ring-2 ring-primary/20"
                )}
                onDragOver={(e) =>
                  experiences.length > 1 &&
                  dragAndDrop?.handleDragOver(e, index)
                }
                onDragLeave={(e) =>
                  experiences.length > 1 && dragAndDrop?.handleDragLeave(e)
                }
                onDrop={(e) =>
                  experiences.length > 1 && dragAndDrop?.handleDrop(e, index)
                }
              >
                {/* Header / Summary View */}
                <div
                  className={cn(
                    "flex items-center gap-4 p-4 cursor-pointer select-none",
                    isExpandedState && "border-b bg-muted/30"
                  )}
                  onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (
                      target.closest("button") ||
                      target.closest(".grip-handle") ||
                      target.closest("input") ||
                      target.closest("textarea")
                    ) {
                      return;
                    }
                    handleToggle(exp.id);
                  }}
                >
                  {/* Drag Handle */}
                  {experiences.length > 1 && dragAndDrop && (
                    <div
                      className="grip-handle cursor-move opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-muted rounded"
                      draggable={true}
                      onDragStart={(e) =>
                        dragAndDrop.handleDragStart(e, index)
                      }
                      onDragEnd={dragAndDrop.handleDragEnd}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <GripVertical className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}

                  {/* Icon */}
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                    isComplete ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
                  )}>
                    <Briefcase className="w-5 h-5" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className={cn("font-semibold truncate", !exp.position && "text-muted-foreground italic")}>
                        {exp.position || "New Position"}
                      </h4>
                      {exp.current && (
                        <Badge variant="secondary" className="text-[10px] h-5 px-1.5">Current</Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground truncate flex items-center gap-2">
                      <span>{exp.company || "No Company"}</span>
                      {(exp.startDate || exp.location) && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                          <span>
                            {[
                              exp.location,
                              exp.startDate ? `${formatDate(exp.startDate)} - ${exp.current ? "Present" : formatDate(exp.endDate || "")}` : null
                            ].filter(Boolean).join(" • ")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggle(exp.id);
                      }}
                    >
                      {isExpandedState ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(exp.id);
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Expanded Form Content */}
                {shouldShowContent && (
                  <div className="p-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        label="Position Title"
                        value={exp.position}
                        onChange={(val) =>
                          handleUpdate(exp.id, { position: val })
                        }
                        onBlur={() => markFieldTouched(index, "position")}
                        placeholder="e.g. Senior Software Engineer"
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
                        placeholder="e.g. Google"
                        required
                        error={getFieldError(index, "company")}
                      />
                    </div>

                    <FormField
                      label="Location"
                      value={exp.location}
                      onChange={(val) =>
                        handleUpdate(exp.id, { location: val })
                      }
                      onBlur={() => markFieldTouched(index, "location")}
                      placeholder="e.g. San Francisco, CA"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormDatePicker
                        label="Start Date"
                        value={exp.startDate}
                        onChange={(val) => {
                          handleUpdate(exp.id, { startDate: val });
                          markFieldTouched(index, "dates");
                        }}
                        placeholder="Select start date"
                        required
                        error={getFieldError(index, "dates")}
                      />
                      <div className="space-y-2">
                        <FormDatePicker
                          label="End Date"
                          value={exp.endDate}
                          onChange={(val) => {
                            handleUpdate(exp.id, { endDate: val });
                            markFieldTouched(index, "dates");
                          }}
                          placeholder="Select end date"
                          disabled={exp.current}
                        />
                        <FormCheckbox
                          label="I currently work here"
                          checked={exp.current}
                          onCheckedChange={(checked) =>
                            handleUpdate(exp.id, {
                              current: checked,
                              endDate: checked ? undefined : exp.endDate,
                            })
                          }
                        />
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-medium block">
                            Key Achievements & Responsibilities
                          </label>
                          <p className="text-xs text-muted-foreground mt-1">
                            Use bullet points to list your main contributions.
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => addDescriptionBullet(exp.id)}
                          className="h-8"
                        >
                          <Plus className="w-3 h-3 mr-2" />
                          Add Bullet
                        </Button>
                      </div>

                      <div className="space-y-3 pl-2">
                        {exp.description.map((bullet, bulletIndex) => (
                          <div
                            key={bulletIndex}
                            className="flex items-start gap-3 group/bullet relative"
                          >
                            <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                            <div className="flex-1 flex gap-3">
                              <Textarea
                                value={bullet}
                                onChange={(e) =>
                                  handleDescriptionChange(exp.id, bulletIndex, e.target.value)
                                }
                                onFocus={() => setFocusedBullet({ expId: exp.id, bulletIndex })}
                                onBlur={() => setFocusedBullet(null)}
                                placeholder="e.g. Led a team of 5 engineers to rebuild the core payment infrastructure..."
                                rows={2}
                                className="flex-1 resize-none bg-muted/20 focus:bg-background transition-colors"
                              />
                              {/* Writing Tips Panel */}
                              {focusedBullet?.expId === exp.id && focusedBullet?.bulletIndex === bulletIndex && (
                                <div className="hidden lg:block">
                                  <WritingTips
                                    tips={tips}
                                    onInsertSuggestion={(suggestion) =>
                                      handleInsertSuggestion(exp.id, bulletIndex, suggestion)
                                    }
                                  />
                                </div>
                              )}
                            </div>
                            {exp.description.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  removeDescriptionBullet(exp.id, bulletIndex)
                                }
                                className="mt-1 opacity-0 group-hover/bullet:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                      {getFieldError(index, "description") && (
                        <p className="text-sm text-destructive">
                          {getFieldError(index, "description")}
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          <Button
            onClick={handleAdd}
            variant="outline"
            className="w-full py-6 border-dashed hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Position
          </Button>
        </div>
      )}
    </div>
  );
}
