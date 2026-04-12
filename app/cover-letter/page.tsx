import { Metadata } from "next";
import { toAbsoluteUrl } from "@/lib/config/site-url";
import { getBreadcrumbSchema, getFAQPageSchema } from "@/lib/seo/structured-data";
import { CoverLetterRouteShell } from "./cover-letter-route-shell";
import { GuestCoverLetterPage } from "./guest-cover-letter-page";
import { JsonLd } from "@/components/seo/json-ld";

const coverLetterFaqs = [
  {
    question: "Can I create a cover letter that matches my resume?",
    answer: "Yes. ResumeZeus is designed so your cover letter workflow sits next to your resume workflow, which makes it easier to keep tone, skills, and role targeting aligned.",
  },
  {
    question: "Is the cover letter builder free to start?",
    answer: "Yes. You can create a free account and start writing right away. If you later need more AI usage or higher limits, you can upgrade then.",
  },
  {
    question: "Can AI help me draft a cover letter?",
    answer: "Yes. ResumeZeus includes AI-assisted cover letter generation so you can move from resume draft to tailored application package faster.",
  },
  {
    question: "Should I tailor my cover letter for each job?",
    answer: "Yes. A tailored cover letter helps you connect your experience to the specific role, company, and job description instead of sending the same generic message everywhere.",
  },
  {
    question: "Can I edit the letter manually after generating it?",
    answer: "Yes. You can use AI for the first draft or selected sections, then rewrite and refine the final version yourself before sending it.",
  },
  {
    question: "What should a strong cover letter include?",
    answer: "A strong cover letter should explain why you fit the role, highlight relevant achievements, show interest in the company, and end with a clear call to continue the conversation.",
  },
];

export const metadata: Metadata = {
  title: "Cover Letter Builder | Free Professional Cover Letter Creator",
  description:
    "Create professional cover letters that complement your resume. Start free, tailor each letter to the job, and use AI help when you need a faster first draft.",
  keywords: [
    "cover letter builder",
    "cover letter creator",
    "professional cover letter",
    "job application letter",
    "free cover letter",
    "cover letter template",
  ],
  openGraph: {
    title: "Cover Letter Builder | Free Professional Cover Letter Creator",
    description:
      "Create professional cover letters that complement your resume. Tailor each letter and use AI help when you need a faster first draft.",
    type: "website",
    url: toAbsoluteUrl("/cover-letter"),
  },
  alternates: {
    canonical: toAbsoluteUrl("/cover-letter"),
  },
};

export default function CoverLetterPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: toAbsoluteUrl("/") },
    { name: "Cover Letter Builder", url: toAbsoluteUrl("/cover-letter") },
  ]);
  const faqSchema = getFAQPageSchema(coverLetterFaqs);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      <JsonLd data={faqSchema} />
      <CoverLetterRouteShell>
        <GuestCoverLetterPage faqs={coverLetterFaqs} />
      </CoverLetterRouteShell>
    </>
  );
}









