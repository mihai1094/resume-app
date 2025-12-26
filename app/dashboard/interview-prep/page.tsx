import { Metadata } from "next";
import InterviewPrepListContent from "./interview-prep-list";

export const metadata: Metadata = {
  title: "Interview Prep | Resume Builder",
  description:
    "Practice interview questions tailored to your resume and target job",
};

export default function InterviewPrepPage() {
  return <InterviewPrepListContent />;
}
