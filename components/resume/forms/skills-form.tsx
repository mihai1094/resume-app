"use client";

import { Skill } from "@/lib/types/resume";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Lightbulb,
  Plus,
  X,
  Sparkles,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRef, useState, useEffect } from "react";
import { SKILL_CATEGORIES, SKILL_LEVELS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { AiAction } from "@/components/ai/ai-action";
import { AiPreviewSheet } from "@/components/ai/ai-preview-sheet";
import { AiActionStatus } from "@/hooks/use-ai-action";
import { AiActionContract } from "@/lib/ai/action-contract";
import { authPost } from "@/lib/api/auth-fetch";

interface SkillsFormProps {
  skills: Skill[];
  onAdd: (skill: Omit<Skill, "id">) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Skill>) => void;
  jobTitle?: string;
}

interface SkillSuggestion {
  name: string;
  category: string;
  relevance: "high" | "medium";
  reason: string;
}

export function SkillsForm({
  skills,
  onAdd,
  onRemove,
  onUpdate,
  jobTitle,
}: SkillsFormProps) {
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState(SKILL_CATEGORIES[0]);
  const [newSkillLevel, setNewSkillLevel] =
    useState<Skill["level"]>("intermediate");
  const [suggestions, setSuggestions] = useState<SkillSuggestion[]>([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);
  const [addedSuggestions, setAddedSuggestions] = useState<Set<string>>(
    new Set()
  );
  const [suggestionStatus, setSuggestionStatus] =
    useState<AiActionStatus>("idle");
  const [suggestionSheetOpen, setSuggestionSheetOpen] = useState(false);
  const lastAddedRef = useRef<string[]>([]);
  const autoFetchedForJobTitle = useRef<string | null>(null);

  // Auto-fetch skill suggestions when job title exists and skills are empty
  useEffect(() => {
    const shouldAutoFetch =
      jobTitle &&
      jobTitle.trim().length >= 2 &&
      skills.length === 0 &&
      autoFetchedForJobTitle.current !== jobTitle &&
      suggestionStatus === "idle";

    if (shouldAutoFetch) {
      autoFetchedForJobTitle.current = jobTitle;
      // Small delay to avoid fetching during initial mount
      const timer = setTimeout(() => {
        handleGetSuggestions();
      }, 500);
      return () => clearTimeout(timer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobTitle, skills.length, suggestionStatus]);

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return;

    onAdd({
      name: newSkillName.trim(),
      category: newSkillCategory,
      level: newSkillLevel,
    });

    setNewSkillName("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleGetSuggestions = async () => {
    if (!jobTitle || jobTitle.trim().length < 2) {
      toast.error("Please enter a job title in Personal Info section first");
      return;
    }

    setIsLoadingSuggestions(true);
    setSuggestions([]);
    setSuggestionStatus("running");
    setSuggestionSheetOpen(true);

    try {
      const response = await authPost("/api/ai/suggest-skills", {
        jobTitle,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to get skill suggestions");
      }

      const data = await response.json();
      const skillSuggestions: SkillSuggestion[] = data.skills;

      // Filter out skills that are already in the resume
      const existingSkillNames = new Set(
        skills.map((s) => s.name.toLowerCase())
      );
      const filteredSuggestions = skillSuggestions.filter(
        (suggestion) => !existingSkillNames.has(suggestion.name.toLowerCase())
      );

      setSuggestions(filteredSuggestions);
      setSuggestionStatus("ready");

      if (data.meta.fromCache) {
        toast.success(
          `Got ${filteredSuggestions.length} skill suggestions instantly from cache! ⚡`
        );
      } else {
        toast.success(
          `Found ${filteredSuggestions.length} relevant skill suggestions! ✨`
        );
      }
    } catch (error) {
      console.error("Error getting skill suggestions:", error);
      setSuggestionStatus("error");
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to get suggestions. Please try again."
      );
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const handleAddSuggestion = (suggestion: SkillSuggestion) => {
    onAdd({
      name: suggestion.name,
      category: suggestion.category,
      level: suggestion.relevance === "high" ? "advanced" : "intermediate",
    });
    setAddedSuggestions((prev) => new Set(prev).add(suggestion.name));
    // Track for undo
    lastAddedRef.current = [...lastAddedRef.current, suggestion.name.toLowerCase()];
    toast.success(`Added ${suggestion.name} to your skills`);
  };

  const undoAppliedSuggestions = () => {
    if (!lastAddedRef.current.length) {
      toast.info("Nothing to undo yet");
      return;
    }
    const removeSet = new Set(lastAddedRef.current);
    const removedCount = lastAddedRef.current.length;
    skills.forEach((skill) => {
      if (removeSet.has(skill.name.toLowerCase())) {
        onRemove(skill.id);
      }
    });
    // Clear tracking state
    lastAddedRef.current = [];
    setAddedSuggestions(new Set());
    setSuggestionStatus("ready");
    toast.info(`Removed ${removedCount} AI-suggested skill${removedCount > 1 ? "s" : ""}`);
  };

  const SKILLS_CONTRACT: AiActionContract = {
    inputs: ["resume", "section", "userPreferences"],
    output: "List of relevant skills by category",
    description: "Uses your job title to suggest missing, high-impact skills.",
  };

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-primary" />
            <h3 className="font-medium">Add New Skill</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="skillName">Skill Name</Label>
              <Input
                id="skillName"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Add a skill (e.g. React, Project Management, Spanish)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skillCategory">Category</Label>
              <Select
                value={newSkillCategory}
                onValueChange={setNewSkillCategory}
              >
                <SelectTrigger id="skillCategory">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SKILL_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skillLevel">Proficiency Level</Label>
            <Select
              value={newSkillLevel}
              onValueChange={(value) =>
                setNewSkillLevel(value as Skill["level"])
              }
            >
              <SelectTrigger id="skillLevel">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SKILL_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value || ""}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleAddSkill}
            disabled={!newSkillName.trim()}
            className="w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Skill
          </Button>
        </CardContent>
      </Card>

      {/* AI Skill Suggestions */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              <h3 className="font-medium">AI Skill Suggestions</h3>
            </div>
            <AiAction
              label="Get suggestions"
              status={suggestionStatus}
              onClick={handleGetSuggestions}
              contract={SKILLS_CONTRACT}
              disabled={!jobTitle || jobTitle.trim().length < 2}
            />
          </div>

          {(!jobTitle || jobTitle.trim().length < 2) && (
            <p className="text-sm text-muted-foreground">
              Add a job title in Personal Info to get skill suggestions
            </p>
          )}

          {suggestions.length > 0 && (
            <div className="space-y-2 mt-4">
              <p className="text-sm text-muted-foreground mb-3">
                Relevant skills for {jobTitle}:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {suggestions.map((suggestion, index) => {
                  const isAdded = addedSuggestions.has(suggestion.name);
                  return (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-3 rounded-md border bg-background/50"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium text-sm">
                            {suggestion.name}
                          </p>
                          <Badge
                            variant={
                              suggestion.relevance === "high"
                                ? "default"
                                : "secondary"
                            }
                            className="text-xs"
                          >
                            {suggestion.relevance}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {suggestion.reason}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant={isAdded ? "ghost" : "outline"}
                        onClick={() => handleAddSuggestion(suggestion)}
                        disabled={isAdded}
                        className="shrink-0 h-7 text-xs"
                      >
                        {isAdded ? (
                          <>
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Added
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3 mr-1" />
                            Add
                          </>
                        )}
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <AiPreviewSheet
        open={suggestionSheetOpen}
        onOpenChange={setSuggestionSheetOpen}
        title="AI Skill Suggestions"
        description="Click + to add skills to your resume."
        contract={SKILLS_CONTRACT}
        status={suggestionStatus}
        onUndo={undoAppliedSuggestions}
        canUndo={lastAddedRef.current.length > 0}
      >
        {suggestionStatus === "running" ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <p className="text-sm">Analyzing your profile and finding relevant skills...</p>
          </div>
        ) : suggestions.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">
              {suggestions.filter((s) => !addedSuggestions.has(s.name)).length} skills suggested for <span className="font-medium">{jobTitle}</span>
            </p>
            <div className="grid grid-cols-1 gap-3">
              {suggestions.map((suggestion, index) => {
                const isAdded = addedSuggestions.has(suggestion.name);
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      isAdded ? "bg-emerald-50 border-emerald-200" : "bg-background hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium">{suggestion.name}</span>
                        <Badge
                          variant={suggestion.relevance === "high" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {suggestion.relevance}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {suggestion.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{suggestion.reason}</p>
                    </div>
                    <Button
                      size="sm"
                      variant={isAdded ? "ghost" : "default"}
                      onClick={() => handleAddSuggestion(suggestion)}
                      disabled={isAdded}
                      className="shrink-0"
                    >
                      {isAdded ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 mr-1.5" />
                          Added
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-1.5" />
                          Add
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Sparkles className="h-8 w-8 mb-4" />
            <p className="text-sm">No suggestions available yet.</p>
          </div>
        )}
      </AiPreviewSheet>

      {/* Skills List */}
      {skills.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-medium mb-2">Highlight your expertise</h3>
          <p className="text-sm text-muted-foreground">
            Add technical skills, tools, and competencies that match the job.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(skillsByCategory).map(
            ([category, categorySkills]) => (
              <div key={category} className="space-y-3">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    {category}
                  </h3>
                  <div className="h-px flex-1 bg-border" />
                  <Badge variant="outline" className="text-xs">
                    {categorySkills.length}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {categorySkills.map((skill) => {
                    const levelValue = skill.level || "intermediate";
                    return (
                      <div
                        key={skill.id}
                        className="flex flex-col gap-3 md:flex-row md:items-end md:gap-3 rounded-md border bg-muted/40 p-3"
                      >
                        <div className="flex-1 space-y-2">
                          <Label
                            htmlFor={`skill-${skill.id}-name`}
                            className="text-xs text-muted-foreground"
                          >
                            Skill name
                          </Label>
                          <Input
                            id={`skill-${skill.id}-name`}
                            value={skill.name}
                            onChange={(e) =>
                              onUpdate(skill.id, { name: e.target.value })
                            }
                            aria-label={`Edit skill ${skill.name || "name"}`}
                          />
                        </div>

                        <div className="w-full md:w-48 space-y-2">
                          <Label
                            htmlFor={`skill-${skill.id}-category`}
                            className="text-xs text-muted-foreground"
                          >
                            Category
                          </Label>
                          <Select
                            value={skill.category}
                            onValueChange={(value) =>
                              onUpdate(skill.id, { category: value })
                            }
                          >
                            <SelectTrigger
                              id={`skill-${skill.id}-category`}
                              aria-label={`Set category for ${skill.name}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {SKILL_CATEGORIES.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="w-full md:w-44 space-y-2">
                          <Label
                            htmlFor={`skill-${skill.id}-level`}
                            className="text-xs text-muted-foreground"
                          >
                            Level
                          </Label>
                          <Select
                            value={levelValue}
                            onValueChange={(value) =>
                              onUpdate(skill.id, {
                                level: (value ||
                                  "intermediate") as Skill["level"],
                              })
                            }
                          >
                            <SelectTrigger
                              id={`skill-${skill.id}-level`}
                              aria-label={`Set level for ${skill.name}`}
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {SKILL_LEVELS.map((level) => (
                                <SelectItem
                                  key={level.value || "unspecified"}
                                  value={level.value || "intermediate"}
                                >
                                  {level.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center md:items-end h-full">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onRemove(skill.id)}
                            aria-label={`Remove skill ${skill.name}`}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>
      )}

      {skills.length > 0 && (
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span>
              Tip: Include both technical and soft skills relevant to your
              target role
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
