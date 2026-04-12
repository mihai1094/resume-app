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
import { JsonLd } from "@/components/seo/json-ld";

interface Props {
  params: Promise<{
    username: string;
    slug: string;
  }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!launchFlags.features.publicSharing) {
    return {
      title: "Resume Not Found",
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
      title: "Resume Not Found",
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
    title,
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

  const { personalInfo } = publicResume.data;
  const fullName =
    `${personalInfo.firstName} ${personalInfo.lastName}`.trim() || username;
  const publicUrl = toAbsoluteUrl(`/u/${username}/${slug}`);
  const sameAs = [
    personalInfo.website,
    personalInfo.linkedin,
    personalInfo.github,
  ].filter(Boolean);
  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: fullName,
    url: publicUrl,
    jobTitle: personalInfo.jobTitle || undefined,
    description: personalInfo.summary || undefined,
    address: personalInfo.location
      ? {
          "@type": "PostalAddress",
          addressLocality: personalInfo.location,
        }
      : undefined,
    sameAs,
  };
  const profilePageSchema = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: publicUrl,
    name: `${fullName} resume`,
    description:
      personalInfo.summary || `Professional resume of ${fullName}`,
    mainEntity: {
      "@type": "Person",
      name: fullName,
      url: publicUrl,
    },
  };

  return (
    <>
      <JsonLd data={personSchema} />
      <JsonLd data={profilePageSchema} />
      <PublicResumeView
        resume={publicResume}
        username={username}
        slug={slug}
      />
    </>
  );
}
