import { appConfig } from "@/config/app";
import { getSiteUrl } from "@/lib/config/site-url";

const baseUrl = getSiteUrl();

/**
 * Organization structured data (JSON-LD)
 */
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: appConfig.name,
    url: baseUrl,
    logo: `${baseUrl}/logo.png`,
    description: appConfig.description,
    sameAs: [
      appConfig.urls.github,
      appConfig.urls.twitter,
    ].filter(Boolean),
  };
}

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
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1250",
    },
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
 * FAQ structured data (JSON-LD) - Extended with AI & ATS questions
 */
export function getFAQSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How do ATS-friendly templates work?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Each template has an ATS compatibility rating: Excellent, Good, Moderate, or Low. Most templates prioritize clean structure for ATS parsing, while some design-first templates prioritize visuals. For strict ATS requirements, choose templates marked Excellent or Good.",
        },
      },
      {
        "@type": "Question",
        name: "Is my data secure and private?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Draft changes are kept in your browser session for recovery, and signed-in data is synced to your account for cross-device access. AI features process only the resume and job-description content needed for each request. You can use AI privacy controls and delete your account data from Settings.",
        },
      },
      {
        "@type": "Question",
        name: "Can I export my resume to different formats?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "You can export your resume as PDF for applications and JSON for backup or transfer.",
        },
      },
      {
        "@type": "Question",
        name: "Is this really free? What's the catch?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. Core resume-building features are available on the free plan. Plan limits apply to saved resumes, cover letters, and monthly AI credits. Higher limits are part of Premium as rollout continues.",
        },
      },
      {
        "@type": "Question",
        name: "Can I create multiple versions of my resume?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes. You can create and save multiple resume versions, then manage, edit, and export them from your dashboard (within your plan limits).",
        },
      },
      {
        "@type": "Question",
        name: "What AI features are available?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Current AI features include bullet generation, bullet improvement, professional summary writing, and AI cover letter generation. Additional AI tools are rolled out gradually.",
        },
      },
      {
        "@type": "Question",
        name: "How is this different from other resume builders?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "ResumeForge combines a fast editor, ATS-rated templates, built-in AI writing support, and straightforward export workflows in one place.",
        },
      },
    ],
  };
}
