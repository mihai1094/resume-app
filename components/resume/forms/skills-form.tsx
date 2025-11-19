"use client";

import { Skill } from "@/lib/types/resume";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Lightbulb, Plus, X, Sparkles } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { SKILL_CATEGORIES, SKILL_LEVELS } from "@/lib/constants";

interface SkillsFormProps {
  skills: Skill[];
  onAdd: (skill: Omit<Skill, "id">) => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Skill>) => void;
}

export function SkillsForm({
  skills,
  onAdd,
  onRemove,
  onUpdate,
}: SkillsFormProps) {
  const [newSkillName, setNewSkillName] = useState("");
  const [newSkillCategory, setNewSkillCategory] = useState(SKILL_CATEGORIES[0]);
  const [newSkillLevel, setNewSkillLevel] =
    useState<Skill["level"]>("intermediate");

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

  // Group skills by category
  const skillsByCategory = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  const getLevelColor = (level?: Skill["level"]) => {
    switch (level) {
      case "beginner":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "intermediate":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case "advanced":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      case "expert":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Skill Count */}
      <div className="flex justify-end">
        <Badge variant="secondary">{skills.length} skills</Badge>
      </div>
      {/* Add New Skill */}
      <Card className="border-dashed border-2">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2 md:col-span-1">
                <Label htmlFor="skillName">Skill Name</Label>
                <Input
                  id="skillName"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="React, TypeScript, etc."
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
            </div>
            <Button
              onClick={handleAddSkill}
              disabled={!newSkillName.trim()}
              className="w-full"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Skill
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Skills List */}
      {skills.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">No skills added yet</p>
          <p className="text-sm text-muted-foreground">
            Add your first skill above to get started
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
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill) => (
                    <Badge
                      key={skill.id}
                      variant="secondary"
                      className={`group relative pr-8 ${getLevelColor(
                        skill.level
                      )}`}
                    >
                      <span className="mr-1">{skill.name}</span>
                      {skill.level && (
                        <span className="text-xs opacity-70">
                          ({skill.level})
                        </span>
                      )}
                      <button
                        onClick={() => onRemove(skill.id)}
                        className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
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
