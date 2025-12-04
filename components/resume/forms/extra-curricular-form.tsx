"use client";

import { useEffect } from "react";
import { ExtraCurricular } from "@/lib/types/resume";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Trash2,
  Users,
  ChevronDown,
  ChevronUp,
  Trophy,
} from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useFormArray } from "@/hooks/use-form-array";
import { useArrayFieldValidation } from "@/hooks/use-array-field-validation";
import { FormField, FormDatePicker, FormCheckbox } from "@/components/forms";
import { cn } from "@/lib/utils";
import { SortableList, DragHandle } from "@/components/ui/sortable-list";
import { ValidationError } from "@/lib/validation/resume-validation";

interface ExtraCurricularFormProps {
  activities: ExtraCurricular[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<ExtraCurricular>) => void;
  onRemove: (id: string) => void;
  onReorder: (items: ExtraCurricular[]) => void;
  validationErrors?: ValidationError[];
  showErrors?: boolean;
}

export function ExtraCurricularForm({
  activities,
  onAdd,
  onUpdate,
  onRemove,
  onReorder,
  validationErrors = [],
  showErrors = false,
}: ExtraCurricularFormProps) {
  const isEntryComplete = (activity: ExtraCurricular): boolean => {
    return !!(activity.title && activity.organization && activity.startDate);
  };

  const {
    items,
    isExpanded,
    handleAdd,
    handleUpdate,
    handleRemove,
    handleToggle,
  } = useFormArray({
    items: activities,
    onAdd,
    onUpdate,
    onRemove,
    isItemComplete: isEntryComplete,
    autoExpandIncomplete: true,
  });

  // Use centralized validation hook - no inline validation needed
  const { getFieldError, markFieldTouched, markErrors } =
    useArrayFieldValidation(validationErrors, "extra");

  useEffect(() => {
    if (showErrors && validationErrors.length > 0) {
      markErrors(validationErrors);
    }
  }, [showErrors, validationErrors, markErrors]);

  const handleDescriptionChange = (
    id: string,
    index: number,
    value: string
  ) => {
    const activity = activities.find((a) => a.id === id);
    if (!activity) return;

    const newDescription = [...(activity.description || [])];
    newDescription[index] = value;
    handleUpdate(id, { description: newDescription });
  };

  const addDescriptionBullet = (id: string) => {
    const activity = activities.find((a) => a.id === id);
    if (!activity) return;

    handleUpdate(id, {
      description: [...(activity.description || []), ""],
    });
  };

  const removeDescriptionBullet = (id: string, index: number) => {
    const activity = activities.find((a) => a.id === id);
    if (!activity || !activity.description) return;

    const newDescription = activity.description.filter((_, i) => i !== index);
    handleUpdate(id, { description: newDescription });
  };

  return (
    <div className="space-y-8">
      {activities.length > 0 && (
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
            Activities
          </h3>
          <Badge variant="secondary" className="font-normal">
            {activities.length}{" "}
            {activities.length === 1 ? "activity" : "activities"}
          </Badge>
        </div>
      )}

      {activities.length === 0 ? (
        <div className="text-center py-16 border border-dashed rounded-xl bg-muted/10 hover:bg-muted/20 transition-colors">
          <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Trophy className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No activities added</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Add extra-curricular activities, volunteering, or clubs to show your
            leadership and interests.
          </p>
          <Button onClick={handleAdd} size="lg">
            <Plus className="w-4 h-4 mr-2" />
            Add Activity
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <SortableList
            items={items}
            onReorder={onReorder}
            keyExtractor={(item) => item.id}
            renderItem={(activity, index, isDragging) => {
              const isComplete = isEntryComplete(activity);
              const isExpandedState = isExpanded(activity.id);
              const shouldShowContent = !isComplete || isExpandedState;

              return (
                <div
                  className={cn(
                    "group relative transition-all duration-200 rounded-xl border bg-card",
                    isExpandedState
                      ? "ring-2 ring-primary/10 shadow-lg"
                      : "hover:border-primary/50 hover:shadow-md",
                    isDragging &&
                      "shadow-xl ring-2 ring-primary/20 rotate-1 z-50"
                  )}
                >
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
                      handleToggle(activity.id);
                    }}
                  >
                    <DragHandle className="shrink-0" />

                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
                        isComplete
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <Users className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4
                          className={cn(
                            "font-semibold truncate",
                            !activity.title && "text-muted-foreground italic"
                          )}
                        >
                          {activity.title || "New Activity"}
                        </h4>
                        {activity.current && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] h-5 px-1.5"
                          >
                            Current
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground truncate flex items-center gap-2">
                        <span>
                          {activity.organization || "No Organization"}
                        </span>
                        {(activity.startDate || activity.role) && (
                          <>
                            <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
                            <span>
                              {[
                                activity.role,
                                activity.startDate
                                  ? `${formatDate(activity.startDate)} - ${
                                      activity.current
                                        ? "Present"
                                        : formatDate(activity.endDate || "")
                                    }`
                                  : null,
                              ]
                                .filter(Boolean)
                                .join(" • ")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggle(activity.id);
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
                          handleRemove(activity.id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {shouldShowContent && (
                    <div className="p-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
                      <div className="space-y-4">
                        <FormField
                          label="Activity Title"
                          value={activity.title}
                          onChange={(val) =>
                            handleUpdate(activity.id, { title: val })
                          }
                          onBlur={() => markFieldTouched(index, "title")}
                          placeholder="Volunteer Work, Club President, etc."
                          required
                          error={getFieldError(index, "title")}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            label="Organization"
                            value={activity.organization || ""}
                            onChange={(val) =>
                              handleUpdate(activity.id, { organization: val })
                            }
                            onBlur={() =>
                              markFieldTouched(index, "organization")
                            }
                            placeholder="Organization name"
                            required
                            error={getFieldError(index, "organization")}
                          />
                          <FormField
                            label="Role/Position"
                            value={activity.role || ""}
                            onChange={(val) =>
                              handleUpdate(activity.id, { role: val })
                            }
                            onBlur={() => markFieldTouched(index, "role")}
                            placeholder="President, Member, Volunteer..."
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormDatePicker
                            label="Start Date"
                            value={activity.startDate}
                            onChange={(val) => {
                              handleUpdate(activity.id, { startDate: val });
                              markFieldTouched(index, "dates");
                            }}
                            placeholder="Select start date"
                            required
                            error={getFieldError(index, "dates")}
                          />
                          <div className="space-y-2">
                            <FormDatePicker
                              label="End Date"
                              value={activity.endDate}
                              onChange={(val) => {
                                handleUpdate(activity.id, { endDate: val });
                                markFieldTouched(index, "dates");
                              }}
                              placeholder="Select end date"
                              disabled={activity.current}
                            />
                            <FormCheckbox
                              label="I'm currently involved in this activity"
                              checked={activity.current || false}
                              onCheckedChange={(checked) =>
                                handleUpdate(activity.id, {
                                  current: checked as boolean,
                                  endDate: checked
                                    ? undefined
                                    : activity.endDate,
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
                                Description & Achievements
                              </label>
                              <p className="text-xs text-muted-foreground mt-1">
                                Describe your involvement and key contributions.
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => addDescriptionBullet(activity.id)}
                              className="h-8"
                            >
                              <Plus className="w-3 h-3 mr-2" />
                              Add Bullet
                            </Button>
                          </div>

                          <div className="space-y-3 pl-2">
                            {(activity.description || []).map(
                              (item, descIndex) => (
                                <div
                                  key={descIndex}
                                  className="flex items-start gap-3 group/bullet"
                                >
                                  <div className="mt-2.5 w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" />
                                  <Textarea
                                    value={item}
                                    onChange={(e) =>
                                      handleDescriptionChange(
                                        activity.id,
                                        descIndex,
                                        e.target.value
                                      )
                                    }
                                    placeholder="e.g. Organized annual charity fundraiser raising $5,000..."
                                    rows={2}
                                    className="flex-1 resize-none bg-muted/20 focus:bg-background transition-colors"
                                  />
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() =>
                                      removeDescriptionBullet(
                                        activity.id,
                                        descIndex
                                      )
                                    }
                                    className="mt-1 opacity-0 group-hover/bullet:opacity-100 transition-opacity text-muted-foreground hover:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                              )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }}
          />

          <Button
            onClick={handleAdd}
            variant="outline"
            className="w-full py-6 border-dashed hover:border-primary hover:bg-primary/5 text-muted-foreground hover:text-primary transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Another Activity
          </Button>
        </div>
      )}
    </div>
  );
}
