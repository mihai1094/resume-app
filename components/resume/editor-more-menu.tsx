"use client";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
    MoreHorizontal,
    Undo2,
    Redo2,
    Download,
    Sparkles,
    HelpCircle,
    RotateCcw,
    Upload,
} from "lucide-react";
import { KeyboardShortcuts } from "./keyboard-shortcuts";

interface EditorMoreMenuProps {
    onUndo?: () => void;
    onRedo?: () => void;
    canUndo?: boolean;
    canRedo?: boolean;
    onExportJSON: () => void;
    onReset: () => void;
    onImport: () => void;
    showAIJobMatcher?: boolean;
    showKeyboardShortcuts?: boolean;
}

export function EditorMoreMenu({
    onUndo,
    onRedo,
    canUndo = false,
    canRedo = false,
    onExportJSON,
    onReset,
    onImport,
    showAIJobMatcher = false,
    showKeyboardShortcuts = true,
}: EditorMoreMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreHorizontal className="w-4 h-4" />
                    <span className="sr-only">More options</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Undo/Redo */}
                {onUndo && onRedo && (
                    <>
                        <DropdownMenuItem onClick={onUndo} disabled={!canUndo}>
                            <Undo2 className="w-4 h-4 mr-2" />
                            Undo
                            <span className="ml-auto text-xs text-muted-foreground">⌘Z</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={onRedo} disabled={!canRedo}>
                            <Redo2 className="w-4 h-4 mr-2" />
                            Redo
                            <span className="ml-auto text-xs text-muted-foreground">⌘⇧Z</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </>
                )}

                {/* Import/Export */}
                <DropdownMenuItem onClick={onImport}>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExportJSON}>
                    <Download className="w-4 h-4 mr-2" />
                    Export JSON
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Reset */}
                <DropdownMenuItem onClick={onReset} className="text-destructive">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Resume
                </DropdownMenuItem>

                {showKeyboardShortcuts && (
                    <>
                        <DropdownMenuSeparator />
                        <KeyboardShortcuts>
                            <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                <HelpCircle className="w-4 h-4 mr-2" />
                                Keyboard Shortcuts
                                <span className="ml-auto text-xs text-muted-foreground">?</span>
                            </DropdownMenuItem>
                        </KeyboardShortcuts>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
