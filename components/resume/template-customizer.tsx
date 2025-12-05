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
import { Palette, Type, GripVertical, RefreshCcw } from "lucide-react";

export interface TemplateCustomization {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
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
  { value: "sans", label: "Inter / System (ATS-safe)" },
  { value: "'Helvetica Neue', Arial, sans-serif", label: "Helvetica / Arial (ATS classic)" },
  { value: "'Calibri', 'Segoe UI', sans-serif", label: "Calibri / Segoe UI (ATS friendly)" },
  { value: "serif", label: "Georgia / Times (Executive serif)" },
  { value: "'IBM Plex Sans', 'Inter', 'Segoe UI', sans-serif", label: "IBM Plex Sans (Readable)" },
  { value: "mono", label: "Plex Mono / Courier (Mono)" },
];

const COLOR_PRESETS = [
  { name: "Ocean", primary: "#0ea5e9", secondary: "#22d3ee" },
  { name: "Emerald", primary: "#10b981", secondary: "#34d399" },
  { name: "Sunset", primary: "#f97316", secondary: "#fb7185" },
  { name: "Plum", primary: "#7c3aed", secondary: "#c084fc" },
  { name: "Charcoal", primary: "#334155", secondary: "#94a3b8" },
  { name: "Sand", primary: "#d6a35e", secondary: "#f5d0a9" },
];

export function TemplateCustomizer({
  customization,
  onChange,
  onReset,
}: TemplateCustomizerProps) {
  return (
    <div className="space-y-5">
      <div className="rounded-xl border bg-muted/40 p-4 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Style overview</p>
          <p className="text-sm font-semibold">
            {(() => {
              const fontValue = customization.fontFamily;
              if (fontValue === "sans") return "Modern Sans (Inter)";
              if (fontValue === "serif") return "Elegant Serif (Georgia)";
              if (fontValue === "mono") return "Mono Tech (Plex Mono)";
              if (fontValue?.includes("Helvetica")) return "Helvetica / Arial";
              if (fontValue?.includes("Calibri")) return "Calibri / Segoe UI";
              if (fontValue?.includes("IBM Plex Sans")) return "IBM Plex Sans";
              return "Custom Font Stack";
            })()}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: customization.primaryColor }} />
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: customization.secondaryColor }} />
            <span>
              {customization.fontSize}px · {customization.lineSpacing}x line · {customization.sectionSpacing}px sections
            </span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset} className="gap-2">
          <RefreshCcw className="w-3.5 h-3.5" />
          Reset
        </Button>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="rounded-xl border bg-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4" />
              <Label className="text-sm font-semibold">Palette</Label>
            </div>
            <span className="text-[11px] text-muted-foreground">Tap a preset or fine-tune</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {COLOR_PRESETS.map((preset) => (
              <button
                key={preset.name}
                onClick={() =>
                  onChange({ primaryColor: preset.primary, secondaryColor: preset.secondary })
                }
                className="group rounded-lg border bg-muted/40 p-3 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-foreground">{preset.name}</span>
                </div>
                <div className="flex gap-2">
                  <span
                    className="h-9 w-1/2 rounded-md border"
                    style={{ background: preset.primary }}
                  />
                  <span
                    className="h-9 w-1/2 rounded-md border"
                    style={{ background: preset.secondary }}
                  />
                </div>
              </button>
            ))}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Primary</Label>
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-2">
                <input
                  type="color"
                  value={customization.primaryColor}
                  onChange={(e) => onChange({ primaryColor: e.target.value })}
                  className="h-10 w-10 rounded border"
                />
                <div>
                  <p className="text-xs text-muted-foreground">Brand color</p>
                  <p className="text-sm font-medium">{customization.primaryColor}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Secondary</Label>
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-2">
                <input
                  type="color"
                  value={customization.secondaryColor}
                  onChange={(e) => onChange({ secondaryColor: e.target.value })}
                  className="h-10 w-10 rounded border"
                />
                <div>
                  <p className="text-xs text-muted-foreground">Accent color</p>
                  <p className="text-sm font-medium">{customization.secondaryColor}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Type className="w-4 h-4" />
              <Label className="text-sm font-semibold">Typography</Label>
            </div>
            <span className="text-[11px] text-muted-foreground">Legibility first</span>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Font Family</Label>
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

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <Label className="text-xs">Font Size</Label>
                <span className="text-foreground font-medium">{customization.fontSize}px</span>
              </div>
              <Slider
                value={[customization.fontSize]}
                onValueChange={([value]) => onChange({ fontSize: value })}
                min={10}
                max={18}
                step={1}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <Label className="text-xs">Line Spacing</Label>
                <span className="text-foreground font-medium">{customization.lineSpacing}x</span>
              </div>
              <Slider
                value={[customization.lineSpacing]}
                onValueChange={([value]) => onChange({ lineSpacing: value })}
                min={1}
                max={2}
                step={0.1}
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <Label className="text-xs">Section Spacing</Label>
                <span className="text-foreground font-medium">{customization.sectionSpacing}px</span>
              </div>
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

      <Separator />

      <div className="rounded-xl border bg-muted/40 p-4">
        <p className="text-xs text-muted-foreground mb-2">Live style chips</p>
        <div className="flex flex-wrap gap-2">
          {[customization.primaryColor, customization.secondaryColor].map((color, idx) => (
            <span
              key={`${color}-${idx}`}
              className="flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium"
            >
              <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
              {color}
            </span>
          ))}
          <span className="text-xs text-muted-foreground">
            Fonts adapt instantly across the preview as you tweak values.
          </span>
        </div>
      </div>
    </div>
  );
}
