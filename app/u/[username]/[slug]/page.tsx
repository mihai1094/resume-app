import { Metadata } from "next";
import { notFound } from "next/navigation";
import { sharingService } from "@/lib/services/sharing-service";
import { PublicResumeView } from "./public-resume-view";

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

  // Track the view
  await sharingService.incrementViewCount(publicResume.resumeId);

  return (
    <PublicResumeView
      resume={publicResume}
      username={username}
      slug={slug}
    />
  );
}
