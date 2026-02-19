import { Metadata } from "next";
import { redirect } from "next/navigation";
import InterviewPrepSessionContent from "./interview-prep-session";
import { launchFlags } from "@/config/launch";

export const metadata: Metadata = {
  title: "Practice Session | Interview Prep",
  description: "Practice interview questions with AI-generated answers",
  robots: {
    index: false,
    follow: false,
  },
};

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function InterviewPrepSessionPage({ params }: PageProps) {
  if (!launchFlags.features.interviewPrep) {
    redirect("/dashboard");
  }

  const { sessionId } = await params;
  return <InterviewPrepSessionContent sessionId={sessionId} />;
}
