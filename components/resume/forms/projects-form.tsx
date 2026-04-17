"use client";

import { Project } from "@/lib/types/resume";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormTextarea } from "@/components/forms/form-textarea";
import { Badge } from "@/components/ui/badge";
import { MonthPicker } from "@/components/ui/month-picker";
import {
  Plus,
  Trash2,
  ClipboardList,
  Wrench,
  Calendar,
  Link as LinkIcon,
  ExternalLink,
} from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { SECTION_GUIDANCE } from "@/lib/constants/section-guidance";

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
        <EmptyState
          icon={ClipboardList}
          title="Showcase what you've worked on"
          description="Projects, research, initiatives, or work samples that demonstrate your abilities."
          actionLabel="Add Project"
          onAction={onAdd}
          tips={SECTION_GUIDANCE.projects?.tips}
        />
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

                        <FormTextarea
                          id={`project-description-${project.id}`}
                          label="Description"
                          icon={<ClipboardList className="w-4 h-4" />}
                          value={project.description}
                          onChange={(value) =>
                            onUpdate(project.id, { description: value })
                          }
                          placeholder="Summarize the problem, your contribution, and the outcome."
                          rows={3}
                          enableFormatting
                        />

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
                              maxDate={project.endDate || undefined}
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
                              minDate={project.startDate || undefined}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label
                              htmlFor={`project-tech-${project.id}`}
                              className="flex items-center gap-2"
                            >
                              <Wrench className="w-4 h-4" />
                              Tools & Technologies
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
                              placeholder="e.g. Excel, Figma, Salesforce, Python"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label
                              htmlFor={`project-url-${project.id}`}
                              className="flex items-center gap-2"
                            >
                              <LinkIcon className="w-4 h-4" />
                              Project URL (Optional)
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
                            <ExternalLink className="w-4 h-4" />
                            Source / Repository (Optional)
                          </Label>
                          <Input
                            id={`project-github-${project.id}`}
                            value={project.github || ""}
                            onChange={(e) =>
                              onUpdate(project.id, { github: e.target.value })
                            }
                            placeholder="Link to source code, repository, or documentation"
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






