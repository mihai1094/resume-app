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
    { id: "original", name: "Warm Original", color: "bg-[#e8916d]" }, // Approx Coral
    { id: "modern", name: "Electric Violet", color: "bg-[#8b5cf6]" }, // Violet
    { id: "professional", name: "Deep Navy", color: "bg-[#2c3e50]" }, // Navy
];

export function ThemeSwitcher() {
    const [currentTheme, setCurrentTheme] = useState("original");

    useEffect(() => {
        // Apply theme on mount/change
        const root = document.documentElement;
        if (currentTheme === "original") {
            root.removeAttribute("data-theme");
        } else {
            root.setAttribute("data-theme", currentTheme);
        }
    }, [currentTheme]);

    return (
        <div className="fixed bottom-6 left-6 z-50">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button size="lg" className="rounded-full h-12 w-12 p-0 shadow-xl bg-foreground text-background hover:bg-foreground/90 transition-all hover:scale-105 active:scale-95">
                        <Paintbrush className="w-5 h-5" />
                        <span className="sr-only">Change Theme</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 p-2 rounded-xl">
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Select Look
                    </div>
                    {THEMES.map((theme) => (
                        <DropdownMenuItem
                            key={theme.id}
                            onClick={() => setCurrentTheme(theme.id)}
                            className="flex items-center gap-3 p-3 rounded-lg cursor-pointer focus:bg-muted"
                        >
                            <div className={`w-4 h-4 rounded-full ${theme.color} ring-2 ring-border/50`} />
                            <span className={`flex-1 ${currentTheme === theme.id ? "font-bold" : ""}`}>
                                {theme.name}
                            </span>
                            {currentTheme === theme.id && (
                                <div className="w-1.5 h-1.5 rounded-full bg-foreground" />
                            )}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    );
}
