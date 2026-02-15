import { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { sharingService } from "@/lib/services/sharing-service";
import { PublicResumeView } from "./public-resume-view";
import {
  COOKIE_CONSENT_COOKIE_NAME,
  isGrantedCookieConsent,
} from "@/lib/privacy/consent";

interface Props {
  params: Promise<{
    username: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, slug } = await params;
  const publicResume = await sharingService.getPublicResumeBySlug(
    username,
    slug
  );

  if (!publicResume) {
    return {
      title: "Resume Not Found | ResumeForge",
    };
  }

  const { personalInfo } = publicResume.data;
  const fullName =
    `${personalInfo.firstName} ${personalInfo.lastName}`.trim() || username;
  const title = personalInfo.jobTitle
    ? `${fullName} - ${personalInfo.jobTitle}`
    : fullName;

  return {
    title: `${title} | ResumeForge`,
    description:
      personalInfo.summary?.slice(0, 160) ||
      `Professional resume of ${fullName}`,
    openGraph: {
      title: `${title} | ResumeForge`,
      description:
        personalInfo.summary?.slice(0, 160) ||
        `Professional resume of ${fullName}`,
      type: "profile",
    },
    twitter: {
      card: "summary",
      title: `${title} | ResumeForge`,
      description:
        personalInfo.summary?.slice(0, 160) ||
        `Professional resume of ${fullName}`,
    },
  };
}

export default async function PublicResumePage({ params }: Props) {
  const { username, slug } = await params;

  const publicResume = await sharingService.getPublicResumeBySlug(
    username,
    slug
  );

  if (!publicResume || !publicResume.isPublic) {
    notFound();
  }

  const cookieStore = await cookies();
  const consent = cookieStore.get(COOKIE_CONSENT_COOKIE_NAME)?.value;
  if (isGrantedCookieConsent(consent)) {
    await sharingService.incrementViewCount(publicResume.resumeId);
  }

  return (
    <PublicResumeView
      resume={publicResume}
      username={username}
      slug={slug}
    />
  );
}
