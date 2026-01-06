import { AppHeader } from "@/components/shared/app-header";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function SettingsHeader() {
  const router = useRouter();
  const { user, logout } = useUser();

  const handleLogout = useCallback(async () => {
    await logout();
    router.push("/");
  }, [logout, router]);

  const planLabel = user?.plan === "premium" ? "Premium" : "Free";
  const planVariant = user?.plan === "premium" ? "default" : "secondary";

  return (
    <AppHeader
      title="Settings"
      showBack={true}
      user={user}
      onLogout={handleLogout}
    >
      {user && (
        <Badge variant={planVariant} className="uppercase tracking-wide">
          {planLabel}
        </Badge>
      )}
    </AppHeader>
  );
}
