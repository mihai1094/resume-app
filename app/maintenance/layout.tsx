import type { Metadata } from "next";
import { toAbsoluteUrl } from "@/lib/config/site-url";

export const metadata: Metadata = {
  title: "Maintenance",
  description: "Maintenance status page for ResumeZeus.",
  robots: {
    index: false,
    follow: false,
  },
  alternates: {
    canonical: toAbsoluteUrl("/maintenance"),
  },
};

export default function MaintenanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
