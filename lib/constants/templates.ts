/**
 * ATS Compatibility Levels
 * - excellent: Single-column, standard fonts, no graphics - 95%+ parse rate
 * - good: Simple layout, minimal styling - 85%+ parse rate
 * - moderate: Multi-column but parseable - 70%+ parse rate
 * - low: Complex layouts, graphics-heavy - may have parsing issues
 */
export type ATSCompatibility = "excellent" | "good" | "moderate" | "low";

/**
 * Customization Support Levels
 * - full: All options (colors, fonts, spacing) work in PDF export
 * - partial: Some options work (e.g., colors but not fonts)
 * - preview-only: Customization works in preview but not PDF export
 * - none: Template uses fixed styling
 */
export type CustomizationSupport = "full" | "partial" | "preview-only" | "none";

export type PhotoShape = "circular" | "square" | "rounded";

export interface TemplateFeatures {
  /** ATS compatibility rating */
  atsCompatibility: ATSCompatibility;
  /** Customization support level */
  customizationSupport: CustomizationSupport;
  /** Which customization options are supported */
  supportedCustomizations: {
    primaryColor: boolean;
    secondaryColor: boolean;
    accentColor: boolean;
    fontFamily: boolean;
    fontSize: boolean;
    lineSpacing: boolean;
    sectionSpacing: boolean;
  };
  /** Has PDF export template */
  hasPDFTemplate: boolean;
  /** Whether template supports profile photo */
  supportsPhoto: boolean;
  /** Shape of photo in this template */
  photoShape?: PhotoShape;
  /** Additional feature flags */
  flags?: string[];
}

export interface Template {
  id: string;
  name: string;
  description: string;
  color: string;
  borderColor: string;
  category: "professional" | "executive" | "creative" | "technical";
  industry: string;
  style: string;
  popularity: number;
  features: TemplateFeatures;
}

export const TEMPLATES: Template[] = [
  {
    id: "modern",
    name: "Modern",
    description: "Clean sidebar layout with teal accent",
    color: "from-teal-500/10 to-emerald-500/10",
    borderColor: "hover:border-teal-500/50",
    category: "professional",
    industry: "Technology",
    style: "Modern",
    popularity: 95,
    features: {
      atsCompatibility: "moderate",
      customizationSupport: "preview-only",
      supportedCustomizations: {
        primaryColor: false,
        secondaryColor: false,
        accentColor: false,
        fontFamily: false,
        fontSize: false,
        lineSpacing: false,
        sectionSpacing: false,
      },
      hasPDFTemplate: true,
      supportsPhoto: true,
      photoShape: "circular",
      flags: ["two-column", "sidebar"],
    },
  },
  {
    id: "classic",
    name: "Classic",
    description: "Traditional elegance with serif typography",
    color: "from-slate-500/10 to-gray-500/10",
    borderColor: "hover:border-slate-500/50",
    category: "professional",
    industry: "Finance",
    style: "Professional",
    popularity: 88,
    features: {
      atsCompatibility: "good",
      customizationSupport: "preview-only",
      supportedCustomizations: {
        primaryColor: false,
        secondaryColor: false,
        accentColor: false,
        fontFamily: false,
        fontSize: false,
        lineSpacing: false,
        sectionSpacing: false,
      },
      hasPDFTemplate: true,
      supportsPhoto: true,
      photoShape: "circular",
      flags: ["single-column", "serif"],
    },
  },
  {
    id: "executive",
    name: "Executive",
    description: "Premium design with monogram accent",
    color: "from-amber-600/10 to-yellow-600/10",
    borderColor: "hover:border-amber-600/50",
    category: "executive",
    industry: "Finance",
    style: "Professional",
    popularity: 82,
    features: {
      atsCompatibility: "moderate",
      customizationSupport: "preview-only",
      supportedCustomizations: {
        primaryColor: false,
        secondaryColor: false,
        accentColor: false,
        fontFamily: false,
        fontSize: false,
        lineSpacing: false,
        sectionSpacing: false,
      },
      hasPDFTemplate: true,
      supportsPhoto: true,
      photoShape: "square",
      flags: ["two-column", "monogram"],
    },
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Swiss-inspired clean grid design",
    color: "from-gray-500/10 to-zinc-500/10",
    borderColor: "hover:border-gray-500/50",
    category: "professional",
    industry: "Technology",
    style: "Minimal",
    popularity: 90,
    features: {
      atsCompatibility: "good",
      customizationSupport: "preview-only",
      supportedCustomizations: {
        primaryColor: false,
        secondaryColor: false,
        accentColor: false,
        fontFamily: false,
        fontSize: false,
        lineSpacing: false,
        sectionSpacing: false,
      },
      hasPDFTemplate: true,
      supportsPhoto: true,
      photoShape: "circular",
      flags: ["single-column", "minimal"],
    },
  },
  {
    id: "creative",
    name: "Creative",
    description: "Editorial magazine-style layout",
    color: "from-orange-500/10 to-red-500/10",
    borderColor: "hover:border-orange-500/50",
    category: "creative",
    industry: "Creative",
    style: "Creative",
    popularity: 78,
    features: {
      atsCompatibility: "low",
      customizationSupport: "preview-only",
      supportedCustomizations: {
        primaryColor: false,
        secondaryColor: false,
        accentColor: false,
        fontFamily: false,
        fontSize: false,
        lineSpacing: false,
        sectionSpacing: false,
      },
      hasPDFTemplate: true,
      supportsPhoto: true,
      photoShape: "rounded",
      flags: ["two-column", "graphics"],
    },
  },
  {
    id: "technical",
    name: "Technical",
    description: "Dark IDE-inspired developer theme",
    color: "from-blue-600/10 to-cyan-600/10",
    borderColor: "hover:border-blue-600/50",
    category: "technical",
    industry: "Technology",
    style: "Modern",
    popularity: 85,
    features: {
      atsCompatibility: "low",
      customizationSupport: "preview-only",
      supportedCustomizations: {
        primaryColor: false,
        secondaryColor: false,
        accentColor: false,
        fontFamily: false,
        fontSize: false,
        lineSpacing: false,
        sectionSpacing: false,
      },
      hasPDFTemplate: true,
      supportsPhoto: true,
      photoShape: "square",
      flags: ["dark-theme", "monospace"],
    },
  },
  {
    id: "adaptive",
    name: "Smart Template",
    description: "Auto-adapts layout to your content",
    color: "from-indigo-500/10 to-violet-500/10",
    borderColor: "hover:border-indigo-500/50",
    category: "professional",
    industry: "General",
    style: "Adaptive",
    popularity: 100,
    features: {
      atsCompatibility: "good",
      customizationSupport: "preview-only",
      supportedCustomizations: {
        primaryColor: false,
        secondaryColor: false,
        accentColor: false,
        fontFamily: false,
        fontSize: false,
        lineSpacing: false,
        sectionSpacing: false,
      },
      hasPDFTemplate: true,
      supportsPhoto: true,
      photoShape: "circular",
      flags: ["smart-layout", "responsive"],
    },
  },
  {
    id: "timeline",
    name: "Timeline",
    description: "Visual career journey storytelling",
    color: "from-slate-600/10 to-orange-500/10",
    borderColor: "hover:border-orange-500/50",
    category: "creative",
    industry: "Creative",
    style: "Visual",
    popularity: 92,
    features: {
      atsCompatibility: "low",
      customizationSupport: "preview-only",
      supportedCustomizations: {
        primaryColor: false,
        secondaryColor: false,
        accentColor: false,
        fontFamily: false,
        fontSize: false,
        lineSpacing: false,
        sectionSpacing: false,
      },
      hasPDFTemplate: true,
      supportsPhoto: true,
      photoShape: "circular",
      flags: ["timeline", "visual"],
    },
  },
  {
    id: "ivy",
    name: "Ivy League",
    description: "Finance & consulting standard format",
    color: "from-slate-600/10 to-zinc-600/10",
    borderColor: "hover:border-slate-600/50",
    category: "professional",
    industry: "Finance",
    style: "Classic",
    popularity: 89,
    features: {
      atsCompatibility: "excellent",
      customizationSupport: "preview-only",
      supportedCustomizations: {
        primaryColor: false,
        secondaryColor: false,
        accentColor: false,
        fontFamily: false,
        fontSize: false,
        lineSpacing: false,
        sectionSpacing: false,
      },
      hasPDFTemplate: true,
      supportsPhoto: false,
      flags: ["single-column", "traditional"],
    },
  },
  {
    id: "ats-clarity",
    name: "Clarity",
    description: "Single-column, ATS-optimized with bold headings",
    color: "from-cyan-500/10 to-blue-500/10",
    borderColor: "hover:border-cyan-500/50",
    category: "professional",
    industry: "General",
    style: "ATS",
    popularity: 91,
    features: {
      atsCompatibility: "excellent",
      customizationSupport: "full",
      supportedCustomizations: {
        primaryColor: true,
        secondaryColor: true,
        accentColor: true,
        fontFamily: true,
        fontSize: true,
        lineSpacing: true,
        sectionSpacing: true,
      },
      hasPDFTemplate: true,
      supportsPhoto: false,
      flags: ["ats-optimized", "single-column"],
    },
  },
  {
    id: "ats-structured",
    name: "Structured",
    description: "Strict grid, left-aligned, parser-safe typography",
    color: "from-emerald-500/10 to-green-500/10",
    borderColor: "hover:border-emerald-500/50",
    category: "professional",
    industry: "Technology",
    style: "ATS",
    popularity: 88,
    features: {
      atsCompatibility: "excellent",
      customizationSupport: "full",
      supportedCustomizations: {
        primaryColor: true,
        secondaryColor: true,
        accentColor: true,
        fontFamily: true,
        fontSize: true,
        lineSpacing: true,
        sectionSpacing: true,
      },
      hasPDFTemplate: true,
      supportsPhoto: false,
      flags: ["ats-optimized", "grid-layout"],
    },
  },
  {
    id: "ats-compact",
    name: "Compact",
    description: "Condensed layout for early-career and quick scans",
    color: "from-purple-500/10 to-indigo-500/10",
    borderColor: "hover:border-purple-500/50",
    category: "professional",
    industry: "General",
    style: "ATS",
    popularity: 86,
    features: {
      atsCompatibility: "excellent",
      customizationSupport: "full",
      supportedCustomizations: {
        primaryColor: true,
        secondaryColor: true,
        accentColor: true,
        fontFamily: true,
        fontSize: true,
        lineSpacing: true,
        sectionSpacing: true,
      },
      hasPDFTemplate: true,
      supportsPhoto: false,
      flags: ["ats-optimized", "compact"],
    },
  },
];

export type TemplateId = (typeof TEMPLATES)[number]["id"];

// Export as 'templates' for compatibility
export const templates = TEMPLATES;

/**
 * Get ATS compatibility label and color for display
 */
export function getATSBadgeInfo(compatibility: ATSCompatibility): {
  label: string;
  color: string;
  bgColor: string;
  description: string;
} {
  switch (compatibility) {
    case "excellent":
      return {
        label: "ATS Excellent",
        color: "text-emerald-700",
        bgColor: "bg-emerald-100",
        description: "95%+ parse rate - optimized for applicant tracking systems",
      };
    case "good":
      return {
        label: "ATS Good",
        color: "text-blue-700",
        bgColor: "bg-blue-100",
        description: "85%+ parse rate - works well with most ATS systems",
      };
    case "moderate":
      return {
        label: "ATS Moderate",
        color: "text-amber-700",
        bgColor: "bg-amber-100",
        description: "70%+ parse rate - some ATS may have issues with layout",
      };
    case "low":
      return {
        label: "Design Focus",
        color: "text-slate-700",
        bgColor: "bg-slate-100",
        description: "Best for direct applications - complex layout may affect ATS parsing",
      };
  }
}

/**
 * Get customization support info for display
 */
export function getCustomizationInfo(support: CustomizationSupport): {
  label: string;
  description: string;
} {
  switch (support) {
    case "full":
      return {
        label: "Full Customization",
        description: "All styling options work in both preview and PDF export",
      };
    case "partial":
      return {
        label: "Partial Customization",
        description: "Some options work in PDF export",
      };
    case "preview-only":
      return {
        label: "Preview Customization",
        description: "Customization works in preview; PDF uses template defaults",
      };
    case "none":
      return {
        label: "Fixed Style",
        description: "Template uses its signature styling",
      };
  }
}
