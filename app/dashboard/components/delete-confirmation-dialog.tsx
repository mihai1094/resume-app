import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";

interface DeleteConfirmationDialogProps {
    resume: { id: string; name: string } | null;
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting: boolean;
    confirmationText: string;
    setConfirmationText: (text: string) => void;
}

export function DeleteConfirmationDialog({
    resume,
    onConfirm,
    onCancel,
    isDeleting,
    confirmationText,
    setConfirmationText,
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
                        Type <span className="font-semibold">{resume?.name}</span> to
                        confirm. This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <Input
                    value={confirmationText}
                    onChange={(e) => setConfirmationText(e.target.value)}
                    placeholder={resume?.name ?? ""}
                />
                <DialogFooter>
                    <Button variant="outline" onClick={onCancel}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onConfirm}
                        disabled={
                            !resume ||
                            confirmationText !== resume.name ||
                            isDeleting
                        }
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
