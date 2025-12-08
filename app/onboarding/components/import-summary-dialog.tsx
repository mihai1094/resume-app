
"use client";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle2, AlertCircle, ArrowRight } from "lucide-react";
import { ResumeData } from "@/lib/types/resume";

interface ImportSummaryDialogProps {
    isOpen: boolean;
    data: ResumeData | null;
    onConfirm: () => void;
    onCancel?: () => void;
}

export function ImportSummaryDialog({
    isOpen,
    data,
    onConfirm,
    onCancel,
}: ImportSummaryDialogProps) {
    if (!data) return null;

    const summaryItems = [
        {
            label: "Personal Information",
            found: !!data.personalInfo.email && !!data.personalInfo.linkedin,
            details: data.personalInfo.email ? "Email found" : "Email missing",
        },
        {
            label: "Work Experience",
            found: data.workExperience.length > 0,
            details: `${data.workExperience.length} role(s) extracted`,
        },
        {
            label: "Education",
            found: data.education.length > 0,
            details: data.education.length > 0 ? `${data.education.length} school(s) found` : "Not found (check manually)",
        },
        {
            label: "Skills",
            found: data.skills.length > 0,
            details: `${data.skills.length} skill(s) identified`,
        },
        {
            label: "Professional Summary",
            found: !!data.personalInfo.summary,
            details: data.personalInfo.summary ? "Summary extracted" : "No summary section found",
        },
    ];

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onCancel?.()}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-xl text-center">🎉 Import Complete!</DialogTitle>
                </DialogHeader>

                <div className="py-4 space-y-4">
                    <p className="text-center text-muted-foreground text-sm">
                        Here's what we managed to extract from your PDF. You can edit everything in the next step.
                    </p>

                    <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                        {summaryItems.map((item, index) => (
                            <div key={index} className="flex items-start gap-3">
                                <div className={`mt-0.5 ${item.found ? "text-green-500" : "text-amber-500"}`}>
                                    {item.found ? (
                                        <CheckCircle2 className="w-5 h-5" />
                                    ) : (
                                        <AlertCircle className="w-5 h-5" />
                                    )}
                                </div>
                                <div className="space-y-0.5">
                                    <p className="font-medium text-sm leading-none">{item.label}</p>
                                    <p className="text-xs text-muted-foreground">{item.details}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <DialogFooter className="sm:justify-center">
                    <Button onClick={onConfirm} className="w-full sm:w-auto" size="lg">
                        Continue to Editor <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
