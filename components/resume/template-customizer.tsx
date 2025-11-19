"use client";

import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Palette, Type, GripVertical } from "lucide-react";

export interface TemplateCustomization {
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  fontSize: number;
  lineSpacing: number;
  sectionSpacing: number;
}

interface TemplateCustomizerProps {
  customization: TemplateCustomization;
  onChange: (customization: Partial<TemplateCustomization>) => void;
  onReset: () => void;
}

const FONT_FAMILIES = [
  { value: "sans", label: "Sans Serif (Default)" },
  { value: "serif", label: "Serif" },
  { value: "mono", label: "Monospace" },
];

const COLOR_PRESETS = [
  { name: "Blue", primary: "#3b82f6", secondary: "#60a5fa" },
  { name: "Purple", primary: "#a855f7", secondary: "#c084fc" },
  { name: "Green", primary: "#10b981", secondary: "#34d399" },
  { name: "Red", primary: "#ef4444", secondary: "#f87171" },
  { name: "Orange", primary: "#f97316", secondary: "#fb923c" },
  { name: "Gray", primary: "#6b7280", secondary: "#9ca3af" },
];

export function TemplateCustomizer({
  customization,
  onChange,
  onReset,
}: TemplateCustomizerProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-end">
        <Button variant="ghost" size="sm" onClick={onReset}>
          Reset to Defaults
        </Button>
      </div>

      <div className="space-y-6">
        {/* Colors */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4" />
            <Label className="text-sm font-medium">Colors</Label>
          </div>

          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Primary Color
              </Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customization.primaryColor}
                  onChange={(e) => onChange({ primaryColor: e.target.value })}
                  className="w-12 h-8 rounded border cursor-pointer"
                />
                <div className="flex-1 flex gap-1 flex-wrap">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => onChange({ primaryColor: preset.primary })}
                      className="w-6 h-6 rounded border-2 border-transparent hover:border-primary"
                      style={{ backgroundColor: preset.primary }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">
                Secondary Color
              </Label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={customization.secondaryColor}
                  onChange={(e) => onChange({ secondaryColor: e.target.value })}
                  className="w-12 h-8 rounded border cursor-pointer"
                />
                <div className="flex-1 flex gap-1 flex-wrap">
                  {COLOR_PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => onChange({ secondaryColor: preset.secondary })}
                      className="w-6 h-6 rounded border-2 border-transparent hover:border-primary"
                      style={{ backgroundColor: preset.secondary }}
                      title={preset.name}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Separator />

        {/* Typography */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            <Label className="text-sm font-medium">Typography</Label>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Font Family
            </Label>
            <Select
              value={customization.fontFamily}
              onValueChange={(value) => onChange({ fontFamily: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FONT_FAMILIES.map((font) => (
                  <SelectItem key={font.value} value={font.value}>
                    {font.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Font Size: {customization.fontSize}px
            </Label>
            <Slider
              value={[customization.fontSize]}
              onValueChange={([value]) => onChange({ fontSize: value })}
              min={10}
              max={18}
              step={1}
            />
          </div>
        </div>

        <Separator />

        {/* Spacing */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <GripVertical className="w-4 h-4" />
            <Label className="text-sm font-medium">Spacing</Label>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Line Spacing: {customization.lineSpacing}
            </Label>
            <Slider
              value={[customization.lineSpacing]}
              onValueChange={([value]) => onChange({ lineSpacing: value })}
              min={1}
              max={2}
              step={0.1}
            />
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Section Spacing: {customization.sectionSpacing}px
            </Label>
            <Slider
              value={[customization.sectionSpacing]}
              onValueChange={([value]) => onChange({ sectionSpacing: value })}
              min={8}
              max={32}
              step={2}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

