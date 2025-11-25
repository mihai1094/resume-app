"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { LoadingPage } from "@/components/shared/loading";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  redirectTo = "/login",
}: AuthGuardProps) {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(redirectTo);
    }
  }, [user, isLoading, router, redirectTo]);

  if (isLoading) {
    return <LoadingPage text="Loading..." />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
