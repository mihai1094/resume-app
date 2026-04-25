"use client";

import { useState } from "react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Palette, Type, RefreshCcw, Sparkles, ChevronDown, SlidersHorizontal, LayoutPanelTop, Check } from "lucide-react";
import { getStylePacksForTemplate } from "@/lib/constants/style-packs";
import { getColorTriadsForTemplate } from "@/lib/constants/color-triads";
import { supportsSkillsAtTop } from "@/lib/constants/template-capabilities";
import { SectionOrderSchematic } from "./section-order-schematic";
import { ColorSwatchPopover } from "./color-swatch-popover";
import { NumericStepper } from "./numeric-stepper";
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
  /**
   * Section ordering. Only honored by templates in the capability whitelist
   * (see lib/constants/template-capabilities.ts). Defaults to experience-first.
   */
  sectionOrder?: "experience-first" | "skills-first";
}

interface TemplateCustomizerProps {
  customization: TemplateCustomization;
  onChange: (customization: Partial<TemplateCustomization>) => void;
  onReset: () => void;
  /**
   * When provided, Style Packs and Color Palette are filtered to options
   * that match the template's aesthetic + contrast requirements. Omit to
   * surface the full library (legacy behavior).
   */
  templateId?: string;
}

/**
 * Font options — each `value` is a semantic key resolved to a loaded
 * next/font stack by `getTemplateFontFamily` (lib/fonts/template-fonts.ts).
 *
 * Legacy raw-stack values from old saved resumes (e.g. "'IBM Plex Sans',...")
 * still render via the legacy fallback in the resolver but are no longer
 * offered as new choices.
 */
const FONT_FAMILIES = [
  // Sans Serif
  { value: "sans", label: "Modern Sans", mood: "Clean & professional", category: "sans" as const, preview: "var(--font-inter), ui-sans-serif, system-ui, sans-serif" },
  { value: "humanist", label: "Warm Humanist", mood: "Approachable & readable", category: "sans" as const, preview: "var(--font-lato-raw), 'Helvetica Neue', Arial, sans-serif" },
  { value: "geometric", label: "Geometric", mood: "Confident & modern", category: "sans" as const, preview: "var(--font-dm-sans), var(--font-inter), sans-serif" },
  { value: "modern", label: "Contemporary", mood: "Sharp & versatile", category: "sans" as const, preview: "var(--font-montserrat-raw), 'Helvetica Neue', Arial, sans-serif" },
  { value: "versatile", label: "Versatile Sans", mood: "Neutral & universal", category: "sans" as const, preview: "var(--font-roboto-raw), 'Helvetica Neue', Arial, sans-serif" },
  { value: "friendly", label: "Friendly Sans", mood: "Open & highly legible", category: "sans" as const, preview: "var(--font-open-sans-raw), 'Helvetica Neue', Arial, sans-serif" },
  { value: "pop-geometric", label: "Pop Geometric", mood: "Trendy & rounded", category: "sans" as const, preview: "var(--font-poppins-raw), 'Helvetica Neue', Arial, sans-serif" },
  { value: "elegant", label: "Elegant Thin", mood: "Sophisticated & airy", category: "sans" as const, preview: "var(--font-raleway-raw), 'Helvetica Neue', Arial, sans-serif" },
  { value: "soft-rounded", label: "Soft Rounded", mood: "Warm & approachable", category: "sans" as const, preview: "var(--font-nunito-sans-raw), 'Helvetica Neue', Arial, sans-serif" },
  // Serif
  { value: "serif", label: "Editorial Serif", mood: "Refined & authoritative", category: "serif" as const, preview: "var(--font-source-serif-4), Georgia, 'Times New Roman', serif" },
  { value: "reading-serif", label: "Reading Serif", mood: "Sturdy & legible", category: "serif" as const, preview: "var(--font-merriweather-raw), Georgia, 'Times New Roman', serif" },
  { value: "classic-serif", label: "Classic Serif", mood: "Traditional gravitas", category: "serif" as const, preview: "var(--font-eb-garamond-raw), Georgia, 'Times New Roman', serif" },
  { value: "refined-serif", label: "Refined Garamond", mood: "Elegant & luxe", category: "serif" as const, preview: "var(--font-cormorant-garamond), Georgia, 'Times New Roman', serif" },
  { value: "display-serif", label: "Display Serif", mood: "High-contrast statement", category: "serif" as const, preview: "var(--font-playfair), Georgia, 'Times New Roman', serif" },
  { value: "transitional-serif", label: "Classic Baskerville", mood: "Bookish & authoritative", category: "serif" as const, preview: "var(--font-libre-baskerville-raw), Georgia, 'Times New Roman', serif" },
  // Mono
  { value: "mono", label: "Technical Mono", mood: "Developer & engineering", category: "mono" as const, preview: "var(--font-jetbrains-mono-raw), 'Courier New', monospace" },
];

const FONT_CATEGORIES = [
  { key: "sans" as const, label: "Sans Serif" },
  { key: "serif" as const, label: "Serif" },
  { key: "mono" as const, label: "Mono" },
];

export function TemplateCustomizer({
  customization,
  onChange,
  onReset,
  templateId,
}: TemplateCustomizerProps) {
  const [fineTuneOpen, setFineTuneOpen] = useState(false);

  // Template-aware lists — when no templateId is given, fall back to the full library.
  const stylePacks = templateId
    ? getStylePacksForTemplate(templateId)
    : getStylePacksForTemplate("__all__"); // unknown id → full list via fallback
  const colorTriads = getColorTriadsForTemplate(templateId ?? "__all__");

  const applyStylePack = (pack: (typeof stylePacks)[number]) => {
    onChange({ ...pack.customization });
  };

  const skillsAtTopSupported = supportsSkillsAtTop(templateId);
  const currentSectionOrder = customization.sectionOrder ?? "experience-first";

  return (
    <div className="space-y-5">
      {/* Style overview + reset */}
      <div className="rounded-xl border bg-muted/40 p-4 flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">Style overview</p>
          <p className="text-sm font-semibold">
            {(() => {
              const fontValue = customization.fontFamily;
              const match = FONT_FAMILIES.find((f) => f.value === fontValue);
              if (match) return match.label;
              // Legacy saved values — label by content sniff.
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

      {/* Layout */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <LayoutPanelTop className="w-4 h-4" />
          <Label className="text-sm font-semibold">Layout</Label>
          <span className="text-[11px] text-muted-foreground ml-auto">
            Section order
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <LayoutCard
            label="Experience first"
            caption="Default"
            selected={currentSectionOrder === "experience-first"}
            onSelect={() => onChange({ sectionOrder: "experience-first" })}
            order="experience-first"
            disabled={false}
          />
          <LayoutCard
            label="Skills first"
            caption={skillsAtTopSupported ? "Career pivots" : "Not in this template"}
            selected={currentSectionOrder === "skills-first" && skillsAtTopSupported}
            onSelect={() =>
              skillsAtTopSupported &&
              onChange({ sectionOrder: "skills-first" })
            }
            order="skills-first"
            disabled={!skillsAtTopSupported}
          />
        </div>
      </div>

      <Separator />

      {/* Style Packs */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary" />
          <Label className="text-sm font-semibold">Style Packs</Label>
          <span className="text-[11px] text-muted-foreground ml-auto">One-click complete styles</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {stylePacks.map((pack) => (
            <button
              key={pack.id}
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
          {colorTriads.map((triad) => (
            <button
              key={triad.id}
              onClick={() =>
                onChange({
                  primaryColor: triad.primary,
                  secondaryColor: triad.secondary,
                  accentColor: triad.accent,
                })
              }
              className="group rounded-lg border bg-muted/40 p-2.5 text-left transition hover:-translate-y-0.5 hover:shadow-sm"
            >
              <span className="text-[11px] font-medium text-foreground">{triad.name}</span>
              <div className="flex gap-1.5 mt-1.5">
                <span className="h-6 flex-1 rounded-md border" style={{ background: triad.primary }} />
                <span className="h-6 flex-1 rounded-md border" style={{ background: triad.secondary }} />
                <span className="h-6 flex-1 rounded-md border" style={{ background: triad.accent }} />
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
        <div className="rounded-xl border overflow-hidden">
          <div className="max-h-[280px] overflow-y-auto">
            {FONT_CATEGORIES.map((cat) => {
              const fonts = FONT_FAMILIES.filter((f) => f.category === cat.key);
              if (fonts.length === 0) return null;
              return (
                <div key={cat.key}>
                  <div className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm px-3 py-1.5 border-b">
                    <span className="text-[10px] uppercase tracking-[0.1em] font-medium text-muted-foreground">
                      {cat.label}
                    </span>
                  </div>
                  {fonts.map((font) => {
                    const selected = customization.fontFamily === font.value;
                    return (
                      <button
                        key={font.value}
                        type="button"
                        onClick={() => onChange({ fontFamily: font.value })}
                        aria-pressed={selected}
                        className={cn(
                          "flex items-center gap-3 w-full px-3 py-2.5 text-left transition-colors",
                          "hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-inset",
                          selected
                            ? "bg-primary/5 border-l-2 border-l-primary"
                            : "border-l-2 border-l-transparent"
                        )}
                      >
                        <span
                          className="text-xl leading-none w-10 shrink-0 text-center"
                          style={{ fontFamily: font.preview }}
                          aria-hidden="true"
                        >
                          Ag
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-semibold text-foreground leading-tight truncate">
                            {font.label}
                          </p>
                          <p className="text-[10px] text-muted-foreground leading-tight mt-0.5 truncate">
                            {font.mood}
                          </p>
                        </div>
                        {selected && (
                          <Check className="w-4 h-4 shrink-0 text-primary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
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
        <CollapsibleContent className="space-y-3 pt-3">
          {/* Color swatches row */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground shrink-0">Colors</span>
            <div className="flex items-center gap-3">
              <ColorSwatchPopover
                label="Primary"
                value={customization.primaryColor}
                onChange={(hex) => onChange({ primaryColor: hex })}
              />
              <ColorSwatchPopover
                label="Secondary"
                value={customization.secondaryColor}
                onChange={(hex) =>
                  onChange({ secondaryColor: hex, accentColor: hex })
                }
              />
              <ColorSwatchPopover
                label="Accent"
                value={customization.accentColor}
                onChange={(hex) => onChange({ accentColor: hex })}
              />
            </div>
          </div>

          {/* Numeric steppers */}
          <NumericStepper
            label="Font Size"
            value={customization.fontSize}
            min={10}
            max={18}
            step={1}
            unit="px"
            onChange={(v) => onChange({ fontSize: v })}
          />
          <NumericStepper
            label="Line Spacing"
            value={customization.lineSpacing}
            min={1}
            max={2}
            step={0.1}
            unit="x"
            onChange={(v) => onChange({ lineSpacing: v })}
          />
          <NumericStepper
            label="Section Spacing"
            value={customization.sectionSpacing}
            min={8}
            max={32}
            step={2}
            unit="px"
            onChange={(v) => onChange({ sectionSpacing: v })}
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}

/**
 * Layout card — tile with a stacked-bar schematic + label. Selected state
 * uses a primary ring + accent dot. Disabled state dims the tile and
 * suppresses interaction; the caller shows the "browse" link separately.
 */
function LayoutCard({
  label,
  caption,
  selected,
  disabled,
  onSelect,
  order,
}: {
  label: string;
  caption: string;
  selected: boolean;
  disabled: boolean;
  onSelect: () => void;
  order: "experience-first" | "skills-first";
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={disabled}
      aria-pressed={selected}
      className={cn(
        "group relative rounded-xl border bg-card p-3 text-left transition-all",
        !disabled && "hover:-translate-y-0.5 hover:shadow-sm hover:border-primary/30",
        selected && !disabled && "border-primary ring-2 ring-primary/20",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      <div className="flex items-start gap-2.5">
        <SectionOrderSchematic
          order={order}
          size="md"
          highlighted={selected && !disabled}
          muted={disabled}
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-foreground leading-tight">
            {label}
          </p>
          <p className="text-[10px] text-muted-foreground leading-tight mt-0.5">
            {caption}
          </p>
        </div>
      </div>
      {selected && !disabled && (
        <span
          className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-amber-500"
          aria-hidden="true"
        />
      )}
    </button>
  );
}
