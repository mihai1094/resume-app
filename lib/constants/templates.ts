import { logger } from "@/lib/services/logger";

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
  /** Detailed description shown on the template detail page */
  longDescription: string;
  /** Key selling points / unique features of this template */
  highlights: string[];
  /** Who this template is best suited for */
  bestFor: string;
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
    longDescription: "Clarity is built from the ground up to pass every major ATS parser on the market. Its single-column layout uses standard heading hierarchy, consistent date formatting, and zero decorative elements that could confuse automated screening. Bold section headers create immediate visual structure for human reviewers while keeping the underlying HTML completely machine-readable. This is the template recruiters at Fortune 500 companies expect to see.",
    highlights: [
      "Highest ATS parse rate across Workday, Greenhouse, Lever, and Taleo",
      "Clean heading hierarchy ensures every section is correctly categorized",
      "Generous whitespace makes scanning easy for recruiters spending 6-7 seconds per resume",
      "Fully customizable colors, fonts, and spacing in PDF export",
    ],
    bestFor: "Job seekers applying through online portals, large companies with automated screening, government positions, and anyone who wants maximum compatibility with applicant tracking systems.",
    color: "from-cyan-500/10 to-blue-500/10",
    borderColor: "hover:border-cyan-500/50",
    category: "professional",
    industry: "General",
    style: "ATS",
    popularity: 95,
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
    longDescription: "Inspired by the Swiss International Typographic Style, Minimalist strips away everything unnecessary and lets your content breathe. The two-column grid aligns information on a strict baseline, creating a sense of order and precision that signals attention to detail. Neutral tones and restrained typography make this a favorite among designers and architects who understand that less is more.",
    highlights: [
      "Swiss grid system creates perfect visual alignment across all sections",
      "Neutral color palette works for any industry without feeling generic",
      "Photo support with circular crop adds personality without clutter",
      "Two-column layout maximizes content density while maintaining readability",
    ],
    bestFor: "Designers, architects, UX professionals, and anyone in a visually-aware field who wants their resume to demonstrate design sensibility through restraint rather than decoration.",
    color: "from-gray-500/10 to-zinc-500/10",
    borderColor: "hover:border-gray-500/50",
    category: "professional",
    industry: "Technology",
    style: "Minimal",
    popularity: 95,
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
    longDescription: "Modern puts your skills and contact info in a bold colored sidebar while dedicating the wider main column to your experience and education. The teal accent creates instant visual identity — this is the resume that stands out in a stack of black-and-white documents. The sidebar design is one of the most popular formats on platforms like Resume.io and Novoresume because it efficiently uses every square inch of the page.",
    highlights: [
      "Full-height colored sidebar creates strong visual identity at a glance",
      "Skills organized by category in the sidebar for quick scanning",
      "Photo placement in the sidebar header adds a personal touch",
      "Main column stays clean and focused on career narrative",
    ],
    bestFor: "Tech professionals, startup employees, marketers, and product managers who want a contemporary look that balances personality with professionalism. Ideal when applying directly to hiring managers.",
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
    description: "Clean scannable layout with accent stripe — ATS friendly",
    longDescription: "Cubic proves that ATS-friendly doesn't have to mean boring. A subtle colored accent stripe runs along the top, giving the resume a distinctive edge while the single-column body stays completely parseable by every major ATS. Section headings use a geometric underline pattern that reinforces the structured, methodical impression. Engineers and scientists love it because it mirrors the precision of their work.",
    highlights: [
      "ATS-excellent rating with a modern aesthetic — best of both worlds",
      "Accent stripe adds visual distinction without affecting parseability",
      "Geometric section dividers create clear content hierarchy",
      "Full customization support including fonts, colors, and spacing in PDF",
    ],
    bestFor: "Engineers, scientists, data analysts, and corporate professionals who need ATS compliance but refuse to sacrifice visual appeal. Great for STEM roles at companies that use automated screening.",
    color: "from-cyan-500/10 to-sky-500/10",
    borderColor: "hover:border-cyan-500/50",
    category: "professional",
    industry: "Technology",
    style: "Modern",
    popularity: 90,
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
    longDescription: "Classic channels the timeless authority of serif typography and traditional formatting that has been the gold standard in finance, law, and consulting for decades. The two-column layout uses a restrained sidebar for skills and contact details while the main body follows the chronological format that senior partners and hiring committees expect. This is the resume that says you understand the culture before you walk into the room.",
    highlights: [
      "Serif typography conveys authority and institutional credibility",
      "Two-column layout follows the format expected by traditional industries",
      "Conservative color palette appropriate for Big 4, law firms, and banks",
      "Photo support for industries where personal branding matters",
    ],
    bestFor: "Finance professionals, lawyers, management consultants, healthcare administrators, and anyone interviewing at conservative institutions where tradition and credibility carry weight.",
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
    longDescription: "Ivy League is modeled after the resume format used by graduates of top MBA programs and required by many investment banks and consulting firms. The single-column layout, horizontal rule section dividers, and no-nonsense typography follow the exact conventions that Wall Street and McKinsey recruiters scan for. No photos, no colors, no distractions — just credentials presented in the format the industry has standardized on.",
    highlights: [
      "Follows the exact format expected by investment banks and MBB firms",
      "Single-column with horizontal rules — the Wall Street standard",
      "Excellent ATS compatibility for online applications to large firms",
      "No decorative elements ensure focus stays entirely on your credentials",
    ],
    bestFor: "MBA candidates, investment banking analysts, management consultants, private equity associates, and anyone targeting firms where the resume format itself is a cultural signal.",
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
    longDescription: "Dublin balances European resume conventions with a universally professional look. The header combines your photo, name, and contact info in an elegant arrangement, while the body splits into a 65/35 layout — experience and education on the left, skills and links on the right in a subtle gray sidebar. Inspired by the templates popular across EU markets, Dublin is the go-to when you need a resume that works in both London and New York.",
    highlights: [
      "Photo-ready header follows European resume conventions",
      "65/35 asymmetric split maximizes content area while keeping skills accessible",
      "Elegant serif name treatment distinguishes you from standard templates",
      "Full customization — colors, fonts, and spacing all export to PDF",
    ],
    bestFor: "Business professionals, HR managers, administrators, and healthcare workers — especially those applying to international companies or European markets where photos are expected.",
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
    longDescription: "Smart Template analyzes your content and automatically adjusts its layout to present your strongest sections most prominently. Have extensive experience but few skills? The experience section expands. Heavy on certifications? They get priority placement. The adaptive engine ensures your resume always looks balanced regardless of how much or how little content you have — no awkward empty spaces, no cramped sections.",
    highlights: [
      "Intelligent layout adapts to your content — sections reflow automatically",
      "Never looks empty or overcrowded regardless of content volume",
      "Two-column design with smart section placement based on content weight",
      "Photo support with automatic sizing and placement",
    ],
    bestFor: "Versatile professionals who apply to diverse roles, people with uneven section lengths, and anyone who doesn't want to manually balance their resume layout. Great for generalists and career changers.",
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
    description: "Two-column design with skill progress bars and elegant sidebar",
    longDescription: "Cascade takes the popular sidebar format and elevates it with visual skill indicators and a refined color palette. Progress bars next to each skill give recruiters an instant sense of your proficiency levels, while the cascading section flow in the main column creates a natural reading rhythm. The dark sidebar with light text creates strong contrast that draws the eye exactly where you want it — making this one of the most visually balanced professional templates available.",
    highlights: [
      "Visual skill progress bars communicate proficiency at a glance",
      "Dark sidebar with light text creates eye-catching contrast",
      "Cascading section flow guides the reader through your career story",
      "Full PDF customization — every color, font, and spacing option exports",
    ],
    bestFor: "Corporate professionals, project managers, marketing managers, and consultants who want a polished, modern look that goes beyond plain text without crossing into creative territory.",
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
    longDescription: "Structured takes a grid-based approach to ATS optimization. While most ATS templates are single-column, Structured uses a carefully engineered two-column grid where the secondary column holds skills and certifications in a way that major parsers can still read correctly. Left-aligned typography and parser-safe fonts ensure compatibility, while the grid layout gives you more content density than a single-column format.",
    highlights: [
      "Two-column grid engineered for ATS compatibility — rare combination",
      "Parser-safe typography tested against major ATS platforms",
      "Higher content density than single-column ATS templates",
      "Full customization support in PDF export",
    ],
    bestFor: "Engineers, IT professionals, healthcare workers, and corporate employees who need ATS compliance but have enough content to benefit from a two-column layout.",
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
    description: "Strong typography focus with prominent headers and clean layout",
    longDescription: "Bold makes a statement with oversized section headers and high-contrast typography that commands attention. The single-column layout keeps content linear and ATS-friendly, but the typographic treatment makes it feel anything but ordinary. Heavy headings create a clear content map that lets recruiters jump directly to the section they care about. This is the template for people whose accomplishments speak loudly.",
    highlights: [
      "Oversized section headers create instant visual navigation",
      "ATS-excellent rating despite the distinctive typographic style",
      "Single-column layout ensures every word is read in the intended order",
      "High-contrast design stands out in a stack of conventional resumes",
    ],
    bestFor: "Sales leaders, executives, general managers, and senior professionals who want their resume to match the confidence of their career trajectory. Ideal for direct applications and recruiter submissions.",
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
    longDescription: "Executive is designed for senior leaders who need their resume to communicate gravitas before a single word is read. The monogram accent — your initials elegantly rendered — creates a personal brand mark. The two-column layout uses warm, authoritative tones and refined spacing that evoke executive stationery. Photo support allows you to include a professional headshot, reinforcing the personal brand that C-suite candidates need.",
    highlights: [
      "Monogram accent creates a distinctive personal brand mark",
      "Warm color palette conveys authority and approachability",
      "Two-column layout balances executive summary with detailed achievements",
      "Photo support with elegant framing for professional headshots",
    ],
    bestFor: "C-suite executives, VPs, directors, board members, and senior consultants who need a resume that reflects their seniority. Also popular for executive MBA applications.",
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
    longDescription: "Compact is specifically designed for candidates with limited experience who need to fill a single page without it looking sparse. Tighter spacing, condensed section headers, and an efficient layout make even a short career history look intentional and complete. The ATS-excellent rating ensures your resume passes through automated screening at entry-level positions where competition is highest and every application counts.",
    highlights: [
      "Optimized spacing makes limited experience look substantial, not empty",
      "ATS-excellent rating critical for high-competition entry-level roles",
      "Condensed headers maximize the space available for actual content",
      "Single-column format keeps things simple and professional",
    ],
    bestFor: "Recent graduates, career starters, internship applicants, retail workers moving to office roles, and anyone with less than 3 years of experience who needs to make the most of a single page.",
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
    longDescription: "Technical speaks the visual language of software developers. The dark background with syntax-highlighted accents mimics the IDE environment that engineers spend their days in. Monospace typography for technical details, color-coded skill tags, and a layout that reads like well-structured code make this resume an immediate signal that you're one of them. Multiple IDE themes let you match your preferred editor aesthetic.",
    highlights: [
      "Dark theme with syntax-highlighting accents — speaks developer culture",
      "Multiple IDE themes (VS Code, Dracula, Monokai, GitHub Dark, and more)",
      "Monospace typography for technical sections, sans-serif for narrative",
      "Color-coded skill tags organized by proficiency and category",
    ],
    bestFor: "Software engineers, DevOps engineers, data scientists, and technical leads applying to developer-first companies. Best used when sending directly to engineering managers rather than through ATS portals.",
    color: "from-blue-600/10 to-cyan-600/10",
    borderColor: "hover:border-blue-600/50",
    category: "technical",
    industry: "Technology",
    style: "Modern",
    popularity: 98,
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
    longDescription: "Timeline transforms your career history into a visual narrative with connected nodes and flowing lines that trace your professional journey. Each role becomes a stop on your career path, making it immediately clear how your experience builds toward your current position. The visual storytelling approach is particularly effective for candidates with a strong upward trajectory or interesting career pivots that benefit from being shown rather than just listed.",
    highlights: [
      "Connected timeline nodes visualize your career progression",
      "Career pivot points are highlighted rather than hidden",
      "Two-column layout balances timeline with supporting details",
      "Photo support adds personality to the narrative approach",
    ],
    bestFor: "Marketing professionals, educators, nonprofit workers, and creative professionals who have an interesting career story to tell. Especially effective for candidates with clear career progression or meaningful pivots.",
    color: "from-slate-600/10 to-orange-500/10",
    borderColor: "hover:border-orange-500/50",
    category: "creative",
    industry: "Creative",
    style: "Visual",
    popularity: 97,
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
    longDescription: "Creative borrows from editorial magazine design — asymmetric columns, pull-quote styling for your summary, and typographic hierarchy that treats your resume like a designed publication. The two-column layout creates visual tension that keeps the reader engaged, while bold section treatments turn each part of your resume into a distinct editorial spread. This template is itself a portfolio piece.",
    highlights: [
      "Magazine-inspired editorial layout is a portfolio piece in itself",
      "Asymmetric columns create visual interest and guide the eye",
      "Pull-quote styling for summary section makes your pitch unmissable",
      "Photo support with rounded crop for creative headshots",
    ],
    bestFor: "Art directors, graphic designers, content creators, media professionals, and brand managers who need their resume format to demonstrate creative thinking. Use when applying to agencies, studios, and media companies.",
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
    longDescription: "Infographic turns your resume into a data visualization. Skill levels become donut charts, career milestones become timeline markers, and key achievements are presented as highlighted statistics. The sidebar layout anchors your visual skill representation while the main column tells your career story. This is the most visually rich template in the collection — designed for roles where showing you can communicate complex information visually is itself a qualification.",
    highlights: [
      "Donut charts and progress rings visualize skill proficiency levels",
      "Key achievement statistics are highlighted with large-number callouts",
      "Timeline markers trace your career milestones visually",
      "Full color customization lets you match any brand palette",
    ],
    bestFor: "Data visualization specialists, marketing analysts, social media managers, and startup generalists who want their resume to demonstrate visual communication skills. Best for direct applications where visual impact matters.",
    color: "from-orange-500/10 to-amber-500/10",
    borderColor: "hover:border-orange-500/50",
    category: "creative",
    industry: "Creative",
    style: "Visual",
    popularity: 96,
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
    longDescription: "Simple does exactly what it says — no sidebars, no graphics, no decoration. Just your content in a clean single-column format with subtle typographic hierarchy. This is the template for people who believe their achievements should do the talking. It's also the safest choice when you're unsure about a company's culture: Simple is universally appropriate and never the wrong call. It pairs ATS-excellent compatibility with readability that respects the recruiter's time.",
    highlights: [
      "Zero visual noise — your achievements are the only thing on the page",
      "ATS-excellent rating makes it the safest choice for any application",
      "Universally appropriate — works for any industry, any seniority level",
      "Full customization lets you subtly personalize without overdesigning",
    ],
    bestFor: "Anyone who wants a foolproof resume. Especially effective for government applications, large corporations, academia, and situations where you're unsure what format the recipient expects.",
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
    longDescription: "Diamond strikes the perfect balance between ATS compliance and visual personality. Subtle color accents on section headers and dividers add just enough distinction to stand out, while the single-column layout remains fully parseable. The name comes from its precision — every element is carefully faceted to create a polished, multi-dimensional impression from a flat page. Popular with students and early professionals who want something more refined than plain text.",
    highlights: [
      "Color accents add personality while maintaining ATS-excellent compliance",
      "Single-column precision layout — every element is intentionally placed",
      "Particularly popular with students transitioning to professional roles",
      "Full customization support with accent colors that carry into PDF",
    ],
    bestFor: "Students entering the job market, accounting and finance juniors, paralegals, and early-career professionals who want a resume that feels polished and intentional without being flashy.",
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
    longDescription: "Iconic makes section headers the star of the show — oversized, boldly colored, and impossible to skim past. The two-column layout gives you space for both depth and breadth: detailed experience descriptions alongside quick-scan skill lists and certifications. The distinctive header treatment makes your resume instantly recognizable in a recruiter's inbox. It bridges creative and technical worlds, working equally well for a design lead or an engineering manager.",
    highlights: [
      "Oversized colored section headers create instant recognition",
      "Two-column layout provides both depth and breadth of information",
      "Bridges creative and technical aesthetics — works for both worlds",
      "Photo support with circular crop for a modern professional look",
    ],
    bestFor: "Design leads, engineering managers, product designers, and technical creatives who work at the intersection of design and engineering. Great for tech companies with strong design cultures.",
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
    longDescription: "Student is purpose-built for candidates whose strongest assets are education, projects, and potential rather than years of work experience. Education is promoted to the top of the page, projects and coursework get dedicated sections with generous space, and the skills section is designed to highlight technical competencies gained through academic work. The layout makes a one-page resume with limited experience look intentional and complete rather than sparse.",
    highlights: [
      "Education-first layout puts your degree and GPA front and center",
      "Dedicated project sections showcase academic and personal work",
      "Designed to make limited experience look complete, not empty",
      "ATS-excellent for high-competition entry-level and internship applications",
    ],
    bestFor: "University students, recent graduates, internship applicants, and bootcamp graduates who need to lead with education and projects rather than work history.",
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
    longDescription: "Functional flips the traditional resume structure by leading with skills and competencies rather than chronological work history. Skills are grouped into functional categories with supporting achievement bullets pulled from across your career, making it clear what you can do without drawing attention to when or where you did it. This is the strategic choice for career changers, freelancers with diverse clients, and anyone whose skills tell a stronger story than their job titles.",
    highlights: [
      "Skills-first structure highlights what you can do, not where you worked",
      "Functional grouping lets you reframe diverse experience around target roles",
      "ATS-excellent — the single-column format parses perfectly",
      "Ideal for reframing career gaps or non-linear career paths",
    ],
    bestFor: "Career changers, freelancers, consultants with varied clients, military-to-civilian transitions, and anyone returning to work after a gap who needs to lead with transferable skills.",
    color: "from-rose-500/10 to-pink-500/10",
    borderColor: "hover:border-rose-500/50",
    category: "professional",
    industry: "General",
    style: "Skills-First",
    popularity: 99,
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
      logger.warn(
        `supportsPhoto mismatch for "${templateId}": features.supportsPhoto=${template.features.supportsPhoto}, audited=${supportsPhoto}`,
        { module: "Templates" }
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
