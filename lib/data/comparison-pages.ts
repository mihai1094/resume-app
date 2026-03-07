export interface ComparisonFeatureRow {
  feature: string;
  resumeZeus: string;
  competitor: string;
}

export interface ComparisonFaq {
  question: string;
  answer: string;
}

export interface ComparisonPageData {
  slug: "novoresume" | "zety" | "canva-resume";
  competitorName: string;
  competitorLabel: string;
  title: string;
  description: string;
  verdict: string;
  summary: string;
  competitorStrengths: string[];
  resumeZeusAdvantages: string[];
  featureRows: ComparisonFeatureRow[];
  faqs: ComparisonFaq[];
  sourceUrls: string[];
  lastVerified: string;
}

export const comparisonPages: ComparisonPageData[] = [
  {
    slug: "novoresume",
    competitorName: "Novoresume",
    competitorLabel: "Novoresume alternative",
    title: "ResumeZeus vs Novoresume",
    description:
      "Compare ResumeZeus vs Novoresume for free plan limits, PDF export, AI workflow, and template flexibility.",
    verdict:
      "Choose ResumeZeus if you want free PDF export, built-in AI credits, and a simpler resume-plus-cover-letter workflow. Choose Novoresume if you prefer its pay-once premium model and its broader built-in color and font controls.",
    summary:
      "ResumeZeus is stronger when your priority is starting free and getting to a job-ready PDF quickly. Novoresume is stronger when you want a more design-customizable builder and are comfortable upgrading to unlock multiple versions and cover letters.",
    competitorStrengths: [
      "Premium plan is pay-once rather than auto-renewing subscription based.",
      "Premium advertises broader visual customization such as more fonts, color themes, and picture styles.",
      "Novoresume has established brand awareness around ATS-friendly resume building.",
    ],
    resumeZeusAdvantages: [
      "Free account includes PDF export and AI credits at signup.",
      "Resume and cover letter workflow sits together in one product path.",
      "Template set includes ATS-rated options with editor and export flow available without immediate paywall pressure.",
    ],
    featureRows: [
      {
        feature: "Free plan",
        resumeZeus: "Free account with PDF export and AI credits at signup",
        competitor: "Basic free plan with single version, 1-page resume, and no cover letter",
      },
      {
        feature: "Cover letters",
        resumeZeus: "Included in the product workflow",
        competitor: "Matching cover letter listed on Premium plan",
      },
      {
        feature: "Pricing model",
        resumeZeus: "Free to start, upgrade later if needed",
        competitor: "Free Basic plan plus pay-once Premium options",
      },
      {
        feature: "AI workflow",
        resumeZeus: "AI credits built into the writing workflow",
        competitor: "Core public pricing page focuses more on layout and premium customization",
      },
    ],
    faqs: [
      {
        question: "Is ResumeZeus cheaper than Novoresume?",
        answer:
          "For candidates who want to start free and still export PDF, ResumeZeus is the more accessible path. Novoresume offers a free Basic tier, but its pricing page positions key extras like multiple versions and cover letters behind Premium.",
      },
      {
        question: "Who should choose Novoresume instead?",
        answer:
          "Choose Novoresume if you strongly prefer its pay-once Premium model and want the broader visual customization it advertises on its pricing page.",
      },
      {
        question: "What is the main ResumeZeus advantage over Novoresume?",
        answer:
          "The main advantage is the free workflow: build a resume, export PDF, and use AI writing help without having to upgrade first.",
      },
    ],
    sourceUrls: [
      "https://novoresume.com/page/pricing",
    ],
    lastVerified: "2026-03-07",
  },
  {
    slug: "zety",
    competitorName: "Zety",
    competitorLabel: "Zety alternative",
    title: "ResumeZeus vs Zety",
    description:
      "Compare ResumeZeus vs Zety for free downloads, AI help, pricing structure, and resume-plus-cover-letter workflow.",
    verdict:
      "Choose ResumeZeus if you want free PDF export and a simpler free starting point. Choose Zety if you want its larger content library, job tools, and established premium ecosystem and are comfortable with the trial-to-renewal pricing model.",
    summary:
      "ResumeZeus is the better fit for candidates who want to build, export, and iterate without hitting a document-format paywall. Zety is the better fit if you value its broader template and job-tool ecosystem enough to justify the paid plan.",
    competitorStrengths: [
      "Public pricing highlights 18+ templates, resume check tools, and instant job matches.",
      "Premium plan includes PDF, Word, and TXT downloads.",
      "Zety has a larger public content and review footprint.",
    ],
    resumeZeusAdvantages: [
      "Free account includes PDF export instead of limiting free downloads to TXT.",
      "AI credits are included at signup rather than positioned mainly behind premium access paths.",
      "No trial-style pricing language is needed to access the core free export workflow.",
    ],
    featureRows: [
      {
        feature: "Free downloads",
        resumeZeus: "PDF export included in free account",
        competitor: "TXT download on free plan; PDF and Word on paid plans",
      },
      {
        feature: "Cover letters",
        resumeZeus: "Included in the same product flow",
        competitor: "Cover letter builder included, with full download formats on paid plans",
      },
      {
        feature: "Pricing model",
        resumeZeus: "Free to start, upgrade later if needed",
        competitor: "Free plan plus trial/renewal and annual paid options",
      },
      {
        feature: "AI and optimization",
        resumeZeus: "AI credits built into drafting and rewrite flow",
        competitor: "Public positioning focuses on builder, templates, resume check, and job matches",
      },
    ],
    faqs: [
      {
        question: "Is Zety free to use?",
        answer:
          "Zety lets users create documents for free, but its pricing page says the free plan downloads in TXT format only. Its paid plans unlock PDF and Word downloads.",
      },
      {
        question: "Why would someone choose ResumeZeus over Zety?",
        answer:
          "ResumeZeus is a better fit if you want free PDF export, included AI credits at signup, and a simpler workflow for resume and cover letter creation.",
      },
      {
        question: "Who should still consider Zety?",
        answer:
          "Candidates who want Zety's larger template library, job-match tools, and broader content ecosystem may still prefer it if the paid plan works for them.",
      },
    ],
    sourceUrls: [
      "https://zety.com/pricing",
      "https://zety.com/resume-builder",
    ],
    lastVerified: "2026-03-07",
  },
  {
    slug: "canva-resume",
    competitorName: "Canva Resume Builder",
    competitorLabel: "Canva resume alternative",
    title: "ResumeZeus vs Canva Resume Builder",
    description:
      "Compare ResumeZeus vs Canva Resume Builder for ATS focus, resume workflow, design flexibility, and free vs Pro positioning.",
    verdict:
      "Choose ResumeZeus if you want a dedicated resume workflow with ATS-rated templates and integrated AI writing help. Choose Canva if you want maximum design freedom and a broader all-purpose design platform that also supports resumes.",
    summary:
      "ResumeZeus is the better fit when your goal is a focused job-application workflow. Canva is the better fit when you want broad design flexibility, a huge template ecosystem, and are comfortable adapting a general design platform for resume use.",
    competitorStrengths: [
      "Canva Free offers resume creation with a large template ecosystem.",
      "Canva Pro adds premium content, brand tools, and 25+ AI-powered tools.",
      "Canva is useful for visually driven resumes, portfolios, and adjacent job-search assets.",
    ],
    resumeZeusAdvantages: [
      "Purpose-built around resumes, cover letters, ATS-rated templates, and PDF export.",
      "Easier to compare templates by ATS compatibility and resume-specific use case.",
      "Less setup friction when your goal is a job-ready application rather than open-ended design work.",
    ],
    featureRows: [
      {
        feature: "Product focus",
        resumeZeus: "Dedicated resume and cover letter workflow",
        competitor: "General design platform with resume builder capability",
      },
      {
        feature: "Free access",
        resumeZeus: "Free account with PDF export and AI credits at signup",
        competitor: "Canva Free available for resume creation; Pro unlocks premium features",
      },
      {
        feature: "ATS guidance",
        resumeZeus: "Templates include ATS compatibility ratings",
        competitor: "Broader design flexibility, but less resume-specific ATS framing on public product pages",
      },
      {
        feature: "Best fit",
        resumeZeus: "Candidates who want a direct path to resume + cover letter export",
        competitor: "Users who want resumes plus wider design or branding workflows",
      },
    ],
    faqs: [
      {
        question: "Is Canva good for resumes?",
        answer:
          "Yes, especially if design flexibility matters a lot to you. But if your priority is a dedicated ATS-aware resume workflow, ResumeZeus is the more focused option.",
      },
      {
        question: "Why would someone choose ResumeZeus over Canva?",
        answer:
          "Choose ResumeZeus when you want a builder designed specifically for resumes and cover letters, with ATS-rated templates, free PDF export, and AI writing help in one workflow.",
      },
      {
        question: "Who should choose Canva instead?",
        answer:
          "Choose Canva if you need broader creative tooling, more open-ended visual design, or you already use Canva for other personal-brand or portfolio work.",
      },
    ],
    sourceUrls: [
      "https://www.canva.com/create/resumes/",
      "https://www.canva.com/pro/",
    ],
    lastVerified: "2026-03-07",
  },
];

export function getComparisonPage(slug: string) {
  return comparisonPages.find((page) => page.slug === slug);
}
