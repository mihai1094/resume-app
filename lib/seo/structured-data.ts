import { cache } from "react";
import { appConfig } from "@/config/app";
import { getSiteUrl } from "@/lib/config/site-url";

const baseUrl = getSiteUrl();

// Cached at module level — these are static objects that never change at runtime
let _organizationSchema: ReturnType<typeof buildOrganizationSchema> | null = null;

function buildOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: appConfig.name,
    url: baseUrl,
    logo: `${baseUrl}/assets/icon.svg`,
    description: appConfig.description,
    sameAs: [
      appConfig.urls.github,
      appConfig.urls.twitter,
    ].filter(Boolean),
  };
}

export interface FAQEntry {
  question: string;
  answer: string;
}

/**
 * Organization structured data (JSON-LD)
 * Wrapped with React cache() for request-scoped deduplication in Server Components.
 */
export const getOrganizationSchema = cache(function getOrganizationSchema() {
  if (!_organizationSchema) {
    _organizationSchema = buildOrganizationSchema();
  }
  return _organizationSchema;
});

/**
 * WebApplication structured data (JSON-LD)
 */
export function getWebApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: appConfig.name,
    description: appConfig.description,
    url: baseUrl,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "AI-Powered Resume Optimization",
      "ATS-Friendly Resume Builder",
      "Job Requirements Matching",
      "AI Cover Letter Generator",
      "ATS Score Checker",
      "Resume Templates",
      "PDF Export",
      "Real-time Preview",
      "AI-Powered Suggestions",
      "Resume Optimization",
    ],
  };
}

/**
 * SoftwareApplication structured data (JSON-LD)
 */
export function getSoftwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: appConfig.name,
    description: appConfig.description,
    url: baseUrl,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    featureList: [
      "Free resume builder",
      "Free PDF export",
      "30 AI credits at signup",
      "ATS-friendly resume templates",
      "AI bullet and summary improvements",
      "Resume and cover letter editor",
    ],
  };
}

/**
 * Breadcrumb structured data (JSON-LD)
 */
export function getBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

/**
 * Shared FAQ content — single source of truth consumed by:
 *   - `getFAQSchema()` below (for JSON-LD on the homepage)
 *   - The Accordion in `app/home-content.tsx` (for the visible FAQ section)
 *
 * Keeping these in sync prevents SEO drift vs. on-page copy.
 */
export const HOME_PAGE_FAQS: FAQEntry[] = [
  {
    question: "How do ATS-friendly templates work?",
    answer:
      "Each template has an ATS compatibility rating: Excellent, Good, Moderate, or Low. Most templates prioritize clean structure for ATS parsing, while some design-first templates prioritize visuals. For strict ATS requirements, choose templates marked Excellent or Good.",
  },
  {
    question: "Is my data secure and private?",
    answer:
      "Draft changes are kept in your browser session for recovery, and signed-in data is synced to your account for cross-device access. AI features process only the resume and job-description content needed for each request. You can use AI privacy controls and delete your account data from Settings.",
  },
  {
    question: "Can I export my resume to PDF for free?",
    answer:
      "Yes. Free accounts can export resumes as high-quality PDFs. You can also export your data as JSON for backup or transfer.",
  },
  {
    question: "Is ResumeZeus free and do I need a credit card?",
    answer:
      "ResumeZeus offers a free account for creating resumes, exporting PDFs, and using AI features with a one-time signup bonus of 30 AI credits. No credit card is required for the free account. You only need billing details if you later choose to buy more AI credits or upgrade.",
  },
  {
    question: "Can I create multiple versions of my resume?",
    answer:
      "Yes. You can create and save multiple resume versions, then manage, edit, and export them from your dashboard (within your plan limits).",
  },
  {
    question: "What AI features are available?",
    answer:
      "Current AI features include bullet generation, bullet improvement, summary writing, skills suggestions, ATS analysis, and AI cover letter generation. The free account includes 30 AI credits at signup.",
  },
  {
    question: "How is this different from other resume builders?",
    answer:
      "ResumeZeus is built by a small EU-based team focused on ATS compatibility and privacy. Unlike most builders, free accounts get full PDF export with no watermarks. AI features use one-time credits instead of a subscription, so you only pay for what you need.",
  },
];

/**
 * FAQ structured data (JSON-LD) — built from {@link HOME_PAGE_FAQS}
 * so the homepage schema always mirrors the on-page Accordion.
 */
export function getFAQSchema() {
  return getFAQPageSchema(HOME_PAGE_FAQS);
}

export function getFAQPageSchema(entries: FAQEntry[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: entries.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  };
}
