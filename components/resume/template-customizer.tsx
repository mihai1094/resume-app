"use client";

import { useState } from "react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Palette, Type, RefreshCcw, Sparkles, ChevronDown, SlidersHorizontal } from "lucide-react";
import { STYLE_PACKS } from "@/lib/constants/style-packs";
import { cn } from "@/lib/utils";

export interface TemplateCustomization {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: number;
  lineSpacing: number;
  sectionSpacing: number;
  /** IDE theme ID for Technical template (e.g., "vscode-dark", "dracula") */
  ideThemeId?: string;
}

interface TemplateCustomizerProps {
  customization: TemplateCustomization;
  onChange: (customization: Partial<TemplateCustomization>) => void;
  onReset: () => void;
}

const FONT_FAMILIES = [
  { value: "sans", label: "Modern Sans", mood: "Clean & professional" },
  { value: "'Helvetica Neue', Arial, sans-serif", label: "Helvetica Classic", mood: "Timeless & neutral" },
  { value: "'Calibri', 'Segoe UI', sans-serif", label: "Calibri Friendly", mood: "Warm & approachable" },
  { value: "serif", label: "Elegant Serif", mood: "Refined & authoritative" },
  { value: "'IBM Plex Sans', 'Inter', 'Segoe UI', sans-serif", label: "IBM Plex", mood: "Technical & readable" },
  { value: "mono", label: "Mono Tech", mood: "Developer & engineering" },
];

const COLOR_PRESETS = [
  { name: "Midnight", primary: "#1e293b", secondary: "#b8860b", accent: "#f1c40f" },
  { name: "Terracotta", primary: "#B84A2A", secondary: "#2D3436", accent: "#F5EDE3" },
  { name: "Nordic", primary: "#2D4059", secondary: "#EA5455", accent: "#F07B3F" },
  { name: "Forest", primary: "#1B4332", secondary: "#D4A373", accent: "#FEFAE0" },
  { name: "Slate", primary: "#334155", secondary: "#0ea5e9", accent: "#38bdf8" },
  { name: "Wine", primary: "#4A0E0E", secondary: "#C9A84C", accent: "#F5F0E8" },
];

export function TemplateCustomizer({
  customization,
  onChange,
  onReset,
}: TemplateCustomizerProps) {
  const [fineTuneOpen, setFineTuneOpen] = useState(false);

  const applyStylePack = (pack: (typeof STYLE_PACKS)[number]) => {
    const { ideThemeId: _, ...current } = customization;
    const updates = { ...pack.customization };
    onChange(updates);
  };

  return (
    <div className="space-y-5">
      {/* Style overview + reset */}
      <div className="rounded-xl border bg-muted/40 p-4 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Style overview</p>
          <p className="text-sm font-semibold">
            {(() => {
              const fontValue = customization.fontFamily;
              if (fontValue === "sans") return "Modern Sans";
              if (fontValue === "serif") return "Elegant Serif";
              if (fontValue === "mono") return "Mono Tech";
              if (fontValue?.includes("Helvetica")) return "Helvetica Classic";
              if (fontValue?.includes("Calibri")) return "Calibri Friendly";
              if (fontValue?.includes("IBM Plex Sans")) return "IBM Plex";
              return "Custom Font Stack";
            })()}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: customization.primaryColor }} />
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: customization.secondaryColor }} />
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: customization.accentColor }} />
            <span>
              {customization.fontSize}px · {customization.lineSpacing}x · {customization.sectionSpacing}px
            </span>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={onReset} className="gap-2">
          <RefreshCcw className="w-3.5 h-3.5" />
          Reset
        </Button>
      </div>

      {/* Style Packs */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <Label className="text-sm font-semibold">Style Packs</Label>
          <span className="text-[11px] text-muted-foreground ml-auto">One-click complete styles</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {STYLE_PACKS.map((pack) => (
            <button
              key={pack.name}
              onClick={() => applyStylePack(pack)}
              className="group rounded-xl border bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md hover:border-primary/30"
            >
              <div className="flex gap-1 mb-2">
                <span className="h-4 flex-1 rounded-sm" style={{ background: pack.customization.primaryColor }} />
                <span className="h-4 flex-1 rounded-sm" style={{ background: pack.customization.secondaryColor }} />
                <span className="h-4 flex-1 rounded-sm" style={{ background: pack.customization.accentColor }} />
              </div>
              <p className="text-xs font-semibold text-foreground leading-tight">{pack.name}</p>
              <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">{pack.description}</p>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Color Presets */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          <Label className="text-sm font-semibold">Color Palette</Label>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {COLOR_PRESETS.map((preset) => (
            <button
              key={preset.name}
              onClick={() =>
                onChange({
                  primaryColor: preset.primary,
                  secondaryColor: preset.secondary,
                  accentColor: preset.accent,
                })
              }
              className="group rounded-lg border bg-muted/40 p-2.5 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
            >
              <span className="text-[11px] font-medium text-foreground">{preset.name}</span>
              <div className="flex gap-1.5 mt-1.5">
                <span className="h-6 flex-1 rounded-md border" style={{ background: preset.primary }} />
                <span className="h-6 flex-1 rounded-md border" style={{ background: preset.secondary }} />
                <span className="h-6 flex-1 rounded-md border" style={{ background: preset.accent }} />
              </div>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Type Style */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Type className="w-4 h-4" />
          <Label className="text-sm font-semibold">Type Style</Label>
        </div>
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
                <div className="flex flex-col">
                  <span>{font.label}</span>
                  <span className="text-[10px] text-muted-foreground">{font.mood}</span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Fine-tune collapsible */}
      <Collapsible open={fineTuneOpen} onOpenChange={setFineTuneOpen}>
        <CollapsibleTrigger asChild>
          <button className="flex items-center justify-between w-full py-2 group">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Fine-tune</span>
              <span className="text-[11px] text-muted-foreground">Colors, size, spacing</span>
            </div>
            <ChevronDown className={cn(
              "w-4 h-4 text-muted-foreground transition-transform duration-200",
              fineTuneOpen && "rotate-180"
            )} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-3">
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
                  onChange={(e) =>
                    onChange({
                      secondaryColor: e.target.value,
                      accentColor: e.target.value,
                    })
                  }
                  className="h-10 w-10 rounded border"
                />
                <div>
                  <p className="text-xs text-muted-foreground">Accent color</p>
                  <p className="text-sm font-medium">{customization.secondaryColor}</p>
                </div>
              </div>
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label className="text-xs text-muted-foreground">Accent</Label>
              <div className="flex items-center gap-3 rounded-lg border bg-muted/30 p-2">
                <input
                  type="color"
                  value={customization.accentColor}
                  onChange={(e) => onChange({ accentColor: e.target.value })}
                  className="h-10 w-10 rounded border"
                />
                <div>
                  <p className="text-xs text-muted-foreground">Highlight color</p>
                  <p className="text-sm font-medium">{customization.accentColor}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3">
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
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
