"use client";

import { Language } from "@/lib/types/resume";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Languages as LanguagesIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { SECTION_GUIDANCE } from "@/lib/constants/section-guidance";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COMMON_LANGUAGES, LANGUAGE_LEVELS } from "@/lib/constants";

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
  const commonLanguageSet = new Set(COMMON_LANGUAGES.map((lang) => lang.toLowerCase()));

  const isCommonLanguage = (name: string) =>
    commonLanguageSet.has(name.trim().toLowerCase());

  return (
    <div className="space-y-6">
      {/* Language Count */}
      <div className="flex justify-end">
        <Badge variant="secondary">{languages.length} languages</Badge>
      </div>
      {languages.length === 0 ? (
        <EmptyState
          icon={LanguagesIcon}
          title="Add Your Languages"
          description="Speaking multiple languages opens doors globally. Include your native language and any professional proficiencies."
          actionLabel="Add Language"
          onAction={onAdd}
          tips={SECTION_GUIDANCE.languages?.tips}
        />
      ) : (
        <>
          <div className="space-y-4">
            {languages.map((lang, index) => (
              <Card
                key={lang.id}
                className="border-border/50 card-hover-lift animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`lang-name-${lang.id}`}>
                          Language <span className="text-destructive">*</span>
                        </Label>
                        <Select
                          value={lang.name || "__none__"}
                          onValueChange={(value) => {
                            if (value === "__custom__") {
                              onUpdate(lang.id, { name: "" });
                              return;
                            }
                            onUpdate(lang.id, { name: value === "__none__" ? "" : value });
                          }}
                        >
                          <SelectTrigger id={`lang-name-${lang.id}`}>
                            <SelectValue placeholder="Select language..." />
                          </SelectTrigger>
                          <SelectContent>
                            {!lang.name && (
                              <SelectItem value="__none__">Select language...</SelectItem>
                            )}
                            {lang.name && !isCommonLanguage(lang.name) && (
                              <SelectItem value={lang.name}>
                                {lang.name} (custom)
                              </SelectItem>
                            )}
                            {COMMON_LANGUAGES.map((language) => (
                              <SelectItem key={language} value={language}>
                                {language}
                              </SelectItem>
                            ))}
                            <SelectItem value="__custom__">Other (type manually)</SelectItem>
                          </SelectContent>
                        </Select>
                        {!isCommonLanguage(lang.name) && (
                          <Input
                            value={lang.name}
                            onChange={(e) =>
                              onUpdate(lang.id, { name: e.target.value })
                            }
                            placeholder="Type language name"
                          />
                        )}
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

          <Button onClick={onAdd} variant="outline" className="w-full btn-press border-dashed hover:border-solid hover:border-primary/50">
            <Plus className="w-4 h-4 mr-2" />
            Add Another Language
          </Button>
        </>
      )}
    </div>
  );
}
