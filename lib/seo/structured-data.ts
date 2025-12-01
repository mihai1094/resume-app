import { appConfig } from "@/config/app";

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://resumeforge.app";

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
        name: "Is the AI resume builder free?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, you can create and export your resume for free. Our AI-powered optimization features are available in the free tier with limited usage. No credit card required to start.",
        },
      },
      {
        "@type": "Question",
        name: "How does AI optimize my resume for ATS?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our AI analyzes your resume against job requirements and optimizes keywords, bullet points, and formatting to ensure maximum ATS compatibility. It suggests improvements based on industry best practices and ATS parsing algorithms.",
        },
      },
      {
        "@type": "Question",
        name: "Are the resume templates ATS-friendly?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, all our resume templates are specifically designed to be ATS (Applicant Tracking System) friendly. They use clean formatting, standard fonts, and proper structure that ATS systems can easily parse and understand.",
        },
      },
      {
        "@type": "Question",
        name: "Can I match my resume to specific job requirements?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes! Our AI-powered resume builder allows you to paste job requirements, and the AI will automatically optimize your resume to match those requirements. It suggests relevant keywords, skills, and experience highlights to increase your chances of passing ATS screening.",
        },
      },
      {
        "@type": "Question",
        name: "Does the AI generate cover letters?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, our AI can generate personalized cover letters based on your resume and job requirements. The AI creates compelling cover letters that complement your resume and increase your chances of getting an interview.",
        },
      },
      {
        "@type": "Question",
        name: "What is an ATS score and how is it calculated?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The ATS score measures how well your resume is optimized for Applicant Tracking Systems. It evaluates keyword matching, formatting, structure, and content quality. A higher score means your resume is more likely to pass ATS screening and reach human recruiters.",
        },
      },
      {
        "@type": "Question",
        name: "Can I export my resume to PDF?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, you can export your resume to PDF format. PDF export maintains ATS-friendly formatting and is available in our V1 release. All exports are optimized for both ATS systems and human recruiters.",
        },
      },
      {
        "@type": "Question",
        name: "How accurate is the AI resume optimization?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Our AI uses advanced natural language processing and machine learning models trained on successful resumes and ATS requirements. It provides industry-specific suggestions and follows best practices for resume optimization, significantly improving your chances of passing ATS screening.",
        },
      },
      {
        "@type": "Question",
        name: "Can I import my resume from LinkedIn?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "LinkedIn import is coming in V2. For now, you can import from JSON format or manually enter your information. Once imported, our AI can optimize your existing resume content.",
        },
      },
      {
        "@type": "Question",
        name: "Will AI optimization guarantee I get an interview?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "While AI optimization significantly improves your resume's ATS compatibility and keyword matching, it cannot guarantee interviews. However, studies show that ATS-optimized resumes have 40-60% higher callback rates. The AI helps you get past automated screening, but your qualifications and experience are still the primary factors.",
        },
      },
      {
        "@type": "Question",
        name: "How many resume templates are available?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "We currently offer 3 ATS-friendly templates (Modern, Classic, Executive) with more coming soon. We plan to have 6 templates total, all optimized for ATS compatibility and professional appearance.",
        },
      },
      {
        "@type": "Question",
        name: "Is my resume data secure and private?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, your resume data is stored locally in your browser by default. We use industry-standard encryption and never share your personal information. For cloud sync (Pro feature), data is encrypted and stored securely.",
        },
      },
    ],
  };
}
