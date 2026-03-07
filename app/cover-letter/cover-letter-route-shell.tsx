"use client";

import { useUser } from "@/hooks/use-user";
import { CoverLetterContent } from "./cover-letter-content";

interface CoverLetterRouteShellProps {
  children: React.ReactNode;
}

export function CoverLetterRouteShell({ children }: CoverLetterRouteShellProps) {
  const { user } = useUser();

  if (user) {
    return <CoverLetterContent />;
  }

  return <>{children}</>;
}
