"use client";

import { Button } from "@/components/ui/button";
import { Plus, FileText, Upload } from "lucide-react";
import Link from "next/link";

interface QuickActionsProps {
    onCreateResume: () => void;
    onImportResume: () => void;
}

export function QuickActions({
    onCreateResume,
    onImportResume,
}: QuickActionsProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <Button
                size="lg"
                className="h-auto py-6 flex flex-col gap-2 shadow-md hover:shadow-lg transition-all"
                onClick={onCreateResume}
            >
                <Plus className="h-6 w-6" />
                <span className="font-semibold">Create New Resume</span>
                <span className="text-xs font-normal opacity-90">
                    Start from scratch or template
                </span>
            </Button>

            <Button
                variant="outline"
                size="lg"
                className="h-auto py-6 flex flex-col gap-2 hover:bg-accent/50 transition-all"
                asChild
            >
                <Link href="/cover-letter">
                    <FileText className="h-6 w-6 text-blue-500" />
                    <span className="font-semibold">Create new Cover Letter</span>
                    <span className="text-xs font-normal text-muted-foreground">
                        AI-generated & personalized
                    </span>
                </Link>
            </Button>

            <Button
                variant="outline"
                size="lg"
                className="h-auto py-6 flex flex-col gap-2 hover:bg-accent/50 transition-all"
                onClick={onImportResume}
            >
                <Upload className="h-6 w-6 text-orange-500" />
                <span className="font-semibold">Import Resume</span>
                <span className="text-xs font-normal text-muted-foreground">
                    Upload JSON backup
                </span>
            </Button>
        </div>
    );
}
