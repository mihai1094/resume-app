import { Metadata } from "next";
import InterviewPrepSessionContent from "./interview-prep-session";

export const metadata: Metadata = {
  title: "Practice Session | Interview Prep",
  description: "Practice interview questions with AI-generated answers",
};

interface PageProps {
  params: Promise<{ sessionId: string }>;
}

export default async function InterviewPrepSessionPage({ params }: PageProps) {
  const { sessionId } = await params;
  return <InterviewPrepSessionContent sessionId={sessionId} />;
}
