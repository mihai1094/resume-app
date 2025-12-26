"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Paintbrush } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const THEMES = [
    { id: "original", name: "Warm Original", color: "bg-[#e8916d]", shape: "rounded-2xl" },
    { id: "modern", name: "Electric Violet", color: "bg-[#8b5cf6]", shape: "rounded-xl" },
    { id: "neo-brutal", name: "Neo-Brutal", color: "bg-[#facc15]", shape: "rounded-none" },
    { id: "minimalist", name: "Minimalist", color: "bg-[#171717]", shape: "rounded-md" },
    { id: "soft-pastel", name: "Soft Pastel", color: "bg-[#f9a8d4]", shape: "rounded-3xl" },
    { id: "forest", name: "Deep Forest", color: "bg-[#198754]", shape: "rounded-lg" },
];

export function ThemeSwitcher() {
    const [mounted, setMounted] = useState(false);
    const [currentTheme, setCurrentTheme] = useState("original");

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        // Apply theme on mount/change
        const root = document.documentElement;
        if (currentTheme === "original") {
            root.removeAttribute("data-theme");
        } else {
            root.setAttribute("data-theme", currentTheme);
        }
    }, [currentTheme, mounted]);

    if (!mounted) return null;

    return (
        <div className="fixed bottom-6 left-6 z-50">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="lg" className="rounded-full h-12 w-12 p-0 shadow-xl bg-foreground text-background hover:bg-foreground/90 transition-all hover:scale-105 active:scale-95">
                        <Paintbrush className="w-5 h-5" />
                        <span className="sr-only">Change Theme</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64 p-2 rounded-xl">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Select Style
                    </div>
                    {THEMES.map((theme) => (
                        <DropdownMenuItem
                            key={theme.id}
                            onClick={() => setCurrentTheme(theme.id)}
                            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer focus:bg-muted"
                        >
                            {/* Shape Preview */}
                            <div className={`w-8 h-8 ${theme.color} ${theme.shape} ring-2 ring-border/50 flex items-center justify-center shadow-sm`}>
                                {currentTheme === theme.id && <div className="w-2 h-2 bg-foreground rounded-full" />}
                            </div>

                            <div className="flex-1 flex flex-col">
                                <span className={`text-sm ${currentTheme === theme.id ? "font-bold" : ""}`}>
                                    {theme.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground capitalize">
                                    {theme.shape.replace("rounded-", "")} shape
                                </span>
                            </div>
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
