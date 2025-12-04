"use client";

import { CustomSection, CustomSectionItem } from "@/lib/types/resume";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Layers, ListChecks } from "lucide-react";

interface CustomSectionsFormProps {
  sections: CustomSection[];
  onAddSection: () => void;
  onUpdateSection: (id: string, updates: Partial<CustomSection>) => void;
  onRemoveSection: (id: string) => void;
  onAddItem: (sectionId: string) => void;
  onUpdateItem: (
    sectionId: string,
    itemId: string,
    updates: Partial<CustomSectionItem>
  ) => void;
  onRemoveItem: (sectionId: string, itemId: string) => void;
}

export function CustomSectionsForm({
  sections,
  onAddSection,
  onUpdateSection,
  onRemoveSection,
  onAddItem,
  onUpdateItem,
  onRemoveItem,
}: CustomSectionsFormProps) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Badge variant="secondary">{sections.length} custom sections</Badge>
        <Button onClick={onAddSection} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Section
        </Button>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed rounded-lg">
          <Layers className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-2">
            No custom sections yet. Add any extra content you need.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section) => (
            <Card key={section.id} className="border-border/50">
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex-1 space-y-2">
                    <Label
                      htmlFor={`custom-title-${section.id}`}
                      className="flex items-center gap-2"
                    >
                      <Layers className="w-4 h-4" />
                      Section Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id={`custom-title-${section.id}`}
                      value={section.title}
                      onChange={(e) =>
                        onUpdateSection(section.id, { title: e.target.value })
                      }
                      placeholder="Awards, Publications, Volunteer Work..."
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveSection(section.id)}
                    className="text-destructive hover:text-destructive"
                    aria-label="Remove custom section"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  {(section.items || []).map((item) => (
                    <div
                      key={item.id}
                      className="rounded-lg border border-dashed p-4 space-y-3"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1 space-y-2">
                          <Label
                            htmlFor={`custom-item-title-${item.id}`}
                            className="flex items-center gap-2"
                          >
                            <ListChecks className="w-4 h-4" />
                            Item Title <span className="text-destructive">*</span>
                          </Label>
                          <Input
                            id={`custom-item-title-${item.id}`}
                            value={item.title}
                            onChange={(e) =>
                              onUpdateItem(section.id, item.id, {
                                title: e.target.value,
                              })
                            }
                            placeholder="Title or role"
                          />
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onRemoveItem(section.id, item.id)}
                          className="text-destructive hover:text-destructive"
                          aria-label="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-2">
                          <Label htmlFor={`custom-item-date-${item.id}`}>
                            Date (optional)
                          </Label>
                          <Input
                            id={`custom-item-date-${item.id}`}
                            value={item.date || ""}
                            onChange={(e) =>
                              onUpdateItem(section.id, item.id, {
                                date: e.target.value,
                              })
                            }
                            placeholder="2024"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`custom-item-location-${item.id}`}>
                            Location (optional)
                          </Label>
                          <Input
                            id={`custom-item-location-${item.id}`}
                            value={item.location || ""}
                            onChange={(e) =>
                              onUpdateItem(section.id, item.id, {
                                location: e.target.value,
                              })
                            }
                            placeholder="Remote / City"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor={`custom-item-desc-${item.id}`}>
                          Description (optional)
                        </Label>
                        <Textarea
                          id={`custom-item-desc-${item.id}`}
                          value={item.description || ""}
                          onChange={(e) =>
                            onUpdateItem(section.id, item.id, {
                              description: e.target.value,
                            })
                          }
                          placeholder="Key details or achievements."
                          rows={3}
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="outline"
                    onClick={() => onAddItem(section.id)}
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

