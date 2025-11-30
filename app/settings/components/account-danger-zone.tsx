"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { useSavedResumes } from "@/hooks/use-saved-resumes";
import { useSavedCoverLetters } from "@/hooks/use-saved-cover-letters";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Trash2, Download, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export function AccountDangerZone() {
  const {
    user,
    deleteAccount,
    reauthenticateWithGoogle,
    reauthenticateWithEmail,
    getUserProvider,
  } = useUser();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [isExportingResumes, setIsExportingResumes] = useState(false);
  const [isExportingCoverLetters, setIsExportingCoverLetters] = useState(false);
  const [showReauthDialog, setShowReauthDialog] = useState(false);
  const [reauthPassword, setReauthPassword] = useState("");
  const [isReauthenticating, setIsReauthenticating] = useState(false);

  const { resumes } = useSavedResumes(user?.id ?? null);
  const { coverLetters } = useSavedCoverLetters(user?.id ?? null);

  const handleExportResumes = () => {
    setIsExportingResumes(true);
    try {
      if (resumes.length === 0) {
        toast.info("You don't have any resumes to export");
        return;
      }

      const dataStr = JSON.stringify(resumes, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `resumes-export-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(
        `Exported ${resumes.length} resume${resumes.length === 1 ? "" : "s"}`
      );
    } catch (error) {
      toast.error("Failed to export resumes");
    } finally {
      setIsExportingResumes(false);
    }
  };

  const handleExportCoverLetters = () => {
    setIsExportingCoverLetters(true);
    try {
      if (coverLetters.length === 0) {
        toast.info("You don't have any cover letters to export");
        return;
      }

      const dataStr = JSON.stringify(coverLetters, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `cover-letters-export-${
        new Date().toISOString().split("T")[0]
      }.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(
        `Exported ${coverLetters.length} cover letter${
          coverLetters.length === 1 ? "" : "s"
        }`
      );
    } catch (error) {
      toast.error("Failed to export cover letters");
    } finally {
      setIsExportingCoverLetters(false);
    }
  };

  const handleReauthenticate = async () => {
    const provider = getUserProvider();
    setIsReauthenticating(true);

    try {
      let success = false;

      if (provider === "google") {
        success = await reauthenticateWithGoogle();
      } else if (provider === "password" && reauthPassword) {
        success = await reauthenticateWithEmail(reauthPassword);
      }

      if (success) {
        setShowReauthDialog(false);
        setReauthPassword("");
        // Now try to delete again
        await handleDeleteAccount();
      } else {
        toast.error("Re-authentication failed. Please check your credentials.");
      }
    } catch (error) {
      toast.error("Re-authentication failed");
    } finally {
      setIsReauthenticating(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!deleteAccount) return;

    setIsDeleting(true);
    try {
      const result = await deleteAccount();
      if (result.success) {
        toast.success("Account deleted successfully");
        router.push("/login");
      } else if (result.requiresReauth) {
        // Show re-authentication dialog
        setShowReauthDialog(true);
        toast.info("Please re-authenticate to complete this action");
      } else {
        toast.error("Failed to delete account. Please try again.");
      }
    } catch (error) {
      toast.error("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Data Export Section */}
      <Card>
        <CardHeader>
          <CardTitle>Export Your Data</CardTitle>
          <CardDescription>
            Download all your resumes and cover letters as JSON files for backup
            or portability.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <p className="font-medium">Export Resumes</p>
              <p className="text-sm text-muted-foreground">
                Download all your saved resumes ({resumes.length} total) as a
                JSON file.
              </p>
            </div>
            <Button
              onClick={handleExportResumes}
              disabled={isExportingResumes || resumes.length === 0}
              variant="outline"
            >
              {isExportingResumes ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export Resumes
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <p className="font-medium">Export Cover Letters</p>
              <p className="text-sm text-muted-foreground">
                Download all your saved cover letters ({coverLetters.length}{" "}
                total) as a JSON file.
              </p>
            </div>
            <Button
              onClick={handleExportCoverLetters}
              disabled={isExportingCoverLetters || coverLetters.length === 0}
              variant="outline"
            >
              {isExportingCoverLetters ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              Export Cover Letters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone Section */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions for your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1 flex-1">
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all of your content.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDeleteAccount}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      "Delete Account"
                    )}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      {/* Re-authentication Dialog */}
      <Dialog open={showReauthDialog} onOpenChange={setShowReauthDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-amber-500" />
              Security Verification Required
            </DialogTitle>
            <DialogDescription>
              For your security, please verify your identity before deleting
              your account.
            </DialogDescription>
          </DialogHeader>

          {getUserProvider() === "google" ? (
            <div className="py-4">
              <p className="text-sm text-muted-foreground mb-4">
                Click the button below to re-authenticate with your Google
                account.
              </p>
              <Button
                onClick={handleReauthenticate}
                disabled={isReauthenticating}
                className="w-full"
              >
                {isReauthenticating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Continue with Google
              </Button>
            </div>
          ) : (
            <div className="py-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reauth-password">Enter your password</Label>
                <Input
                  id="reauth-password"
                  type="password"
                  placeholder="Your password"
                  value={reauthPassword}
                  onChange={(e) => setReauthPassword(e.target.value)}
                  disabled={isReauthenticating}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowReauthDialog(false);
                setReauthPassword("");
              }}
              disabled={isReauthenticating}
            >
              Cancel
            </Button>
            {getUserProvider() !== "google" && (
              <Button
                variant="destructive"
                onClick={handleReauthenticate}
                disabled={isReauthenticating || !reauthPassword}
              >
                {isReauthenticating ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Verify & Delete
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
