"use client";

import { Course } from "@/lib/types/resume";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { MonthPicker } from "@/components/ui/month-picker";
import {
  Plus,
  Trash2,
  BookOpen,
  Calendar,
  Building2,
  Link as LinkIcon,
} from "lucide-react";

interface CoursesFormProps {
  courses: Course[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<Course>) => void;
  onRemove: (id: string) => void;
}

export function CoursesForm({
  courses,
  onAdd,
  onUpdate,
  onRemove,
}: CoursesFormProps) {
  return (
    <div className="space-y-6">
      {/* Course Count */}
      <div className="flex justify-end">
        <Badge variant="secondary">{courses.length} courses</Badge>
      </div>
      {courses.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No courses added yet</p>
          <Button onClick={onAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Course
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {courses.map((course) => (
              <Card key={course.id} className="border-border/50">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor={`course-name-${course.id}`}
                            className="flex items-center gap-2"
                          >
                            <BookOpen className="w-4 h-4" />
                            Course Name{" "}
                            <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id={`course-name-${course.id}`}
                            value={course.name}
                            onChange={(e) =>
                              onUpdate(course.id, { name: e.target.value })
                            }
                            placeholder="Advanced React Patterns"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor={`course-institution-${course.id}`}
                              className="flex items-center gap-2"
                            >
                              <Building2 className="w-4 h-4" />
                              Institution/Platform
                            </Label>
                            <Input
                              id={`course-institution-${course.id}`}
                              value={course.institution || ""}
                              onChange={(e) =>
                                onUpdate(course.id, {
                                  institution: e.target.value,
                                })
                              }
                              placeholder="Coursera, Udemy, etc."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor={`course-date-${course.id}`}
                              className="flex items-center gap-2"
                            >
                              <Calendar className="w-4 h-4" />
                              Completion Date
                            </Label>
                            <MonthPicker
                              value={course.date}
                              onChange={(value) =>
                                onUpdate(course.id, { date: value })
                              }
                              placeholder="Select completion date"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor={`course-credential-${course.id}`}>
                              Credential ID (Optional)
                            </Label>
                            <Input
                              id={`course-credential-${course.id}`}
                              value={course.credentialId || ""}
                              onChange={(e) =>
                                onUpdate(course.id, {
                                  credentialId: e.target.value,
                                })
                              }
                              placeholder="Certificate ID or verification code"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor={`course-url-${course.id}`}
                              className="flex items-center gap-2"
                            >
                              <LinkIcon className="w-4 h-4" />
                              Certificate URL (Optional)
                            </Label>
                            <Input
                              id={`course-url-${course.id}`}
                              type="url"
                              value={course.url || ""}
                              onChange={(e) =>
                                onUpdate(course.id, { url: e.target.value })
                              }
                              placeholder="https://..."
                            />
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(course.id)}
                        className="text-destructive hover:text-destructive ml-4"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button onClick={onAdd} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Course
          </Button>
        </>
      )}
    </div>
  );
}
