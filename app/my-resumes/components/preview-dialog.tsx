import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { PreviewPanel } from "@/components/resume/preview-panel";
import { DEFAULT_TEMPLATE_CUSTOMIZATION } from "@/lib/constants/defaults";
import { ResumeData } from "@/lib/types/resume";
import { TemplateId } from "@/lib/constants/templates";
import { format } from "date-fns";

interface PreviewDialogProps {
    resume: {
        id: string;
        name: string;
        templateId: string;
        data: ResumeData;
        updatedAt: Date | string;
    } | null;
    onClose: () => void;
}

export function PreviewDialog({ resume, onClose }: PreviewDialogProps) {
    return (
        <Dialog
            open={!!resume}
            onOpenChange={(open) => {
                if (!open) {
                    onClose();
                }
            }}
        >
            <DialogContent className="max-w-5xl w-[95vw]">
                <DialogHeader>
                    <DialogTitle className="flex flex-col gap-2 pr-8">
                        <span>Preview: {resume?.name ?? "Resume"}</span>
                        {resume && (
                            <Badge variant="outline" className="capitalize w-fit">
                                {resume.templateId}
                            </Badge>
                        )}
                    </DialogTitle>
                    {resume && (
                        <DialogDescription>
                            Last updated{" "}
                            {format(new Date(resume.updatedAt), "MMM d, yyyy")}
                        </DialogDescription>
                    )}
                </DialogHeader>
                {resume && (
                    <PreviewPanel
                        templateId={resume.templateId as TemplateId}
                        resumeData={resume.data}
                        customization={DEFAULT_TEMPLATE_CUSTOMIZATION}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
}
