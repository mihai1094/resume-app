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

export type TemplateLayout = "single-column" | "two-column" | "sidebar";
export type TemplateStyleCategory =
  | "modern"
  | "classic"
  | "creative"
  | "ats-optimized";

/** Valid style categories for URL/filter validation */
export const TEMPLATE_STYLE_CATEGORIES: TemplateStyleCategory[] = [
  "modern",
  "classic",
  "creative",
  "ats-optimized",
];

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
  /** Layout type for filtering */
  layout: TemplateLayout;
  /** Number of columns (1 or 2) */
  columns: 1 | 2;
  /** Style category for filtering */
  styleCategory: TemplateStyleCategory;
  /** Target industries (multiple allowed) */
  targetIndustries: string[];
}

// Templates ordered by market popularity (based on Resume.io, Canva, Zety, Novoresume analysis)
export const TEMPLATES: Template[] = [
  // 1. Clarity - ATS-optimized, most universally applicable
  {
    id: "ats-clarity",
    name: "Clarity",
    description: "Single-column, ATS-optimized with bold headings",
    color: "from-cyan-500/10 to-blue-500/10",
    borderColor: "hover:border-cyan-500/50",
    category: "professional",
    industry: "General",
    style: "ATS",
    popularity: 98,
    layout: "single-column",
    columns: 1,
    styleCategory: "ats-optimized",
    targetIndustries: ["General", "Technology", "Corporate", "Government"],
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
  // 2. Minimalist - Clean, modern, popular across industries
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Swiss-inspired clean grid design",
    color: "from-gray-500/10 to-zinc-500/10",
    borderColor: "hover:border-gray-500/50",
    category: "professional",
    industry: "Technology",
    style: "Minimal",
    popularity: 96,
    layout: "two-column",
    columns: 2,
    styleCategory: "modern",
    targetIndustries: ["Technology", "Design", "Architecture", "General"],
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
      flags: ["single-column", "minimal"],
    },
  },
  // 3. Modern - Popular sidebar layout for tech
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
    layout: "sidebar",
    columns: 2,
    styleCategory: "modern",
    targetIndustries: ["Technology", "Startups", "Marketing"],
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
  // 4. Cubic - ATS-friendly with modern look
  {
    id: "cubic",
    name: "Cubic",
    description: "Clean scannable layout with accent stripe - ATS friendly",
    color: "from-cyan-500/10 to-sky-500/10",
    borderColor: "hover:border-cyan-500/50",
    category: "professional",
    industry: "Technology",
    style: "Modern",
    popularity: 94,
    layout: "single-column",
    columns: 1,
    styleCategory: "modern",
    targetIndustries: ["Technology", "Engineering", "Science", "Corporate"],
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
      flags: ["ats-friendly", "single-column", "accent-stripe"],
    },
  },
  // 5. Classic - Traditional, good for finance/consulting
  {
    id: "classic",
    name: "Classic",
    description: "Traditional elegance with serif typography",
    color: "from-slate-500/10 to-gray-500/10",
    borderColor: "hover:border-slate-500/50",
    category: "professional",
    industry: "Finance",
    style: "Professional",
    popularity: 93,
    layout: "two-column",
    columns: 2,
    styleCategory: "classic",
    targetIndustries: ["Finance", "Legal", "Consulting", "Healthcare"],
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
      flags: ["single-column", "serif"],
    },
  },
  // 6. Ivy League - Finance/consulting standard
  {
    id: "ivy",
    name: "Ivy League",
    description: "Finance & consulting standard format",
    color: "from-slate-600/10 to-zinc-600/10",
    borderColor: "hover:border-slate-600/50",
    category: "professional",
    industry: "Finance",
    style: "Classic",
    popularity: 92,
    layout: "single-column",
    columns: 1,
    styleCategory: "classic",
    targetIndustries: ["Finance", "Consulting", "Legal", "Investment Banking"],
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
  // 7. Dublin - Professional with photo option
  {
    id: "dublin",
    name: "Dublin",
    description: "Professional design with photo and elegant typography",
    color: "from-slate-500/10 to-gray-500/10",
    borderColor: "hover:border-slate-500/50",
    category: "professional",
    industry: "Business",
    style: "Professional",
    popularity: 91,
    layout: "two-column",
    columns: 2,
    styleCategory: "classic",
    targetIndustries: ["Business", "HR", "Administration", "Healthcare"],
    features: {
      atsCompatibility: "moderate",
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
      supportsPhoto: true,
      photoShape: "rounded",
      flags: ["photo", "elegant", "two-column"],
    },
  },
  // 8. Smart Template - Auto-adapts
  {
    id: "adaptive",
    name: "Smart Template",
    description: "Auto-adapts layout to your content",
    color: "from-indigo-500/10 to-violet-500/10",
    borderColor: "hover:border-indigo-500/50",
    category: "professional",
    industry: "General",
    style: "Adaptive",
    popularity: 90,
    layout: "two-column",
    columns: 2,
    styleCategory: "modern",
    targetIndustries: ["General", "Technology", "Business", "Startups"],
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
      flags: ["smart-layout", "responsive"],
    },
  },
  // 9. Cascade - Modern professional with sidebar
  {
    id: "cascade",
    name: "Cascade",
    description:
      "Two-column design with skill progress bars and elegant sidebar",
    color: "from-blue-500/10 to-indigo-500/10",
    borderColor: "hover:border-blue-500/50",
    category: "professional",
    industry: "Corporate",
    style: "Modern Professional",
    popularity: 89,
    layout: "sidebar",
    columns: 2,
    styleCategory: "modern",
    targetIndustries: ["Corporate", "Finance", "Consulting", "Marketing"],
    features: {
      atsCompatibility: "moderate",
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
      supportsPhoto: true,
      photoShape: "circular",
      flags: ["skill-bars", "timeline", "sidebar"],
    },
  },
  // 10. Structured - ATS-optimized grid
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
    layout: "two-column",
    columns: 2,
    styleCategory: "ats-optimized",
    targetIndustries: ["Technology", "Engineering", "Corporate", "Healthcare"],
    features: {
      atsCompatibility: "good",
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
  // 11. Bold - Executive typography
  {
    id: "bold",
    name: "Bold",
    description:
      "Strong typography focus with prominent headers and clean layout",
    color: "from-slate-500/10 to-gray-500/10",
    borderColor: "hover:border-slate-500/50",
    category: "executive",
    industry: "Business",
    style: "Bold",
    popularity: 87,
    layout: "single-column",
    columns: 1,
    styleCategory: "modern",
    targetIndustries: ["Executive", "Sales", "Management", "Corporate"],
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
      flags: ["ats-friendly", "single-column", "typography-focused"],
    },
  },
  // 12. Executive - Premium design
  {
    id: "executive",
    name: "Executive",
    description: "Premium design with monogram accent",
    color: "from-amber-600/10 to-yellow-600/10",
    borderColor: "hover:border-amber-600/50",
    category: "executive",
    industry: "Finance",
    style: "Professional",
    popularity: 86,
    layout: "two-column",
    columns: 2,
    styleCategory: "classic",
    targetIndustries: ["Finance", "Executive", "Consulting", "Management"],
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
  // 13. Compact - Entry-level
  {
    id: "ats-compact",
    name: "Compact",
    description: "Condensed layout for early-career and quick scans",
    color: "from-purple-500/10 to-indigo-500/10",
    borderColor: "hover:border-purple-500/50",
    category: "professional",
    industry: "General",
    style: "ATS",
    popularity: 85,
    layout: "single-column",
    columns: 1,
    styleCategory: "ats-optimized",
    targetIndustries: ["General", "Entry-Level", "Internships", "Retail"],
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
  // 14. Technical - For developers
  {
    id: "technical",
    name: "Technical",
    description: "Dark IDE-inspired developer theme",
    color: "from-blue-600/10 to-cyan-600/10",
    borderColor: "hover:border-blue-600/50",
    category: "technical",
    industry: "Technology",
    style: "Modern",
    popularity: 84,
    layout: "single-column",
    columns: 1,
    styleCategory: "creative",
    targetIndustries: ["Technology", "Engineering", "Data Science"],
    features: {
      atsCompatibility: "low",
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
      supportsPhoto: true,
      photoShape: "square",
      flags: ["dark-theme", "monospace", "ide-themes"],
    },
  },
  // 15. Timeline - Visual storytelling
  {
    id: "timeline",
    name: "Timeline",
    description: "Visual career journey storytelling",
    color: "from-slate-600/10 to-orange-500/10",
    borderColor: "hover:border-orange-500/50",
    category: "creative",
    industry: "Creative",
    style: "Visual",
    popularity: 82,
    layout: "two-column",
    columns: 2,
    styleCategory: "creative",
    targetIndustries: ["Creative", "Marketing", "Education", "Nonprofit"],
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
  // 16. Creative - For creative industries
  {
    id: "creative",
    name: "Creative",
    description: "Editorial magazine-style layout",
    color: "from-orange-500/10 to-red-500/10",
    borderColor: "hover:border-orange-500/50",
    category: "creative",
    industry: "Creative",
    style: "Creative",
    popularity: 80,
    layout: "two-column",
    columns: 2,
    styleCategory: "creative",
    targetIndustries: ["Creative", "Marketing", "Media", "Design"],
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
  // 17. Infographic - Most visual/creative
  {
    id: "infographic",
    name: "Infographic",
    description: "Visual design with skill charts, stats, and timeline",
    color: "from-orange-500/10 to-amber-500/10",
    borderColor: "hover:border-orange-500/50",
    category: "creative",
    industry: "Creative",
    style: "Visual",
    popularity: 78,
    layout: "sidebar",
    columns: 2,
    styleCategory: "creative",
    targetIndustries: ["Creative", "Marketing", "Design", "Startups"],
    features: {
      atsCompatibility: "low",
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
      supportsPhoto: true,
      photoShape: "circular",
      flags: ["charts", "stats", "timeline", "visual"],
    },
  },
  // 18. Simple - Pure minimal, text-focused
  {
    id: "simple",
    name: "Simple",
    description: "Pure minimal design that puts content first",
    color: "from-gray-400/10 to-slate-400/10",
    borderColor: "hover:border-gray-400/50",
    category: "professional",
    industry: "General",
    style: "Minimal",
    popularity: 94,
    layout: "single-column",
    columns: 1,
    styleCategory: "ats-optimized",
    targetIndustries: ["General", "Corporate", "Government", "Healthcare"],
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
      flags: ["ats-optimized", "single-column", "minimal"],
    },
  },
  // 19. Diamond - Clean with color accents for students
  {
    id: "diamond",
    name: "Diamond",
    description: "Clean layout with subtle color accents",
    color: "from-sky-500/10 to-blue-500/10",
    borderColor: "hover:border-sky-500/50",
    category: "professional",
    industry: "General",
    style: "Modern",
    popularity: 91,
    layout: "single-column",
    columns: 1,
    styleCategory: "modern",
    targetIndustries: ["General", "Finance", "Accounting", "Legal", "Students"],
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
      flags: ["ats-friendly", "single-column", "accent-color"],
    },
  },
  // 20. Iconic - Bold headers for creative/engineering
  {
    id: "iconic",
    name: "Iconic",
    description: "Bold headers with distinctive styling",
    color: "from-violet-500/10 to-purple-500/10",
    borderColor: "hover:border-violet-500/50",
    category: "creative",
    industry: "Creative",
    style: "Bold",
    popularity: 88,
    layout: "two-column",
    columns: 2,
    styleCategory: "modern",
    targetIndustries: ["Creative", "Engineering", "Technology", "Design"],
    features: {
      atsCompatibility: "moderate",
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
      supportsPhoto: true,
      photoShape: "circular",
      flags: ["bold-headers", "two-column", "creative"],
    },
  },
  // 21. Student - Entry-level focused for new graduates
  {
    id: "student",
    name: "Student",
    description: "Optimized for students and new graduates",
    color: "from-emerald-500/10 to-teal-500/10",
    borderColor: "hover:border-emerald-500/50",
    category: "professional",
    industry: "Education",
    style: "Modern",
    popularity: 89,
    layout: "single-column",
    columns: 1,
    styleCategory: "modern",
    targetIndustries: ["Students", "Entry-Level", "Internships", "Education"],
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
      flags: ["ats-optimized", "single-column", "entry-level"],
    },
  },
  // 22. Functional - Skills-first layout for career changers
  {
    id: "functional",
    name: "Functional",
    description: "Skills-first format for career changers",
    color: "from-rose-500/10 to-pink-500/10",
    borderColor: "hover:border-rose-500/50",
    category: "professional",
    industry: "General",
    style: "Skills-First",
    popularity: 86,
    layout: "single-column",
    columns: 1,
    styleCategory: "modern",
    targetIndustries: ["General", "Career Changers", "Freelance", "Consulting"],
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
      flags: ["skills-first", "single-column", "career-change"],
    },
  },
];

export type TemplateId = (typeof TEMPLATES)[number]["id"];

/**
 * Templates that render a dedicated profile photo block in both web and PDF.
 * Keep this list aligned with actual template implementations.
 */
export const PHOTO_SUPPORTED_TEMPLATE_IDS: TemplateId[] = [
  "minimalist",
  "modern",
  "classic",
  "dublin",
  "adaptive",
  "cascade",
  "executive",
  "technical",
  "timeline",
  "creative",
  "infographic",
  "iconic",
];

const PHOTO_SUPPORTED_TEMPLATE_SET = new Set<string>(PHOTO_SUPPORTED_TEMPLATE_IDS);

/**
 * Strict photo support capability used by filters and editor UI.
 */
export function hasTemplatePhotoSupport(template: Template | TemplateId): boolean {
  const templateId = typeof template === "string" ? template : template.id;
  const supportsPhoto = PHOTO_SUPPORTED_TEMPLATE_SET.has(templateId);

  if (typeof template !== "string" && process.env.NODE_ENV !== "production") {
    if (template.features.supportsPhoto !== supportsPhoto) {
      console.warn(
        `[templates] supportsPhoto mismatch for "${templateId}": features.supportsPhoto=${template.features.supportsPhoto}, audited=${supportsPhoto}`
      );
    }
  }

  return supportsPhoto;
}

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
        description:
          "95%+ parse rate - optimized for applicant tracking systems",
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
        description:
          "Best for direct applications - complex layout may affect ATS parsing",
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
        description:
          "Customization works in preview; PDF uses template defaults",
      };
    case "none":
      return {
        label: "Fixed Style",
        description: "Template uses its signature styling",
      };
  }
}
