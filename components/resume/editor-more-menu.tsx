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
    HelpCircle,
    RotateCcw,
    Upload,
    FileText,
    Palette,
    LayoutGrid,
} from "lucide-react";
import { KeyboardShortcuts } from "./keyboard-shortcuts";

interface EditorMoreMenuProps {
    onUndo?: () => void;
    onRedo?: () => void;
    canUndo?: boolean;
    canRedo?: boolean;
    onExportJSON: () => void;
    onExportPDF?: () => void;
    isExporting?: boolean;
    onReset: () => void;
    onImport: () => void;
    onToggleCustomizer?: () => void;
    onOpenTemplateGallery?: () => void;
    showCustomizer?: boolean;
    showAIJobMatcher?: boolean;
    showKeyboardShortcuts?: boolean;
}

export function EditorMoreMenu({
    onUndo,
    onRedo,
    canUndo = false,
    canRedo = false,
    onExportJSON,
    onExportPDF,
    isExporting = false,
    onReset,
    onImport,
    onToggleCustomizer,
    onOpenTemplateGallery,
    showCustomizer = false,
    showAIJobMatcher = false,
    showKeyboardShortcuts = true,
}: EditorMoreMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                    <MoreHorizontal className="w-5 h-5" />
                    <span className="sr-only">More options</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Tools & Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Tools */}
                {onOpenTemplateGallery && (
                    <DropdownMenuItem onClick={onOpenTemplateGallery}>
                        <LayoutGrid className="w-4 h-4 mr-2" />
                        Change Template
                    </DropdownMenuItem>
                )}
                {onToggleCustomizer && (
                    <>
                        {onOpenTemplateGallery && <DropdownMenuSeparator />}
                        <DropdownMenuItem onClick={onToggleCustomizer}>
                            <Palette className="w-4 h-4 mr-2" />
                            {showCustomizer ? "Hide Customizer" : "Customize Template"}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                    </>
                )}

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

                {/* Export */}
                {onExportPDF && (
                    <DropdownMenuItem onClick={onExportPDF} disabled={isExporting}>
                        <FileText className="w-4 h-4 mr-2" />
                        {isExporting ? "Exporting PDF..." : "Export PDF"}
                    </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={onExportJSON} disabled={isExporting}>
                    <Download className="w-4 h-4 mr-2" />
                    {isExporting ? "Exporting..." : "Export JSON"}
                </DropdownMenuItem>

                {/* Import */}
                <DropdownMenuItem onClick={onImport}>
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
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
