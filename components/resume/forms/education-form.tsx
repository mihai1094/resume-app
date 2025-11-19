"use client";

import { Education } from "@/lib/types/resume";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  GraduationCap,
  Plus,
  Trash2,
  GripVertical,
  ChevronDown,
  ChevronUp,
  School,
  Award,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { formatDate } from "@/lib/utils";
import { useFormArray } from "@/hooks/use-form-array";
import { validateEducation } from "@/lib/validation";
import {
  FormField,
  FormDatePicker,
  FormCheckbox,
} from "@/components/forms";
import { useTouchedFields } from "@/hooks/use-touched-fields";
import { cn } from "@/lib/utils";

interface EducationFormProps {
  education: Education[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<Education>) => void;
  onRemove: (id: string) => void;
  onReorder: (startIndex: number, endIndex: number) => void;
}

export function EducationForm({
  education,
  onAdd,
  onUpdate,
  onRemove,
  onReorder,
}: EducationFormProps) {
  // Check if an education entry is complete
  const isEntryComplete = (edu: Education): boolean => {
    return !!(edu.institution && edu.degree && edu.field && edu.startDate);
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
    items: education,
    onAdd,
    onUpdate,
    onRemove,
    onReorder,
    isItemComplete: isEntryComplete,
    autoExpandIncomplete: true,
  });

  const { markTouched, getFieldError: getTouchedFieldError } = useTouchedFields();
  const validationErrors = validateEducation(education);

  const getFieldError = (index: number, field: string): string | undefined => {
    const fieldKey = `education.${index}.${field}`;
    return getTouchedFieldError(validationErrors, fieldKey);
  };

  const markFieldTouched = (index: number, field: string) => {
    markTouched(`education.${index}.${field}`);
  };

  const handleDescriptionChange = (
    id: string,
    index: number,
    value: string
  ) => {
    const edu = education.find((e) => e.id === id);
    if (!edu || !edu.description) return;

    const newDescription = [...edu.description];
    newDescription[index] = value;
    handleUpdate(id, { description: newDescription });
  };

  const addDescriptionBullet = (id: string) => {
    const edu = education.find((e) => e.id === id);
    if (!edu) return;

    handleUpdate(id, { description: [...(edu.description || []), ""] });
  };

  const removeDescriptionBullet = (id: string, index: number) => {
    const edu = education.find((e) => e.id === id);
    if (!edu || !edu.description) return;

    const newDescription = edu.description.filter((_, i) => i !== index);
    onUpdate(id, { description: newDescription });
  };

  return (
    <div className="space-y-6">
      {/* Entry Count */}
      <div className="flex justify-end">
        <Badge variant="secondary">{education.length} entries</Badge>
      </div>
      {education.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <GraduationCap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No education added yet</p>
          <Button onClick={handleAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Education
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {items.map((edu, index) => {
              const isComplete = isEntryComplete(edu);
              const isExpandedState = isExpanded(edu.id);
              const shouldShowContent = !isComplete || isExpandedState;

              return (
                <Card
                  key={edu.id}
                  className={cn(
                    "border-border/50 transition-all duration-200",
                    dragAndDrop?.draggedIndex === index && "opacity-50 scale-95 shadow-lg",
                    dragAndDrop?.dragOverIndex === index &&
                      "border-primary border-2 shadow-md ring-2 ring-primary/20"
                  )}
                  onDragOver={(e) =>
                    education.length > 1 &&
                    dragAndDrop?.handleDragOver(e, index)
                  }
                  onDragLeave={(e) =>
                    education.length > 1 && dragAndDrop?.handleDragLeave(e)
                  }
                  onDrop={(e) =>
                    education.length > 1 && dragAndDrop?.handleDrop(e, index)
                  }
                >
                  <CardHeader
                    className={cn(
                      "pb-4",
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
                        handleToggle(edu.id);
                      }
                    }}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-2 flex-1">
                        {education.length > 1 && dragAndDrop && (
                          <div
                            className="grip-handle cursor-move"
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
                              {edu.degree || "Degree"}
                              {edu.field && ` in ${edu.field}`}
                            </h3>
                            {edu.current && <Badge>Current</Badge>}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {edu.institution || "Institution"}
                            {edu.location && ` • ${edu.location}`}
                          </p>
                          {edu.startDate && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {formatDate(edu.startDate)} -{" "}
                              {edu.current
                                ? "Present"
                                : formatDate(edu.endDate || "")}
                              {edu.gpa && ` • GPA: ${edu.gpa}`}
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
                              handleToggle(edu.id);
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
                          handleRemove(edu.id);
                        }}
                        className="text-destructive hover:text-destructive shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  {shouldShowContent && (
                    <CardContent className="space-y-4">
                      {/* Institution & Location */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          label="Institution"
                          value={edu.institution}
                          onChange={(val) =>
                            handleUpdate(edu.id, { institution: val })
                          }
                          onBlur={() => markFieldTouched(index, "institution")}
                          placeholder="University of California"
                          required
                          error={getFieldError(index, "institution")}
                          icon={<School className="w-4 h-4" />}
                        />
                        <FormField
                          label="Location"
                          value={edu.location}
                          onChange={(val) =>
                            handleUpdate(edu.id, { location: val })
                          }
                          onBlur={() => markFieldTouched(index, "location")}
                          placeholder="Berkeley, CA"
                          icon={<School className="w-4 h-4" />}
                        />
                      </div>

                      {/* Degree & Field */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          label="Degree"
                          value={edu.degree}
                          onChange={(val) =>
                            handleUpdate(edu.id, { degree: val })
                          }
                          onBlur={() => markFieldTouched(index, "degree")}
                          placeholder="Bachelor of Science"
                          required
                          error={getFieldError(index, "degree")}
                          icon={<Award className="w-4 h-4" />}
                        />
                        <FormField
                          label="Field of Study"
                          value={edu.field}
                          onChange={(val) =>
                            handleUpdate(edu.id, { field: val })
                          }
                          onBlur={() => markFieldTouched(index, "field")}
                          placeholder="Computer Science"
                          required
                          error={getFieldError(index, "field")}
                          icon={<GraduationCap className="w-4 h-4" />}
                        />
                      </div>

                      {/* Dates & GPA */}
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
                        />
                        <FormField
                          label="GPA (Optional)"
                          value={edu.gpa || ""}
                          onChange={(val) =>
                            handleUpdate(edu.id, { gpa: val })
                          }
                          onBlur={() => markFieldTouched(index, "gpa")}
                          placeholder="3.8"
                          icon={<Award className="w-4 h-4" />}
                        />
                      </div>

                      <FormCheckbox
                        label="I currently study here"
                        checked={edu.current}
                        onCheckedChange={(checked) =>
                          handleUpdate(edu.id, {
                            current: checked,
                            endDate: checked ? undefined : edu.endDate,
                          })
                        }
                      />

                      <Separator />

                      {/* Description/Achievements */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">
                            Achievements & Activities (Optional)
                          </label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => addDescriptionBullet(edu.id)}
                          >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Item
                          </Button>
                        </div>
                        {edu.description && edu.description.length > 0 && (
                          <>
                            {edu.description.map((item, itemIndex) => (
                              <div
                                key={itemIndex}
                                className="flex items-start gap-2"
                              >
                                <span className="text-muted-foreground mt-3">
                                  •
                                </span>
                                <Textarea
                                  value={item}
                                  onChange={(e) =>
                                    handleDescriptionChange(
                                      edu.id,
                                      itemIndex,
                                      e.target.value
                                    )
                                  }
                                  placeholder="Dean's List, Relevant coursework, Honors, etc."
                                  rows={2}
                                  className="flex-1 resize-none"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    removeDescriptionBullet(edu.id, itemIndex)
                                  }
                                  className="mt-2"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </>
                        )}
                        <p className="text-xs text-muted-foreground">
                          Add honors, relevant coursework, activities, or
                          achievements
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
            Add Another Education
          </Button>
        </>
      )}
    </div>
  );
}
