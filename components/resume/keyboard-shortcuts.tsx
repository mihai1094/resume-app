"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { HelpCircle, Command } from "lucide-react";
import { cn } from "@/lib/utils";

interface Shortcut {
    keys: string[];
    description: string;
    category: "General" | "Navigation" | "Editing";
}

const shortcuts: Shortcut[] = [
    // General
    { keys: ["⌘", "S"], description: "Save resume", category: "General" },
    { keys: ["F"], description: "Toggle preview fullscreen", category: "General" },
    { keys: ["⌘", "P"], description: "Toggle preview", category: "General" },
    { keys: ["⌘", "D"], description: "Download PDF", category: "General" },
    { keys: ["⌘", "K"], description: "Open command palette", category: "General" },
    { keys: ["?"], description: "Show keyboard shortcuts", category: "General" },

    // Navigation
    { keys: ["⌘", "1"], description: "Go to Personal Info", category: "Navigation" },
    { keys: ["⌘", "2"], description: "Go to Experience", category: "Navigation" },
    { keys: ["⌘", "3"], description: "Go to Education", category: "Navigation" },
    { keys: ["⌘", "4"], description: "Go to Skills", category: "Navigation" },

    // Editing
    { keys: ["⌘", "Z"], description: "Undo", category: "Editing" },
    { keys: ["⌘", "⇧", "Z"], description: "Redo", category: "Editing" },
    { keys: ["⌘", "Enter"], description: "Add new entry", category: "Editing" },
    { keys: ["Esc"], description: "Close dialog", category: "Editing" },
];

const categories = ["General", "Navigation", "Editing"] as const;

export function KeyboardShortcuts({ children }: { children?: React.ReactNode }) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Keyboard Shortcuts (?)"
                    >
                        <HelpCircle className="w-4 h-4" />
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Command className="w-5 h-5" />
                        Keyboard Shortcuts
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 mt-4">
                    {categories.map((category) => {
                        const categoryShortcuts = shortcuts.filter(
                            (s) => s.category === category
                        );

                        return (
                            <div key={category}>
                                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                                    {category}
                                </h3>
                                <div className="space-y-2">
                                    {categoryShortcuts.map((shortcut, idx) => (
                                        <div
                                            key={idx}
                                            className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                                        >
                                            <span className="text-sm">{shortcut.description}</span>
                                            <div className="flex items-center gap-1">
                                                {shortcut.keys.map((key, keyIdx) => (
                                                    <span key={keyIdx} className="flex items-center gap-1">
                                                        <kbd
                                                            className={cn(
                                                                "px-2 py-1 text-xs font-semibold rounded border shadow-sm",
                                                                "bg-muted border-border"
                                                            )}
                                                        >
                                                            {key}
                                                        </kbd>
                                                        {keyIdx < shortcut.keys.length - 1 && (
                                                            <span className="text-muted-foreground">+</span>
                                                        )}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="mt-6 pt-4 border-t">
                    <p className="text-xs text-muted-foreground text-center">
                        Press <kbd className="px-1.5 py-0.5 text-xs font-semibold rounded border bg-muted">?</kbd> anytime to open this dialog
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
