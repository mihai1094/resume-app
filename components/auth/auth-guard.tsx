"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { LoadingPage } from "@/components/shared/loading";

interface AuthGuardProps {
  children: React.ReactNode;
  redirectTo?: string;
  /** Optional feature name to show in toast (e.g., "resume editor", "dashboard") */
  featureName?: string;
}

export function AuthGuard({
  children,
  redirectTo = "/login",
  featureName,
}: AuthGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && !user) {
      // Build full URL with query params to preserve template selection, etc.
      const search = searchParams.toString();
      const fullPath = search ? `${pathname}?${search}` : pathname;

      // Store redirect info for showing toast on login page
      const redirectInfo = {
        from: pathname,
        feature: featureName || getFeatureNameFromPath(pathname),
        returnTo: fullPath,
      };
      sessionStorage.setItem("auth_redirect", JSON.stringify(redirectInfo));

      router.push(redirectTo);
    }
  }, [
    user,
    isLoading,
    router,
    redirectTo,
    pathname,
    searchParams,
    featureName,
  ]);

  if (isLoading) {
    return <LoadingPage text="Loading..." />;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

/**
 * Get a human-readable feature name from a pathname
 */
function getFeatureNameFromPath(pathname: string): string {
  if (pathname.startsWith("/editor")) return "resume editor";
  if (pathname.startsWith("/dashboard")) return "dashboard";
  if (pathname.startsWith("/cover-letter")) return "cover letter builder";
  if (pathname.startsWith("/onboarding")) return "onboarding";
  return "this feature";
}
