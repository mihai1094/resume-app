import type { Metadata } from "next";
import { ComingSoonContent } from "./coming-soon-content";

export const metadata: Metadata = {
  title: "Coming Soon | ResumeZeus",
  description:
    "Something new is on the way. Stay tuned for exciting updates from ResumeZeus.",
  robots: { index: false, follow: false },
};

export default function ComingSoonPage() {
  return <ComingSoonContent />;
}
