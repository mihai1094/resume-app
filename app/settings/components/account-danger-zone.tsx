"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
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
import { Loader2, Trash2, ShieldAlert } from "lucide-react";
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
  const [showReauthDialog, setShowReauthDialog] = useState(false);
  const [reauthPassword, setReauthPassword] = useState("");
  const [isReauthenticating, setIsReauthenticating] = useState(false);

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
