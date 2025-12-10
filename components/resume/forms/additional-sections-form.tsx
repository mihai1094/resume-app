"use client";

import { useState } from "react";
import { ExtraCurricular, Hobby, CustomSection, CustomSectionItem } from "@/lib/types/resume";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ExtraCurricularForm } from "./extra-curricular-form";
import { HobbiesForm } from "./hobbies-form";
import { CustomSectionsForm } from "./custom-sections-form";
import { ValidationError } from "@/lib/validation/resume-validation";
import { Trophy, Heart, Layers } from "lucide-react";

interface AdditionalSectionsFormProps {
  // Extra-curricular
  extraCurricular: ExtraCurricular[];
  onAddExtra: () => void;
  onUpdateExtra: (id: string, updates: Partial<ExtraCurricular>) => void;
  onRemoveExtra: (id: string) => void;
  onReorderExtra: (items: ExtraCurricular[]) => void;

  // Hobbies
  hobbies: Hobby[];
  onAddHobby: () => void;
  onUpdateHobby: (id: string, updates: Partial<Hobby>) => void;
  onRemoveHobby: (id: string) => void;

  // Custom Sections
  customSections: CustomSection[];
  onAddCustomSection: () => void;
  onUpdateCustomSection: (id: string, updates: Partial<CustomSection>) => void;
  onRemoveCustomSection: (id: string) => void;
  onAddCustomItem: (sectionId: string) => void;
  onUpdateCustomItem: (
    sectionId: string,
    itemId: string,
    updates: Partial<CustomSectionItem>
  ) => void;
  onRemoveCustomItem: (sectionId: string, itemId: string) => void;

  // Validation
  validationErrors?: ValidationError[];
  showErrors?: boolean;
}

export function AdditionalSectionsForm({
  extraCurricular,
  onAddExtra,
  onUpdateExtra,
  onRemoveExtra,
  onReorderExtra,
  hobbies,
  onAddHobby,
  onUpdateHobby,
  onRemoveHobby,
  customSections,
  onAddCustomSection,
  onUpdateCustomSection,
  onRemoveCustomSection,
  onAddCustomItem,
  onUpdateCustomItem,
  onRemoveCustomItem,
  validationErrors = [],
  showErrors = false,
}: AdditionalSectionsFormProps) {
  // Determine default tab based on which has data
  const getDefaultTab = () => {
    if (extraCurricular.length > 0) return "activities";
    if (hobbies.length > 0) return "hobbies";
    if (customSections.length > 0) return "custom";
    return "activities";
  };

  const [activeTab, setActiveTab] = useState<"activities" | "hobbies" | "custom">(
    getDefaultTab()
  );

  // Count items for badges
  const activityCount = extraCurricular.length;
  const hobbyCount = hobbies.length;
  const customCount = customSections.length;
  const totalCount = activityCount + hobbyCount + customCount;

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <TabsList>
            <TabsTrigger value="activities" className="gap-1.5">
              <Trophy className="w-3.5 h-3.5" />
              Activities
              {activityCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                  {activityCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="hobbies" className="gap-1.5">
              <Heart className="w-3.5 h-3.5" />
              Hobbies
              {hobbyCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                  {hobbyCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="custom" className="gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Custom
              {customCount > 0 && (
                <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
                  {customCount}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {totalCount > 0 && (
            <Badge variant="outline" className="text-muted-foreground">
              {totalCount} total items
            </Badge>
          )}
        </div>

        <TabsContent value="activities" className="mt-6">
          <ExtraCurricularForm
            activities={extraCurricular}
            onAdd={onAddExtra}
            onUpdate={onUpdateExtra}
            onRemove={onRemoveExtra}
            onReorder={onReorderExtra}
            validationErrors={validationErrors}
            showErrors={showErrors}
          />
        </TabsContent>

        <TabsContent value="hobbies" className="mt-6">
          <HobbiesForm
            hobbies={hobbies}
            onAdd={onAddHobby}
            onUpdate={onUpdateHobby}
            onRemove={onRemoveHobby}
          />
        </TabsContent>

        <TabsContent value="custom" className="mt-6">
          <CustomSectionsForm
            sections={customSections}
            onAddSection={onAddCustomSection}
            onUpdateSection={onUpdateCustomSection}
            onRemoveSection={onRemoveCustomSection}
            onAddItem={onAddCustomItem}
            onUpdateItem={onUpdateCustomItem}
            onRemoveItem={onRemoveCustomItem}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
