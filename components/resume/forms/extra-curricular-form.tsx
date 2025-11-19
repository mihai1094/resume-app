"use client";

import { ExtraCurricular } from "@/lib/types/resume";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MonthPicker } from "@/components/ui/month-picker";
import {
  Plus,
  Trash2,
  Users,
  Calendar,
  MapPin,
  Briefcase,
  GripVertical,
} from "lucide-react";
import { formatDate } from "@/lib/utils";

interface ExtraCurricularFormProps {
  activities: ExtraCurricular[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<ExtraCurricular>) => void;
  onRemove: (id: string) => void;
}

export function ExtraCurricularForm({
  activities,
  onAdd,
  onUpdate,
  onRemove,
}: ExtraCurricularFormProps) {
  const handleDescriptionChange = (
    id: string,
    index: number,
    value: string
  ) => {
    const activity = activities.find((a) => a.id === id);
    if (!activity || !activity.description) return;

    const newDescription = [...activity.description];
    newDescription[index] = value;
    onUpdate(id, { description: newDescription });
  };

  const addDescriptionBullet = (id: string) => {
    const activity = activities.find((a) => a.id === id);
    if (!activity) return;

    onUpdate(id, {
      description: [...(activity.description || []), ""],
    });
  };

  const removeDescriptionBullet = (id: string, index: number) => {
    const activity = activities.find((a) => a.id === id);
    if (!activity || !activity.description) return;

    const newDescription = activity.description.filter((_, i) => i !== index);
    onUpdate(id, { description: newDescription });
  };

  return (
    <div className="space-y-6">
      {/* Activity Count */}
      <div className="flex justify-end">
        <Badge variant="secondary">{activities.length} activities</Badge>
      </div>
      {activities.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No activities added yet</p>
          <Button onClick={onAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Activity
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {activities.map((activity) => (
              <Card key={activity.id} className="border-border/50">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <GripVertical className="w-5 h-5 text-muted-foreground mt-1 cursor-move" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">
                            {activity.title || "Activity Title"}
                          </h3>
                          {activity.current && <Badge>Current</Badge>}
                        </div>
                        {activity.organization && (
                          <p className="text-sm text-muted-foreground">
                            {activity.organization}
                            {activity.role && ` • ${activity.role}`}
                          </p>
                        )}
                        {activity.startDate && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(activity.startDate)} -{" "}
                            {activity.current
                              ? "Present"
                              : formatDate(activity.endDate || "")}
                          </p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(activity.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor={`activity-title-${activity.id}`}>
                      Activity Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`activity-title-${activity.id}`}
                      value={activity.title}
                      onChange={(e) =>
                        onUpdate(activity.id, { title: e.target.value })
                      }
                      placeholder="Volunteer Work, Club President, etc."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor={`activity-org-${activity.id}`}
                        className="flex items-center gap-2"
                      >
                        <Briefcase className="w-4 h-4" />
                        Organization
                      </Label>
                      <Input
                        id={`activity-org-${activity.id}`}
                        value={activity.organization || ""}
                        onChange={(e) =>
                          onUpdate(activity.id, {
                            organization: e.target.value,
                          })
                        }
                        placeholder="Organization name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`activity-role-${activity.id}`}>
                        Role/Position
                      </Label>
                      <Input
                        id={`activity-role-${activity.id}`}
                        value={activity.role || ""}
                        onChange={(e) =>
                          onUpdate(activity.id, { role: e.target.value })
                        }
                        placeholder="President, Member, Volunteer..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor={`activity-start-${activity.id}`}
                        className="flex items-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        Start Date
                      </Label>
                      <MonthPicker
                        value={activity.startDate}
                        onChange={(value) =>
                          onUpdate(activity.id, { startDate: value })
                        }
                        placeholder="Select start date"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor={`activity-end-${activity.id}`}
                        className="flex items-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        End Date
                      </Label>
                      <MonthPicker
                        value={activity.endDate}
                        onChange={(value) =>
                          onUpdate(activity.id, { endDate: value })
                        }
                        placeholder="Select end date"
                        disabled={activity.current}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`activity-current-${activity.id}`}
                      checked={activity.current}
                      onCheckedChange={(checked) =>
                        onUpdate(activity.id, {
                          current: checked as boolean,
                          endDate: checked ? undefined : activity.endDate,
                        })
                      }
                    />
                    <Label
                      htmlFor={`activity-current-${activity.id}`}
                      className="font-normal cursor-pointer"
                    >
                      I'm currently involved in this activity
                    </Label>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label>Description & Achievements</Label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addDescriptionBullet(activity.id)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Bullet
                      </Button>
                    </div>
                    {activity.description &&
                      activity.description.length > 0 && (
                        <>
                          {activity.description.map((item, index) => (
                            <div key={index} className="flex items-start gap-2">
                              <span className="text-muted-foreground mt-3">
                                •
                              </span>
                              <Textarea
                                value={item}
                                onChange={(e) =>
                                  handleDescriptionChange(
                                    activity.id,
                                    index,
                                    e.target.value
                                  )
                                }
                                placeholder="Describe your involvement and achievements..."
                                rows={2}
                                className="flex-1"
                              />
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() =>
                                  removeDescriptionBullet(activity.id, index)
                                }
                                className="mt-2"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </>
                      )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button onClick={onAdd} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Activity
          </Button>
        </>
      )}
    </div>
  );
}
