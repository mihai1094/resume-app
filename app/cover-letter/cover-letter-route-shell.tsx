"use client";

import { useUser } from "@/hooks/use-user";
import { CoverLetterContent } from "./cover-letter-content";

interface CoverLetterRouteShellProps {
  children: React.ReactNode;
}

export function CoverLetterRouteShell({ children }: CoverLetterRouteShellProps) {
  const { user, isLoading } = useUser();

  // Don't flash the guest page while auth is resolving
  if (isLoading) {
    return null;
  }

  if (user) {
    return <CoverLetterContent />;
  }

  return <>{children}</>;
}
