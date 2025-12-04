"use client";

import { Project } from "@/lib/types/resume";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MonthPicker } from "@/components/ui/month-picker";
import {
  Plus,
  Trash2,
  ClipboardList,
  Code,
  Calendar,
  Link as LinkIcon,
  Github,
} from "lucide-react";

interface ProjectsFormProps {
  projects: Project[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<Project>) => void;
  onRemove: (id: string) => void;
  onReorder?: (startIndex: number, endIndex: number) => void;
}

export function ProjectsForm({
  projects,
  onAdd,
  onUpdate,
  onRemove,
}: ProjectsFormProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Badge variant="secondary">{projects.length} projects</Badge>
      </div>

      {projects.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <ClipboardList className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No projects added yet</p>
          <Button onClick={onAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Project
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {projects.map((project) => (
              <Card key={project.id} className="border-border/50 relative">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="sm:flex sm:items-start sm:justify-between">
                      <div className="flex-1 space-y-4 sm:pr-12">
                        <div className="space-y-2">
                          <Label
                            htmlFor={`project-name-${project.id}`}
                            className="flex items-center gap-2"
                          >
                            <ClipboardList className="w-4 h-4" />
                            Project Name <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id={`project-name-${project.id}`}
                            value={project.name}
                            onChange={(e) =>
                              onUpdate(project.id, { name: e.target.value })
                            }
                            placeholder="Portfolio Website"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor={`project-description-${project.id}`}
                            className="flex items-center gap-2"
                          >
                            <ClipboardList className="w-4 h-4" />
                            Description
                          </Label>
                          <Textarea
                            id={`project-description-${project.id}`}
                            value={project.description}
                            onChange={(e) =>
                              onUpdate(project.id, { description: e.target.value })
                            }
                            placeholder="Summarize the problem, your contribution, and the outcome."
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor={`project-start-${project.id}`}
                              className="flex items-center gap-2"
                            >
                              <Calendar className="w-4 h-4" />
                              Start Date
                            </Label>
                            <MonthPicker
                              value={project.startDate}
                              onChange={(value) =>
                                onUpdate(project.id, { startDate: value })
                              }
                              placeholder="Select start date"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor={`project-end-${project.id}`}
                              className="flex items-center gap-2"
                            >
                              <Calendar className="w-4 h-4" />
                              End Date
                            </Label>
                            <MonthPicker
                              value={project.endDate}
                              onChange={(value) =>
                                onUpdate(project.id, { endDate: value })
                              }
                              placeholder="Select end date"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor={`project-tech-${project.id}`}
                              className="flex items-center gap-2"
                            >
                              <Code className="w-4 h-4" />
                              Technologies
                            </Label>
                            <Input
                              id={`project-tech-${project.id}`}
                              value={(project.technologies || []).join(", ")}
                              onChange={(e) =>
                                onUpdate(project.id, {
                                  technologies: e.target.value
                                    .split(",")
                                    .map((t) => t.trim())
                                    .filter(Boolean),
                                })
                              }
                              placeholder="React, TypeScript, Tailwind"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor={`project-url-${project.id}`}
                              className="flex items-center gap-2"
                            >
                              <LinkIcon className="w-4 h-4" />
                              Live URL (Optional)
                            </Label>
                            <Input
                              id={`project-url-${project.id}`}
                              value={project.url || ""}
                              onChange={(e) =>
                                onUpdate(project.id, { url: e.target.value })
                              }
                              placeholder="https://"
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor={`project-github-${project.id}`}
                            className="flex items-center gap-2"
                          >
                            <Github className="w-4 h-4" />
                            GitHub (Optional)
                          </Label>
                          <Input
                            id={`project-github-${project.id}`}
                            value={project.github || ""}
                            onChange={(e) =>
                              onUpdate(project.id, { github: e.target.value })
                            }
                            placeholder="https://github.com/..."
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onRemove(project.id)}
                        className="text-destructive hover:text-destructive absolute top-4 right-4 sm:relative sm:top-auto sm:right-auto sm:ml-4"
                        aria-label="Remove project"
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
            Add Another Project
          </Button>
        </>
      )}
    </div>
  );
}

