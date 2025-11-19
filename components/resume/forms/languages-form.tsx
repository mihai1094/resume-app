"use client";

import { Language } from "@/lib/types/resume";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Languages as LanguagesIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGUAGE_LEVELS } from "@/lib/constants";

interface LanguagesFormProps {
  languages: Language[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<Language>) => void;
  onRemove: (id: string) => void;
}

export function LanguagesForm({
  languages,
  onAdd,
  onUpdate,
  onRemove,
}: LanguagesFormProps) {
  return (
    <div className="space-y-6">
      {/* Language Count */}
      <div className="flex justify-end">
        <Badge variant="secondary">{languages.length} languages</Badge>
      </div>
      {languages.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <LanguagesIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">No languages added yet</p>
          <Button onClick={onAdd}>
            <Plus className="w-4 h-4 mr-2" />
            Add Language
          </Button>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {languages.map((lang) => (
              <Card key={lang.id} className="border-border/50">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`lang-name-${lang.id}`}>
                          Language <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id={`lang-name-${lang.id}`}
                          value={lang.name}
                          onChange={(e) =>
                            onUpdate(lang.id, { name: e.target.value })
                          }
                          placeholder="English, Spanish, French..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`lang-level-${lang.id}`}>
                          Proficiency Level{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={lang.level}
                          onValueChange={(value) =>
                            onUpdate(lang.id, {
                              level: value as Language["level"],
                            })
                          }
                        >
                          <SelectTrigger id={`lang-level-${lang.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {LANGUAGE_LEVELS.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(lang.id)}
                      className="text-destructive hover:text-destructive mt-8"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button onClick={onAdd} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Language
          </Button>
        </>
      )}
    </div>
  );
}
