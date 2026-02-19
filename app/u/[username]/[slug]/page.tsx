import { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { sharingService } from "@/lib/services/sharing-service";
import { PublicResumeView } from "./public-resume-view";
import {
  COOKIE_CONSENT_COOKIE_NAME,
  isGrantedCookieConsent,
} from "@/lib/privacy/consent";
import { toAbsoluteUrl } from "@/lib/config/site-url";
import { launchFlags } from "@/config/launch";

interface Props {
  params: Promise<{
    username: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!launchFlags.features.publicSharing) {
    return {
      title: "Resume Not Found | ResumeForge",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

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
  const publicUrl = toAbsoluteUrl(`/u/${username}/${slug}`);

  return {
    title: `${title} | ResumeForge`,
    description:
      personalInfo.summary?.slice(0, 160) ||
      `Professional resume of ${fullName}`,
    alternates: {
      canonical: publicUrl,
    },
    openGraph: {
      title: `${title} | ResumeForge`,
      description:
        personalInfo.summary?.slice(0, 160) ||
        `Professional resume of ${fullName}`,
      type: "profile",
      url: publicUrl,
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
  if (!launchFlags.features.publicSharing) {
    notFound();
  }

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
