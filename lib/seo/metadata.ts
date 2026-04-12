import { Metadata } from "next";
import { appConfig } from "@/config/app";
import { getSiteUrl, toAbsoluteUrl } from "@/lib/config/site-url";

const baseUrl = getSiteUrl();
const siteName = appConfig.name;
const description = appConfig.description;
const googleVerification =
  process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ??
  process.env.GOOGLE_SITE_VERIFICATION;
const yandexVerification =
  process.env.NEXT_PUBLIC_YANDEX_SITE_VERIFICATION ??
  process.env.YANDEX_SITE_VERIFICATION;
const yahooVerification =
  process.env.NEXT_PUBLIC_YAHOO_SITE_VERIFICATION ??
  process.env.YAHOO_SITE_VERIFICATION;

/**
 * Default metadata for all pages
 */
export const defaultMetadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description,
  keywords: [
    // Primary keywords
    "ai resume builder",
    "ats resume builder",
    "ai cv builder",
    "ats friendly resume builder",
    "resume builder with ai",
    "cv builder ai powered",

    // Long-tail keywords (high intent)
    "resume builder that passes ats",
    "ai resume optimizer",
    "resume builder with ai writing tools",
    "resume content improvement",
    "ai cover letter generator",
    "resume builder with ai suggestions",
    "cv builder that beats ats",
    "ai powered resume optimization",
    "resume builder with cover letter",
    "ats compliant resume builder",

    // Secondary keywords
    "resume builder",
    "cv builder",
    "resume maker",
    "cv maker",
    "resume generator",
    "cv generator",
    "professional resume builder",
    "ats friendly resume",
    "resume templates",
    "cv templates",
    "job application",
    "career",
    "job search",
    "resume optimization",
    "cv optimization",
    "resume writer",
    "cover letter builder",
    "cover letter generator",
  ],
  authors: [{ name: appConfig.author }],
  creator: appConfig.author,
  publisher: appConfig.author,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    siteName,
    title: siteName,
    description,
    images: [
      {
        url: `${baseUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description,
    images: [`${baseUrl}/og-image.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: googleVerification || undefined,
    yandex: yandexVerification || undefined,
    yahoo: yahooVerification || undefined,
  },
};

/**
 * Homepage metadata - Optimized for AI + ATS keywords
 */
export const homepageMetadata: Metadata = {
  // Root route: title.template doesn't apply to the root segment itself, so
  // include the brand explicitly via `absolute`.
  title: {
    absolute: "Free AI Resume Builder with PDF Export | ResumeZeus",
  },
  description:
    "Create and export a professional resume to PDF for free with ResumeZeus. Includes 30 AI credits at signup for summaries, bullet improvements, and skills suggestions. No credit card required for the free account.",
  keywords: [
    "free resume builder",
    "free ai resume builder",
    "resume builder with pdf export",
    "resume builder no credit card",
    "ai resume builder",
    "ats resume builder",
    "free resume pdf export",
    "ats-friendly resume builder",
    "resume builder with ai writing tools",
  ],
  openGraph: {
    title: "Free Resume Builder with PDF Export & 30 AI Credits | ResumeZeus",
    description:
      "Build resumes for free, export PDF for free, and get 30 AI credits at signup. No credit card required for the free account.",
    url: baseUrl,
  },
  twitter: {
    title: "Free Resume Builder with PDF Export & 30 AI Credits | ResumeZeus",
    description:
      "Free resume builder with PDF export and 30 AI credits at signup. No credit card required for the free account.",
  },
  alternates: {
    canonical: baseUrl,
  },
};

/**
 * Create page metadata - Optimized for AI features
 */
export const createPageMetadata: Metadata = {
  title: "Create Resume | AI Resume Builder",
  description:
    "Build your resume with ResumeZeus's AI writing tools. Improve bullet points, generate summaries, choose a template, and export a polished PDF.",
  keywords: [
    "ai resume builder",
    "resume builder with ai",
    "ats resume optimizer",
    "resume builder ai writing",
    "ai cv optimization",
    "resume bullet improvement",
  ],
  openGraph: {
    title: "AI Resume Builder | Build a Professional ATS-Friendly CV",
    description:
      "Build your resume with AI-powered writing help. Improve bullets, generate summaries, and export a professional PDF.",
    url: toAbsoluteUrl("/editor/new"),
  },
  twitter: {
    title: "AI Resume Builder | Build a Professional ATS-Friendly CV",
    description:
      "Build your resume with AI-powered writing help. Improve bullets, generate summaries, and export a professional PDF.",
  },
  alternates: {
    canonical: toAbsoluteUrl("/editor/new"),
  },
};

/**
 * Preview page metadata - Optimized for ATS templates
 */
export const previewPageMetadata: Metadata = {
  title: "ATS-Friendly Resume Templates | Preview & Download Free Templates",
  description:
    "Preview ATS-friendly resume templates designed to pass applicant tracking systems. Modern, Classic, Executive templates. All templates optimized for ATS compatibility. Free download.",
  keywords: [
    "ats friendly resume templates",
    "resume templates that pass ats",
    "ats compliant resume templates",
    "free resume templates",
    "cv templates ats",
  ],
  openGraph: {
    title: "ATS-Friendly Resume Templates | Preview & Download Free Templates",
    description:
      "Preview ATS-friendly resume templates designed to pass applicant tracking systems. Modern, Classic, Executive templates. All optimized for ATS.",
    url: toAbsoluteUrl("/preview"),
  },
  twitter: {
    title: "ATS-Friendly Resume Templates | Preview & Download Free Templates",
    description:
      "Preview ATS-friendly resume templates designed to pass applicant tracking systems. Modern, Classic, Executive templates. All optimized for ATS.",
  },
  alternates: {
    canonical: toAbsoluteUrl("/preview"),
  },
};

/**
 * Dashboard page metadata
 */
export const dashboardMetadata: Metadata = {
  title: "Dashboard | Manage Your CV Portfolio",
  description:
    "Manage your saved resumes, edit existing CVs, export to PDF, and optimize for job applications with AI-powered suggestions. Your personal resume dashboard.",
  robots: {
    index: false, // Private page - don't index
    follow: true,
  },
  openGraph: {
    title: "Dashboard | ResumeZeus",
    description: "Manage your saved resumes and CV portfolio.",
    url: toAbsoluteUrl("/dashboard"),
  },
};

/**
 * Import CV page metadata
 */
export const importPageMetadata: Metadata = {
  title: "Import CV | Upload Your Existing Resume",
  description:
    "Import your existing resume data from JSON. Quickly migrate, review, and continue editing in ResumeZeus.",
  keywords: [
    "import resume",
    "upload cv",
    "convert resume",
    "pdf to resume",
    "resume parser",
    "cv import",
  ],
  openGraph: {
    title: "Import Your CV | ResumeZeus",
    description:
      "Import your existing resume data from JSON and continue editing instantly in ResumeZeus.",
    url: toAbsoluteUrl("/import"),
  },
  twitter: {
    title: "Import Your CV | ResumeZeus",
    description:
      "Import your existing resume data from JSON and continue editing instantly in ResumeZeus.",
  },
  alternates: {
    canonical: toAbsoluteUrl("/import"),
  },
};

/**
 * Onboarding page metadata
 */
export const onboardingMetadata: Metadata = {
  title: "Get Started | Create Your Resume in Minutes",
  description:
    "Start building your professional resume in minutes. Choose from ATS-friendly templates, set your career goals, and create a resume that lands interviews. Free to start.",
  keywords: [
    "start resume",
    "create cv",
    "resume wizard",
    "resume onboarding",
    "quick resume builder",
  ],
  openGraph: {
    title: "Get Started | Create Your Resume in Minutes",
    description:
      "Start building your professional resume in minutes. Choose from ATS-friendly templates and land more interviews.",
    url: toAbsoluteUrl("/onboarding"),
  },
  twitter: {
    title: "Get Started | Create Your Resume in Minutes",
    description:
      "Start building your professional resume in minutes. Choose from ATS-friendly templates and land more interviews.",
  },
  alternates: {
    canonical: toAbsoluteUrl("/onboarding"),
  },
  robots: {
    index: false,
    follow: false,
  },
};

/**
 * Generate dynamic metadata for template preview pages
 */
export function generateTemplateMetadata(
  templateId: string,
  templateName: string,
  templateDescription: string,
  templateIndustry: string,
  canonicalPath: string = `/preview?template=${templateId}`
): Metadata {
  return {
    title: `${templateName} Resume Template | ATS-Friendly | Free Download`,
    description: `Preview the ${templateName} resume template. ${templateDescription}. Perfect for ${templateIndustry} professionals. ATS-optimized and ready to use.`,
    keywords: [
      `${templateName.toLowerCase()} resume template`,
      "ats friendly template",
      `${templateIndustry.toLowerCase()} resume`,
      "professional resume template",
      "free resume template",
    ],
    openGraph: {
      title: `${templateName} Resume Template | ResumeZeus`,
      description: `Preview the ${templateName} resume template. ${templateDescription}. Perfect for ${templateIndustry} professionals.`,
      url: toAbsoluteUrl(canonicalPath),
    },
    twitter: {
      title: `${templateName} Resume Template | ResumeZeus`,
      description: `Preview the ${templateName} resume template. ${templateDescription}. Perfect for ${templateIndustry} professionals.`,
    },
    alternates: {
      canonical: toAbsoluteUrl(canonicalPath),
    },
  };
}
