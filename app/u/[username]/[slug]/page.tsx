import { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { sharingService } from "@/lib/services/sharing-service";
import { incrementViewCountServer } from "@/lib/services/sharing-service-server";
import { PublicResumeView } from "./public-resume-view";
import {
  COOKIE_CONSENT_COOKIE_NAME,
  isConsentGranted,
  parseStoredConsent,
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
      title: "Resume Not Found | ResumeZeus",
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
      title: "Resume Not Found | ResumeZeus",
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
    title: `${title} | ResumeZeus`,
    description:
      personalInfo.summary?.slice(0, 160) ||
      `Professional resume of ${fullName}`,
    alternates: {
      canonical: publicUrl,
    },
    openGraph: {
      title: `${title} | ResumeZeus`,
      description:
        personalInfo.summary?.slice(0, 160) ||
        `Professional resume of ${fullName}`,
      type: "profile",
      url: publicUrl,
    },
    twitter: {
      card: "summary",
      title: `${title} | ResumeZeus`,
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
  const consentRaw = cookieStore.get(COOKIE_CONSENT_COOKIE_NAME)?.value;
  let decodedConsent: string | null = null;
  if (consentRaw) {
    try {
      decodedConsent = decodeURIComponent(consentRaw);
    } catch {
      decodedConsent = consentRaw;
    }
  }
  const storedConsent = parseStoredConsent(decodedConsent);
  if (isConsentGranted(storedConsent, "resumeAnalytics")) {
    await incrementViewCountServer(publicResume.resumeId);
  }

  return (
    <PublicResumeView
      resume={publicResume}
      username={username}
      slug={slug}
    />
  );
}
