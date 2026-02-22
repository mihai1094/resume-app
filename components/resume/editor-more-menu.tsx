"use client";

import { useState } from "react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";
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
    const [sheetOpen, setSheetOpen] = useState(false);

    const trigger = (
        <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-5 h-5" />
            <span className="sr-only">More options</span>
        </Button>
    );

    // Shared action list — used in both Sheet (mobile) and Dropdown (desktop)
    const ActionList = ({ onAction }: { onAction: () => void }) => (
        <div className="flex flex-col gap-0.5">
            {/* Change Template — desktop only via dropdown; on mobile the Live Preview overlay handles it */}
            {onOpenTemplateGallery && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-3 h-10 px-2 hidden sm:flex"
                    onClick={() => { onAction(); onOpenTemplateGallery(); }}
                >
                    <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                    Change Template
                </Button>
            )}

            {onToggleCustomizer && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-3 h-10 px-2"
                    onClick={() => { onAction(); onToggleCustomizer(); }}
                >
                    <Palette className="w-4 h-4 text-muted-foreground" />
                    {showCustomizer ? "Hide Customizer" : "Customize Template"}
                </Button>
            )}

            {onUndo && onRedo && (
                <>
                    <div className="h-px bg-border my-2" />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between gap-3 h-10 px-2"
                        disabled={!canUndo}
                        onClick={() => { onAction(); onUndo(); }}
                    >
                        <span className="flex items-center gap-3">
                            <Undo2 className="w-4 h-4 text-muted-foreground" />
                            Undo
                        </span>
                        <span className="text-xs text-muted-foreground">⌘Z</span>
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-between gap-3 h-10 px-2"
                        disabled={!canRedo}
                        onClick={() => { onAction(); onRedo(); }}
                    >
                        <span className="flex items-center gap-3">
                            <Redo2 className="w-4 h-4 text-muted-foreground" />
                            Redo
                        </span>
                        <span className="text-xs text-muted-foreground">⌘⇧Z</span>
                    </Button>
                </>
            )}

            <div className="h-px bg-border my-2" />

            {onExportPDF && (
                <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-3 h-10 px-2"
                    disabled={isExporting}
                    onClick={() => { onAction(); onExportPDF(); }}
                >
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    {isExporting ? "Exporting PDF..." : "Export PDF"}
                </Button>
            )}

            <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-3 h-10 px-2"
                disabled={isExporting}
                onClick={() => { onAction(); onExportJSON(); }}
            >
                <Download className="w-4 h-4 text-muted-foreground" />
                Export JSON
            </Button>

            <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-3 h-10 px-2"
                onClick={() => { onAction(); onImport(); }}
            >
                <Upload className="w-4 h-4 text-muted-foreground" />
                Import Data
            </Button>

            <div className="h-px bg-border my-2" />

            <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start gap-3 h-10 px-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => { onAction(); onReset(); }}
            >
                <RotateCcw className="w-4 h-4" />
                Reset Resume
            </Button>

            {showKeyboardShortcuts && (
                <>
                    <div className="h-px bg-border my-2" />
                    <KeyboardShortcuts>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-between gap-3 h-10 px-2"
                            onClick={onAction}
                        >
                            <span className="flex items-center gap-3">
                                <HelpCircle className="w-4 h-4 text-muted-foreground" />
                                Keyboard Shortcuts
                            </span>
                            <span className="text-xs text-muted-foreground">?</span>
                        </Button>
                    </KeyboardShortcuts>
                </>
            )}
        </div>
    );

    return (
        <>
            {/* ── Mobile: Sheet ── */}
            <div className="lg:hidden">
                <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                    <SheetTrigger asChild>{trigger}</SheetTrigger>
                    <SheetContent side="right" className="w-[85%] sm:w-[380px] pr-0">
                        <SheetHeader className="text-left px-1">
                            <SheetTitle>Tools &amp; Actions</SheetTitle>
                        </SheetHeader>
                        <div className="mt-4 overflow-y-auto pb-8 pr-6 pl-1 scrollbar-none">
                            <ActionList onAction={() => setSheetOpen(false)} />
                        </div>
                    </SheetContent>
                </Sheet>
            </div>

            {/* ── Desktop: Dropdown ── */}
            <div className="hidden lg:block">
                <DropdownMenu modal={false}>
                    <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>Tools &amp; Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />

                        <span className="hidden sm:contents">
                            {onOpenTemplateGallery && (
                                <DropdownMenuItem onClick={onOpenTemplateGallery}>
                                    <LayoutGrid className="w-4 h-4 mr-2" />
                                    Change Template
                                </DropdownMenuItem>
                            )}
                        </span>

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
                        <DropdownMenuItem onClick={onImport}>
                            <Upload className="w-4 h-4 mr-2" />
                            Import Data
                        </DropdownMenuItem>

                        <DropdownMenuSeparator />

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
            </div>
        </>
    );
}
