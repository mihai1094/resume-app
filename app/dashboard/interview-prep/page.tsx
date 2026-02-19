import { Metadata } from "next";
import { redirect } from "next/navigation";
import InterviewPrepListContent from "./interview-prep-list";
import { launchFlags } from "@/config/launch";

export const metadata: Metadata = {
  title: "Interview Prep | Resume Builder",
  description:
    "Practice interview questions tailored to your resume and target job",
  robots: {
    index: false,
    follow: false,
  },
};

export default function InterviewPrepPage() {
  if (!launchFlags.features.interviewPrep) {
    redirect("/dashboard");
  }

  return <InterviewPrepListContent />;
}
