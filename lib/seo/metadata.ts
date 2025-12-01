import { Metadata } from "next";
import { appConfig } from "@/config/app";

const baseUrl =
  process.env.NEXT_PUBLIC_BASE_URL || "https://resumeforge.app";
const siteName = appConfig.name;
const description = appConfig.description;

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
    "resume builder with job matching",
    "ats resume checker",
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
    creator: "@resumebuilder", // Update with actual Twitter handle
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
    // Add your verification codes here
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
    // yahoo: "your-yahoo-verification-code",
  },
};

/**
 * Homepage metadata - Optimized for AI + ATS keywords
 */
export const homepageMetadata: Metadata = {
  title: "ResumeForge - AI Resume Builder | ATS-Friendly CV Builder with Job Matching",
  description:
    "Forge your future with ResumeForge. Create ATS-friendly resumes that pass applicant tracking systems. AI-powered resume optimization matches your CV to job requirements. Generate cover letters with AI. Free resume builder with instant ATS score. Land more interviews.",
  keywords: [
    "ai resume builder",
    "ats resume builder",
    "ai cv builder",
    "resume builder that passes ats",
    "ai resume optimizer",
    "resume builder with job matching",
    "ats resume checker",
    "ai cover letter generator",
    "cv builder ai powered",
    "ats friendly resume builder",
  ],
  openGraph: {
    title: "ResumeForge - AI Resume Builder | ATS-Friendly CV Builder with Job Matching",
    description:
      "Forge your future with ResumeForge. Create ATS-friendly resumes that pass applicant tracking systems. AI-powered optimization matches your CV to job requirements. Generate cover letters. Free.",
    url: baseUrl,
  },
  twitter: {
    title: "ResumeForge - AI Resume Builder | ATS-Friendly CV Builder with Job Matching",
    description:
      "Forge your future with ResumeForge. Create ATS-friendly resumes that pass applicant tracking systems. AI-powered optimization matches your CV to job requirements. Generate cover letters. Free.",
  },
  alternates: {
    canonical: baseUrl,
  },
};

/**
 * Create page metadata - Optimized for AI features
 */
export const createPageMetadata: Metadata = {
  title: "Create Resume - ResumeForge | AI Resume Builder",
  description:
    "Build your resume with ResumeForge's AI-powered optimization. Add job requirements and our AI will optimize your CV to match. Get ATS score, improve bullet points, and generate cover letters. Free resume builder.",
  keywords: [
    "ai resume builder",
    "resume builder with ai",
    "ats resume optimizer",
    "resume builder job matching",
    "ai cv optimization",
    "ats score checker",
  ],
  openGraph: {
    title: "AI Resume Builder | Optimize Your CV for ATS & Job Requirements",
    description:
      "Build your resume with AI-powered optimization. Add job requirements and our AI will optimize your CV to match. Get ATS score and generate cover letters.",
    url: `${baseUrl}/editor/new`,
  },
  twitter: {
    title: "AI Resume Builder | Optimize Your CV for ATS & Job Requirements",
    description:
      "Build your resume with AI-powered optimization. Add job requirements and our AI will optimize your CV to match. Get ATS score and generate cover letters.",
  },
  alternates: {
    canonical: `${baseUrl}/editor/new`,
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
    url: `${baseUrl}/preview`,
  },
  twitter: {
    title: "ATS-Friendly Resume Templates | Preview & Download Free Templates",
    description:
      "Preview ATS-friendly resume templates designed to pass applicant tracking systems. Modern, Classic, Executive templates. All optimized for ATS.",
  },
  alternates: {
    canonical: `${baseUrl}/preview`,
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
    title: "Dashboard | ResumeForge",
    description: "Manage your saved resumes and CV portfolio.",
    url: `${baseUrl}/dashboard`,
  },
};

/**
 * Import CV page metadata
 */
export const importPageMetadata: Metadata = {
  title: "Import CV | Upload Your Existing Resume",
  description:
    "Import your existing CV from PDF, DOCX, or TXT format. Our AI automatically extracts your information and populates your new ATS-friendly resume. Quick and easy resume migration.",
  keywords: [
    "import resume",
    "upload cv",
    "convert resume",
    "pdf to resume",
    "resume parser",
    "cv import",
  ],
  openGraph: {
    title: "Import Your CV | ResumeForge",
    description:
      "Import your existing CV from PDF, DOCX, or TXT. AI-powered extraction populates your new resume automatically.",
    url: `${baseUrl}/import`,
  },
  twitter: {
    title: "Import Your CV | ResumeForge",
    description:
      "Import your existing CV from PDF, DOCX, or TXT. AI-powered extraction populates your new resume automatically.",
  },
  alternates: {
    canonical: `${baseUrl}/import`,
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
    url: `${baseUrl}/onboarding`,
  },
  twitter: {
    title: "Get Started | Create Your Resume in Minutes",
    description:
      "Start building your professional resume in minutes. Choose from ATS-friendly templates and land more interviews.",
  },
  alternates: {
    canonical: `${baseUrl}/onboarding`,
  },
};

/**
 * Generate dynamic metadata for template preview pages
 */
export function generateTemplateMetadata(
  templateId: string,
  templateName: string,
  templateDescription: string,
  templateIndustry: string
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
      title: `${templateName} Resume Template | ResumeForge`,
      description: `Preview the ${templateName} resume template. ${templateDescription}. Perfect for ${templateIndustry} professionals.`,
      url: `${baseUrl}/preview?template=${templateId}`,
    },
    twitter: {
      title: `${templateName} Resume Template | ResumeForge`,
      description: `Preview the ${templateName} resume template. ${templateDescription}. Perfect for ${templateIndustry} professionals.`,
    },
    alternates: {
      canonical: `${baseUrl}/preview?template=${templateId}`,
    },
  };
}
