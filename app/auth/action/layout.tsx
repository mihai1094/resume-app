import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Email Action | ResumeZeus",
  description: "Complete your email action.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AuthActionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
