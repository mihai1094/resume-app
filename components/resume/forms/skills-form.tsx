"use client";

import { Skill } from "@/lib/types/resume";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";

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
      case "expert":
        return "bg-primary/20 text-primary border-primary/20";
      case "advanced":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "intermediate":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      case "beginner":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

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
                placeholder="e.g. React, Project Management, Spanish"
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
