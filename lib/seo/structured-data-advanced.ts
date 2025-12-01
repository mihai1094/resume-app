import { appConfig } from "@/config/app";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://resumeforge.app";

/**
 * HowTo structured data for "How to Create an ATS-Friendly Resume"
 */
export function getHowToResumeSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How to Create an ATS-Friendly Resume with AI",
    description:
      "Step-by-step guide to creating an ATS-friendly resume using AI-powered optimization",
    image: `${baseUrl}/og-image.png`,
    totalTime: "PT15M",
    estimatedCost: {
      "@type": "MonetaryAmount",
      currency: "USD",
      value: "0",
    },
    step: [
      {
        "@type": "HowToStep",
        position: 1,
        name: "Enter Your Information",
        text: "Start by entering your personal information, work experience, education, and skills into our resume builder.",
        image: `${baseUrl}/howto-step1.png`,
      },
      {
        "@type": "HowToStep",
        position: 2,
        name: "Add Job Requirements",
        text: "Paste the job description or requirements. Our AI will analyze what keywords and skills are needed.",
        image: `${baseUrl}/howto-step2.png`,
      },
      {
        "@type": "HowToStep",
        position: 3,
        name: "AI Optimization",
        text: "Our AI automatically optimizes your resume by matching keywords, improving bullet points, and ensuring ATS compatibility.",
        image: `${baseUrl}/howto-step3.png`,
      },
      {
        "@type": "HowToStep",
        position: 4,
        name: "Check ATS Score",
        text: "Review your ATS score to see how well your resume matches the job requirements and ATS systems.",
        image: `${baseUrl}/howto-step4.png`,
      },
      {
        "@type": "HowToStep",
        position: 5,
        name: "Generate Cover Letter",
        text: "Use our AI to generate a personalized cover letter that complements your optimized resume.",
        image: `${baseUrl}/howto-step5.png`,
      },
      {
        "@type": "HowToStep",
        position: 6,
        name: "Export and Apply",
        text: "Export your ATS-friendly resume as PDF and apply to jobs with confidence.",
        image: `${baseUrl}/howto-step6.png`,
      },
    ],
  };
}

/**
 * SoftwareApplication with detailed AI features
 */
export function getAIResumeBuilderSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: `${appConfig.name} - AI-Powered Resume Builder`,
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1250",
      bestRating: "5",
      worstRating: "1",
    },
    featureList: [
      "AI-Powered Resume Optimization",
      "ATS-Friendly Resume Builder",
      "Job Requirements Matching",
      "AI Cover Letter Generator",
      "ATS Score Checker",
      "Keyword Optimization",
      "Bullet Point Enhancement",
      "Resume Templates",
      "PDF Export",
      "Real-time Preview",
    ],
    screenshot: `${baseUrl}/screenshot.png`,
    softwareVersion: appConfig.version,
    description:
      "AI-powered resume builder that optimizes your CV for ATS systems. Match your resume to job requirements, generate cover letters, and get instant ATS scores. Free to start.",
  };
}

/**
 * Article schema for blog posts (ready for content marketing)
 */
export function getArticleSchema(
  title: string,
  description: string,
  author: string = appConfig.author,
  datePublished: string,
  dateModified?: string
) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description,
    image: `${baseUrl}/og-image.png`,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      "@type": "Person",
      name: author,
    },
    publisher: {
      "@type": "Organization",
      name: appConfig.name,
      logo: {
        "@type": "ImageObject",
        url: `${baseUrl}/logo.png`,
      },
    },
  };
}

/**
 * Breadcrumb schema helper with AI/ATS context
 */
export function getBreadcrumbSchemaWithContext(items: Array<{ name: string; url: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.url}`,
    })),
  };
}
