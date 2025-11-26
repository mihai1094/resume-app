"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { SettingsContent } from "./settings-content";
import { LoadingPage } from "@/components/shared/loading";

export default function SettingsPage() {
    const { user, isLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return <LoadingPage text="Loading settings..." />;
    }

    if (!user) {
        return null; // Will redirect
    }

    return <SettingsContent />;
}
