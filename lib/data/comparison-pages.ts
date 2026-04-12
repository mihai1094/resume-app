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
  slug:
    | "novoresume"
    | "zety"
    | "canva-resume"
    | "resume-io"
    | "enhancv"
    | "kickresume"
    | "resume-genius"
    | "teal";
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
  {
    slug: "resume-io",
    competitorName: "Resume.io",
    competitorLabel: "Resume.io alternative",
    title: "ResumeZeus vs Resume.io",
    description:
      "Compare ResumeZeus vs Resume.io for free export limits, ATS workflow, cover letters, and premium-trial pricing.",
    verdict:
      "Choose ResumeZeus if you want free PDF export and a cleaner ATS-first workflow without a trial-renewal pricing model. Choose Resume.io if you want its broader career-tool suite and are comfortable with TXT-only free downloads or a premium trial.",
    summary:
      "ResumeZeus is stronger for candidates who want to create and export a resume for free without navigating a trial funnel. Resume.io is stronger if you value its broader ecosystem of job tools, recruiter match, and interview-prep features.",
    competitorStrengths: [
      "Public product pages position Resume.io as a broader job-search platform with recruiter match, job board, interview prep, and salary tools.",
      "Premium plans include unlimited resumes and cover letters with unlimited PDF downloads.",
      "Resume.io highlights a larger ecosystem of recruiter-tested templates and career features.",
    ],
    resumeZeusAdvantages: [
      "Free accounts can export PDFs instead of limiting free resume downloads to TXT format.",
      "ATS scoring and resume editing sit together in a simpler builder workflow.",
      "You can start the core resume-plus-PDF flow without a trial-style auto-renew path.",
    ],
    featureRows: [
      {
        feature: "Free downloads",
        resumeZeus: "PDF export included on free account",
        competitor: "Public pricing lists TXT-only free downloads",
      },
      {
        feature: "Pricing model",
        resumeZeus: "Free to start, upgrade later if needed",
        competitor: "Free plan plus 7-day trial that auto-renews to a premium subscription",
      },
      {
        feature: "ATS workflow",
        resumeZeus: "Live ATS-oriented workflow inside the editor",
        competitor: "ATS templates and scorer are part of a larger multi-tool suite",
      },
      {
        feature: "Best fit",
        resumeZeus: "Candidates who want the shortest path from draft to PDF",
        competitor: "Candidates who want resume building plus wider career tooling",
      },
    ],
    faqs: [
      {
        question: "Is Resume.io free to download from?",
        answer:
          "Resume.io's public pricing page says its free plan downloads only in TXT format. ResumeZeus is a better fit if free PDF export matters from day one.",
      },
      {
        question: "Why would someone still choose Resume.io?",
        answer:
          "Resume.io can be a good fit if you want a broader career platform with extras like recruiter match, interview prep, and other job-search tools alongside the resume builder.",
      },
      {
        question: "What is the main ResumeZeus advantage over Resume.io?",
        answer:
          "The main advantage is the simpler free workflow: build, check ATS readiness, and export PDF without relying on a trial-renewal upgrade path.",
      },
    ],
    sourceUrls: [
      "https://resume.io/pricing",
      "https://resume.io/",
    ],
    lastVerified: "2026-04-11",
  },
  {
    slug: "enhancv",
    competitorName: "Enhancv",
    competitorLabel: "Enhancv alternative",
    title: "ResumeZeus vs Enhancv",
    description:
      "Compare ResumeZeus vs Enhancv for ATS checks, visual customization, resume tailoring, and free-start workflow.",
    verdict:
      "Choose ResumeZeus if you want a simpler ATS-first builder with free PDF export. Choose Enhancv if design flexibility and visual storytelling matter more to you and the role can support that style.",
    summary:
      "ResumeZeus is stronger when you want a direct, low-friction ATS workflow and free export. Enhancv is stronger when you want more visual expression, richer customization, and a builder that leans into design plus job-tailoring features.",
    competitorStrengths: [
      "Enhancv emphasizes ATS check, AI writer, and one-click job tailoring directly on its product pages.",
      "Its public messaging leans heavily into flexible layouts, drag-and-drop editing, and more expressive resume storytelling.",
      "Enhancv positions itself as a strong fit for users who want recruiter-friendly design plus ATS awareness together.",
    ],
    resumeZeusAdvantages: [
      "Free PDF export removes a common last-step paywall for users who just need a job-ready file now.",
      "ATS scoring is centered in the editing workflow rather than attached to a more design-heavy experience.",
      "ResumeZeus keeps the product promise narrower and easier to understand for candidates focused on fast execution.",
    ],
    featureRows: [
      {
        feature: "Product posture",
        resumeZeus: "ATS-first builder with PDF export and AI help",
        competitor: "Design-forward builder with ATS check, AI writing, and tailoring",
      },
      {
        feature: "Free entry point",
        resumeZeus: "Free account with PDF export",
        competitor: "Public pricing emphasizes a limited free entry point before Pro tiers",
      },
      {
        feature: "Customization",
        resumeZeus: "Focused template customization for resume workflows",
        competitor: "Broader visual customization and more expressive resume layouts",
      },
      {
        feature: "Best fit",
        resumeZeus: "Candidates optimizing for ATS speed and simplicity",
        competitor: "Candidates who want more design personality and tailoring controls",
      },
    ],
    faqs: [
      {
        question: "Is Enhancv ATS-friendly?",
        answer:
          "Enhancv publicly positions its builder as ATS-friendly and highlights ATS check and tailoring features. ResumeZeus still has the simpler ATS-first workflow if you want fewer moving parts.",
      },
      {
        question: "Why would someone choose ResumeZeus over Enhancv?",
        answer:
          "Choose ResumeZeus if your priority is free PDF export and a direct workflow centered on ATS readiness rather than visual experimentation.",
      },
      {
        question: "Who should choose Enhancv instead?",
        answer:
          "Enhancv is a better fit for candidates who want more expressive layouts, deeper visual customization, and a product that blends design with job-tailoring features.",
      },
    ],
    sourceUrls: [
      "https://enhancv.com/",
      "https://enhancv.com/pricing/",
    ],
    lastVerified: "2026-04-11",
  },
  {
    slug: "kickresume",
    competitorName: "Kickresume",
    competitorLabel: "Kickresume alternative",
    title: "ResumeZeus vs Kickresume",
    description:
      "Compare ResumeZeus vs Kickresume for free downloads, ATS tools, AI writing, and template customization.",
    verdict:
      "Choose ResumeZeus if you want a more focused ATS workflow with free PDF export and fewer pricing decisions. Choose Kickresume if you want its large template library, unlimited downloads, and broader premium feature set.",
    summary:
      "ResumeZeus is stronger when you care most about an ATS-oriented edit-to-export loop. Kickresume is stronger when you want a mature premium suite with many templates, AI writing, ATS checking, and more customization depth.",
    competitorStrengths: [
      "Kickresume's public pricing page highlights 40+ resume templates, 40+ matching cover letter templates, ATS Resume Checker, and AI Writer.",
      "Its free plan advertises unlimited downloads and unlimited resumes and cover letters, even with more limited template access.",
      "Kickresume also positions extra tools such as LinkedIn/PDF import, personal websites, and mobile apps.",
    ],
    resumeZeusAdvantages: [
      "ATS-first editor flow is simpler and more tightly scoped for fast resume production.",
      "Free PDF export is part of the core value proposition instead of being balanced against a larger premium matrix.",
      "ResumeZeus keeps the user journey centered on resumes and cover letters rather than a broader career-product bundle.",
    ],
    featureRows: [
      {
        feature: "Free plan",
        resumeZeus: "Free account with PDF export and ATS-focused workflow",
        competitor: "Free plan with unlimited downloads but fewer templates and limited customization",
      },
      {
        feature: "Premium depth",
        resumeZeus: "Simpler premium story",
        competitor: "Large premium suite with AI Writer, ATS checker, more templates, and more customization",
      },
      {
        feature: "Template breadth",
        resumeZeus: "Curated template set focused on ATS fit and practical use cases",
        competitor: "40+ resume templates plus 40+ cover letter templates",
      },
      {
        feature: "Best fit",
        resumeZeus: "Candidates who want a straightforward ATS workflow",
        competitor: "Candidates who want a bigger premium feature catalog and more design options",
      },
    ],
    faqs: [
      {
        question: "Can you download from Kickresume for free?",
        answer:
          "Kickresume's pricing page says yes, as long as you stick to its free options. ResumeZeus still differs by centering its pitch on free PDF export and ATS-first editing rather than a broader premium suite.",
      },
      {
        question: "Why would someone choose ResumeZeus over Kickresume?",
        answer:
          "Choose ResumeZeus if you want a tighter ATS workflow and a simpler product story, especially if you do not need a large premium ecosystem of templates and extras.",
      },
      {
        question: "Who should choose Kickresume instead?",
        answer:
          "Kickresume makes more sense if you want many templates, AI Writer, ATS checker, and adjacent tools like imports, websites, and mobile access.",
      },
    ],
    sourceUrls: [
      "https://www.kickresume.com/en/pricing/",
    ],
    lastVerified: "2026-04-11",
  },
  {
    slug: "resume-genius",
    competitorName: "Resume Genius",
    competitorLabel: "Resume Genius alternative",
    title: "ResumeZeus vs Resume Genius",
    description:
      "Compare ResumeZeus vs Resume Genius for free export limits, AI helpers, resume checks, and pricing transparency.",
    verdict:
      "Choose ResumeZeus if you want free PDF export and a more transparent path from draft to finished file. Choose Resume Genius if you want its larger template/example library and broader content ecosystem and are comfortable with TXT-only free resume exports.",
    summary:
      "ResumeZeus is the stronger free-start option for PDF export and ATS-centered editing. Resume Genius is the stronger option if you value its large library of templates, examples, and review tools enough to accept its resume-builder export limits on free.",
    competitorStrengths: [
      "Resume Genius highlights a large library of templates, examples, and resume-help content.",
      "Public pricing includes AI summary tools, resume checker, resume review, and a job board on paid tiers.",
      "Its website positions itself as a mature content and builder ecosystem for US job seekers.",
    ],
    resumeZeusAdvantages: [
      "Free accounts can export resumes as PDF instead of limiting free resume-builder exports to TXT.",
      "ATS scoring and resume editing are integrated into the main workflow rather than spread across a larger content ecosystem.",
      "ResumeZeus has a simpler promise for users who want to move from draft to PDF quickly.",
    ],
    featureRows: [
      {
        feature: "Free resume export",
        resumeZeus: "PDF export included",
        competitor: "Resume builder free tier lists TXT-only resume export",
      },
      {
        feature: "Cover letters",
        resumeZeus: "Included in the same workflow",
        competitor: "Public pricing lists broader cover letter support than free resume export",
      },
      {
        feature: "Pricing model",
        resumeZeus: "Free to start, upgrade later if needed",
        competitor: "Free access plus 14-day trial and annual plan",
      },
      {
        feature: "Best fit",
        resumeZeus: "Candidates who want free PDF export and ATS-oriented editing",
        competitor: "Candidates who value large template/example libraries and review tooling",
      },
    ],
    faqs: [
      {
        question: "Is Resume Genius free?",
        answer:
          "Its public pricing page says the resume builder is free for TXT-only exports, while PDF and Word resume exports sit behind paid access. ResumeZeus is more direct if you need a free PDF resume.",
      },
      {
        question: "Why would someone choose ResumeZeus over Resume Genius?",
        answer:
          "Choose ResumeZeus if free PDF export and a cleaner ATS-first workflow matter more than having a larger content library and extra review tools.",
      },
      {
        question: "Who should choose Resume Genius instead?",
        answer:
          "Resume Genius is worth considering if you want its large bank of examples, templates, and resume-help content alongside the builder.",
      },
    ],
    sourceUrls: [
      "https://resumegenius.com/pricing",
      "https://resumegenius.com/",
    ],
    lastVerified: "2026-04-11",
  },
  {
    slug: "teal",
    competitorName: "Teal",
    competitorLabel: "Teal alternative",
    title: "ResumeZeus vs Teal",
    description:
      "Compare ResumeZeus vs Teal for free downloads, job-tracker depth, resume matching, and ATS-focused editing.",
    verdict:
      "Choose ResumeZeus if you want a simpler ATS-first resume builder and export workflow. Choose Teal if you want a broader career operating system with job tracking, resume matching, and more surrounding job-search tools.",
    summary:
      "ResumeZeus is stronger when you want an editor built around fast ATS-focused resume creation. Teal is stronger when you want resume building bundled with job tracking, keyword matching, templates, and a larger all-in-one job-search workflow.",
    competitorStrengths: [
      "Teal publicly emphasizes unlimited resumes, job tracking, resume matching, and a broader job-search platform.",
      "Its free product messaging highlights unlimited resume creation and unlimited PDF/Word downloads.",
      "Teal positions itself as a complete workflow spanning resumes, cover letters, tracking, and career-growth tools.",
    ],
    resumeZeusAdvantages: [
      "ResumeZeus keeps the product surface area smaller and more focused on resume execution.",
      "ATS scoring and editing live closer together in the core builder experience.",
      "The simpler workflow can be easier for users who do not need a full job-tracker ecosystem.",
    ],
    featureRows: [
      {
        feature: "Product scope",
        resumeZeus: "Focused resume + cover letter builder with ATS-first editing",
        competitor: "Broader job-search platform with resume builder, job tracker, and matching tools",
      },
      {
        feature: "Free plan",
        resumeZeus: "Free PDF export and ATS-focused workflow",
        competitor: "Public messaging highlights unlimited resumes and unlimited downloads on free",
      },
      {
        feature: "Job matching",
        resumeZeus: "ATS-oriented resume optimization inside the editor",
        competitor: "Keyword matching and job-tracker workflow are central to the product",
      },
      {
        feature: "Best fit",
        resumeZeus: "Candidates who want less tool sprawl and faster resume execution",
        competitor: "Candidates who want resume building plus full job-search management",
      },
    ],
    faqs: [
      {
        question: "Is Teal really free?",
        answer:
          "Teal's public resume-builder pages say yes, with unlimited resume creation and unlimited downloads on the core free builder. The main reason to choose ResumeZeus instead is simplicity and a tighter ATS-first builder flow.",
      },
      {
        question: "Why would someone choose ResumeZeus over Teal?",
        answer:
          "Choose ResumeZeus if you do not need a full job tracker and want a more focused path from ATS edits to export.",
      },
      {
        question: "Who should choose Teal instead?",
        answer:
          "Teal is a better fit for users who want resume building tied closely to job tracking, keyword matching, and a wider job-search workspace.",
      },
    ],
    sourceUrls: [
      "https://www.tealhq.com/pricing",
      "https://www.tealhq.com/tools/resume-builder",
    ],
    lastVerified: "2026-04-11",
  },
];

export function getComparisonPage(slug: string) {
  return comparisonPages.find((page) => page.slug === slug);
}
