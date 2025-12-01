import { AppHeader } from "@/components/shared/app-header";
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

    return <AppHeader title="Settings" showBack={true} user={user} onLogout={handleLogout} />;
}
