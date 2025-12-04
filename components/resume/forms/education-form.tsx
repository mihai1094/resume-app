"use client";

import { useEffect } from "react";
import { ResumeData } from "@/lib/types/resume";
import { SortableList, DragHandle } from "@/components/ui/sortable-list";
import { EXAMPLE_RESUME_DATA } from "@/lib/constants/example-data";
import { useFormArray } from "@/hooks/use-form-array";
import { useArrayFieldValidation } from "@/hooks/use-array-field-validation";
import { EmptyState } from "@/components/ui/empty-state";
import { ValidationError } from "@/lib/validation/resume-validation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { FormField, FormDatePicker, FormCheckbox } from "@/components/forms";
import { cn } from "@/lib/utils";
import {
  GraduationCap,
  School,
  Award,
  Plus,
  Trash2,
  ChevronDown,
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

export function EducationForm({
  education,
  onAdd,
  onUpdate,
  onRemove,
  onReorder,
  validationErrors = [],
  showErrors = false,
}: EducationFormProps) {
  const isItemComplete = (edu: ResumeData["education"][0]): boolean => {
    return !!(edu.institution && edu.degree && edu.startDate);
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

  // Use centralized validation hook - no inline validation needed
  const { getFieldError, markFieldTouched, markErrors } = useArrayFieldValidation(
    validationErrors,
    "education"
  );

  useEffect(() => {
    if (showErrors && validationErrors.length > 0) {
      markErrors(validationErrors);
    }
  }, [showErrors, validationErrors, markErrors]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div />
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No education added"
          description="Add your degrees and certifications."
          actionLabel="Add Education"
          onAction={handleAdd}
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
                  "group border rounded-lg bg-card transition-all duration-200",
                  isExpandedItem
                    ? "ring-2 ring-primary/20 shadow-lg"
                    : "hover:border-primary/50",
                  isDragging && "shadow-xl ring-2 ring-primary/20 rotate-1 z-50"
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
                          className="h-5 px-1.5 text-[10px] bg-green-500/10 text-green-600 hover:bg-green-500/20 border-green-500/20"
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
                      <FormField
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
                        required
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
                        onChange={(val) => handleUpdate(edu.id, { gpa: val })}
                        onBlur={() => markFieldTouched(index, "gpa")}
                        placeholder={EXAMPLE_RESUME_DATA.education.gpa}
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
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleUpdate(edu.id, {
                              description: [...(edu.description || []), ""],
                            })
                          }
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
                                onChange={(e) => {
                                  const newDesc = [...(edu.description || [])];
                                  newDesc[itemIndex] = e.target.value;
                                  handleUpdate(edu.id, {
                                    description: newDesc,
                                  });
                                }}
                                placeholder={
                                  EXAMPLE_RESUME_DATA.education.description[
                                    itemIndex %
                                      EXAMPLE_RESUME_DATA.education.description
                                        .length
                                  ]
                                }
                                rows={2}
                                className="flex-1 resize-none"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => {
                                  const newDesc = (
                                    edu.description || []
                                  ).filter((_, i) => i !== itemIndex);
                                  handleUpdate(edu.id, {
                                    description: newDesc,
                                  });
                                }}
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
