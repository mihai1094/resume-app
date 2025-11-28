import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

interface DeleteConfirmationDialogProps {
    resume: { id: string; name: string } | null;
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting: boolean;
}

export function DeleteConfirmationDialog({
    resume,
    onConfirm,
    onCancel,
    isDeleting,
}: DeleteConfirmationDialogProps) {
    return (
        <Dialog
            open={!!resume}
            onOpenChange={(open) => {
                if (!open) {
                    onCancel();
                }
            }}
        >
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Delete this resume?</DialogTitle>
                    <DialogDescription>
                        This action cannot be undone. The resume{" "}
                        <span className="font-semibold">{resume?.name}</span> will be
                        permanently removed.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={!resume || isDeleting}
                    >
                        {isDeleting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            "Delete"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
