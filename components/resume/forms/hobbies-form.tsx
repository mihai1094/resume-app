"use client";

import { Hobby } from "@/lib/types/resume";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Heart, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/ui/empty-state";
import { SECTION_GUIDANCE } from "@/lib/constants/section-guidance";

interface HobbiesFormProps {
  hobbies: Hobby[];
  onAdd: () => void;
  onUpdate: (id: string, updates: Partial<Hobby>) => void;
  onRemove: (id: string) => void;
}

export function HobbiesForm({
  hobbies,
  onAdd,
  onUpdate,
  onRemove,
}: HobbiesFormProps) {
  return (
    <div className="space-y-6">
      {/* Hobby Count */}
      <div className="flex justify-end">
        <Badge variant="secondary">{hobbies.length} hobbies</Badge>
      </div>
      {hobbies.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Show your personality"
          description="Hobbies and interests give recruiters a glimpse of who you are beyond your professional experience."
          actionLabel="Add Hobby"
          onAction={onAdd}
          tips={SECTION_GUIDANCE.hobbies?.tips}
        />
      ) : (
        <>
          <div className="space-y-4">
            {hobbies.map((hobby) => (
              <Card key={hobby.id} className="border-border/50 relative">
                <CardContent className="pt-6">
                  <div className="sm:flex sm:items-start sm:gap-4">
                    <div className="flex-1 space-y-4 sm:pr-12">
                      <div className="space-y-2">
                        <Label htmlFor={`hobby-name-${hobby.id}`}>
                          Hobby/Interest{" "}
                          <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id={`hobby-name-${hobby.id}`}
                          value={hobby.name}
                          onChange={(e) =>
                            onUpdate(hobby.id, { name: e.target.value })
                          }
                          placeholder="Photography, Reading, Travel..."
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor={`hobby-desc-${hobby.id}`}>
                          Description (Optional)
                        </Label>
                        <Textarea
                          id={`hobby-desc-${hobby.id}`}
                          value={hobby.description || ""}
                          onChange={(e) =>
                            onUpdate(hobby.id, {
                              description: e.target.value,
                            })
                          }
                          placeholder="Brief description of your interest..."
                          rows={2}
                        />
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemove(hobby.id)}
                      className="text-destructive hover:text-destructive absolute top-4 right-4 sm:relative sm:top-auto sm:right-auto"
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
            Add Another Hobby
          </Button>

          <div className="pt-4 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="w-4 h-4" />
              <span>
                Tip: Include hobbies that showcase your personality and can be
                conversation starters in interviews
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
