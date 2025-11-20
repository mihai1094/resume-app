"use client";

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

  return (
    <div className="space-y-6">
      {/* Entry Count */}
      <div className="flex justify-end">
        <Badge variant="secondary">{experiences.length} entries</Badge>
      </div>
      {experiences.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">
            No work experience added yet
          </p>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Work Experience
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {items.map((exp, index) => {
              const isComplete = isEntryComplete(exp);
              const isExpandedState = isExpanded(exp.id);
              const shouldShowContent = !isComplete || isExpandedState;

              return (
                <Card
                  key={exp.id}
                  className={cn(
                    "transition-all duration-200",
                    // Mobile: completely flat, no card styling
                    "border-0 shadow-none bg-transparent p-0",
                    // Desktop: card styling
                    "sm:border sm:border-border/50 sm:shadow-sm sm:bg-card sm:p-6",
                    // Add separator on mobile
                    index > 0 && "border-t border-border/20 mt-6 pt-6 sm:border-t-0 sm:mt-0 sm:pt-0",
                    // Drag & drop styles (desktop only)
                    dragAndDrop?.draggedIndex === index && "sm:opacity-50 sm:scale-95 sm:shadow-lg",
                    dragAndDrop?.dragOverIndex === index &&
                      "sm:border-primary sm:border sm:shadow-md sm:ring-2 sm:ring-primary/15"
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
                  <CardHeader
                    className={cn(
                      "pb-3 sm:pb-4 px-0 pt-0",
                      isComplete &&
                        "cursor-pointer hover:bg-muted/50 transition-colors"
                    )}
                    onClick={(e) => {
                      // Don't toggle if clicking on buttons or grip
                      const target = e.target as HTMLElement;
                      if (
                        target.closest("button") ||
                        target.closest(".grip-handle") ||
                        target.closest("a")
                      ) {
                        return;
                      }
                      if (isComplete) {
                        e.preventDefault();
                        handleToggle(exp.id);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2 flex-1">
                        {experiences.length > 1 && dragAndDrop && (
                          <div
                            className="grip-handle cursor-move hidden sm:block"
                            draggable={true}
                            onDragStart={(e) =>
                              dragAndDrop.handleDragStart(e, index)
                            }
                            onDragEnd={dragAndDrop.handleDragEnd}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <GripVertical className="w-5 h-5 text-muted-foreground mt-1" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">
                              {exp.position || "Position Title"}
                            </h3>
                            {exp.current && <Badge>Current</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {exp.company || "Company Name"}
                            {exp.location && ` • ${exp.location}`}
                          </p>
                          {exp.startDate && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(exp.startDate)} -{" "}
                              {exp.current
                                ? "Present"
                                : formatDate(exp.endDate || "")}
                              {exp.startDate && (
                                <span className="ml-2">
                                  (
                                  {calculateDuration(
                                    exp.startDate,
                                    exp.current ? undefined : exp.endDate
                                  )}
                                  )
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                        {isComplete && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={(e) => {
                              e.preventDefault();
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
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(exp.id);
                        }}
                        className="text-destructive hover:text-destructive shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  {shouldShowContent && (
                    <CardContent className="space-y-4 px-0 pb-0">
                      {/* Position & Company */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          label="Position Title"
                          value={exp.position}
                          onChange={(val) =>
                            handleUpdate(exp.id, { position: val })
                          }
                          onBlur={() => markFieldTouched(index, "position")}
                          placeholder="Senior Software Engineer"
                          required
                          error={getFieldError(index, "position")}
                          icon={<Briefcase className="w-4 h-4" />}
                        />
                        <FormField
                          label="Company"
                          value={exp.company}
                          onChange={(val) =>
                            handleUpdate(exp.id, { company: val })
                          }
                          onBlur={() => markFieldTouched(index, "company")}
                          placeholder="Tech Corp"
                          required
                          error={getFieldError(index, "company")}
                          icon={<Briefcase className="w-4 h-4" />}
                        />
                      </div>

                      {/* Location */}
                      <FormField
                        label="Location"
                        value={exp.location}
                        onChange={(val) =>
                          handleUpdate(exp.id, { location: val })
                        }
                        onBlur={() => markFieldTouched(index, "location")}
                        placeholder="San Francisco, CA"
                        icon={<Briefcase className="w-4 h-4" />}
                      />

                      {/* Dates */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      </div>

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

                      <Separator />

                      {/* Description Bullets */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">
                            Job Description & Achievements
                          </label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addDescriptionBullet(exp.id)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Bullet
                          </Button>
                        </div>
                        {exp.description.map((bullet, bulletIndex) => (
                          <div
                            key={bulletIndex}
                            className="flex items-start gap-2"
                          >
                            <span className="text-muted-foreground mt-3">•</span>
                            <Textarea
                              value={bullet}
                              onChange={(e) =>
                                handleDescriptionChange(exp.id, bulletIndex, e.target.value)
                              }
                              placeholder="Describe your responsibilities and achievements..."
                              rows={2}
                              className="flex-1 resize-none"
                            />
                            {exp.description.length > 1 && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  removeDescriptionBullet(exp.id, bulletIndex)
                                }
                                className="mt-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        ))}
                        {getFieldError(index, "description") && (
                          <p className="text-sm text-destructive">
                            {getFieldError(index, "description")}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Tip: Start with action verbs and quantify achievements
                          when possible
                        </p>
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </div>

          <Button onClick={handleAdd} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Position
          </Button>
        </>
      )}
    </div>
  );
}
