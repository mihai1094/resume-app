"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Globe,
  Link2,
  Copy,
  Check,
  Twitter,
  Linkedin,
  Facebook,
  Mail,
  AlertCircle,
  Loader2,
  Crown,
} from "lucide-react";
import { QRCodeDisplay } from "./qr-code-display";
import { toast } from "sonner";
import { ResumeData } from "@/lib/types/resume";
import { TemplateCustomization } from "@/components/resume/template-customizer";
import { sharingService } from "@/lib/services/sharing-service";
import { usernameService } from "@/lib/services/username-service";
import {
  ShareSettings,
  DEFAULT_PRIVACY_SETTINGS,
  generateSlug,
  getShareUrl,
} from "@/lib/types/sharing";
import { useUser } from "@/hooks/use-user";

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resumeId: string;
  resumeData: ResumeData;
  templateId: string;
  customization: TemplateCustomization;
}

export function ShareDialog({
  open,
  onOpenChange,
  resumeId,
  resumeData,
  templateId,
  customization,
}: ShareDialogProps) {
  const { user } = useUser();
  const plan = user?.plan || "free";
  const [isPublished, setIsPublished] = useState(false);
  const [publicUrl, setPublicUrl] = useState<string | null>(null);
  const [slug, setSlug] = useState("");
  const [username, setUsername] = useState("");
  const [isSettingUsername, setIsSettingUsername] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [usernameError, setUsernameError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [copied, setCopied] = useState(false);
  const [privacySettings, setPrivacySettings] = useState<ShareSettings["privacy"]>(
    DEFAULT_PRIVACY_SETTINGS
  );
  const [canPublish, setCanPublish] = useState<{
    allowed: boolean;
    current: number;
    limit: number;
  } | null>(null);

  // Check current publishing status
  useEffect(() => {
    const checkStatus = async () => {
      if (!open || !user?.id) return;

      setIsCheckingStatus(true);
      try {
        // Check if resume is already published
        const info = await sharingService.getPublicResumeInfo(resumeId);
        if (info?.isPublic && info.url) {
          setIsPublished(true);
          setPublicUrl(info.url);
          setSlug(info.slug || "");
        } else {
          setIsPublished(false);
          setPublicUrl(null);
          // Generate default slug from job title
          const defaultSlug = generateSlug(
            resumeData.personalInfo.jobTitle ||
              `${resumeData.personalInfo.firstName}-${resumeData.personalInfo.lastName}`
          );
          setSlug(defaultSlug);
        }

        // Get username
        const existingUsername = await usernameService.getUsernameFromUserId(
          user.id
        );
        if (existingUsername) {
          setUsername(existingUsername);
          setIsSettingUsername(false);
        } else {
          setIsSettingUsername(true);
          // Suggest username from display name
          const suggestions = usernameService.generateSuggestions(
            user.name || resumeData.personalInfo.firstName || "user"
          );
          setNewUsername(suggestions[0] || "");
        }

        // Check publishing limits
        const limits = await sharingService.canPublishResume(
          user.id,
          plan || "free"
        );
        setCanPublish(limits);
      } catch (error) {
        console.error("Error checking share status:", error);
      } finally {
        setIsCheckingStatus(false);
      }
    };

    checkStatus();
  }, [open, user?.id, resumeId, resumeData, plan]);

  const handleSetUsername = async () => {
    if (!user?.id || !newUsername) return;

    setIsLoading(true);
    setUsernameError(null);

    try {
      const validation = await usernameService.validateAndCheckAvailability(
        newUsername
      );

      if (!validation.isValid || !validation.isAvailable) {
        setUsernameError(validation.error || "Username not available");
        if (validation.suggestion) {
          setNewUsername(validation.suggestion);
        }
        return;
      }

      await usernameService.claimUsername(user.id, newUsername);
      setUsername(newUsername);
      setIsSettingUsername(false);
      toast.success("Username set successfully!");
    } catch (error) {
      console.error("Error setting username:", error);
      setUsernameError(
        error instanceof Error ? error.message : "Failed to set username"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handlePublish = async () => {
    if (!user?.id || !username) return;

    // Check limits
    if (canPublish && !canPublish.allowed && !isPublished) {
      toast.error(
        `You've reached your limit of ${canPublish.limit} public resume${
          canPublish.limit !== 1 ? "s" : ""
        }. Upgrade to Premium for unlimited public links.`
      );
      return;
    }

    setIsLoading(true);
    try {
      const result = await sharingService.publishResume(
        user.id,
        resumeId,
        resumeData,
        templateId,
        customization,
        {
          customSlug: slug,
          privacy: privacySettings,
        }
      );

      setPublicUrl(result.url);
      setIsPublished(true);
      toast.success("Resume published successfully!");
    } catch (error) {
      console.error("Error publishing resume:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to publish resume"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnpublish = async () => {
    setIsLoading(true);
    try {
      await sharingService.unpublishResume(resumeId);
      setIsPublished(false);
      setPublicUrl(null);
      toast.success("Resume unpublished");
    } catch (error) {
      console.error("Error unpublishing resume:", error);
      toast.error("Failed to unpublish resume");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: "twitter" | "linkedin" | "facebook" | "email") => {
    if (!publicUrl) return;
    const title = `${resumeData.personalInfo.firstName} ${resumeData.personalInfo.lastName}'s Resume`;
    const shareUrl = getShareUrl(platform, publicUrl, title);
    window.open(shareUrl, "_blank", "width=600,height=400");
  };

  if (isCheckingStatus) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Username setup step
  if (isSettingUsername) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Your Username</DialogTitle>
            <DialogDescription>
              Choose a unique username for your public resume URL.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Username</Label>
              <div className="flex gap-2">
                <div className="flex-1 relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    resumeforge.app/u/
                  </span>
                  <Input
                    value={newUsername}
                    onChange={(e) => {
                      setNewUsername(e.target.value.toLowerCase());
                      setUsernameError(null);
                    }}
                    className="pl-[140px]"
                    placeholder="your-name"
                  />
                </div>
              </div>
              {usernameError && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {usernameError}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                3-30 characters, lowercase letters, numbers, and hyphens only
              </p>
            </div>

            <Button
              onClick={handleSetUsername}
              disabled={isLoading || !newUsername}
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Share Resume
          </DialogTitle>
          <DialogDescription>
            Make your resume available via a public link
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={isPublished ? "share" : "settings"}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="share" disabled={!isPublished}>
              Share
            </TabsTrigger>
          </TabsList>

          <TabsContent value="settings" className="space-y-4 py-4">
            {/* Publishing Status */}
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Public Resume</Label>
                <p className="text-sm text-muted-foreground">
                  {isPublished
                    ? "Your resume is publicly accessible"
                    : "Make your resume available to anyone with the link"}
                </p>
              </div>
              <Switch
                checked={isPublished}
                onCheckedChange={(checked) => {
                  if (checked) {
                    handlePublish();
                  } else {
                    handleUnpublish();
                  }
                }}
                disabled={isLoading}
              />
            </div>

            {/* Plan limit warning */}
            {canPublish && !canPublish.allowed && !isPublished && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg text-amber-800 dark:text-amber-200">
                <Crown className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium">Upgrade to Premium</p>
                  <p className="text-amber-700 dark:text-amber-300">
                    You've used {canPublish.current} of {canPublish.limit} public
                    link{canPublish.limit !== 1 ? "s" : ""}. Upgrade for
                    unlimited sharing.
                  </p>
                </div>
              </div>
            )}

            {/* URL Preview */}
            <div className="space-y-2">
              <Label>Your Resume URL</Label>
              <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                <Link2 className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                <code className="text-sm break-all">
                  resumeforge.app/u/{username}/{slug}
                </code>
              </div>
            </div>

            {/* Custom Slug */}
            <div className="space-y-2">
              <Label>Custom URL Slug</Label>
              <Input
                value={slug}
                onChange={(e) =>
                  setSlug(
                    e.target.value
                      .toLowerCase()
                      .replace(/[^a-z0-9-]/g, "-")
                      .replace(/-+/g, "-")
                  )
                }
                placeholder="software-engineer"
                disabled={isPublished}
              />
              <p className="text-xs text-muted-foreground">
                Customize the end of your resume URL
              </p>
            </div>

            {/* Privacy Settings */}
            <div className="space-y-3">
              <Label>Privacy Options</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Hide email address</span>
                  <Switch
                    checked={privacySettings.hideEmail}
                    onCheckedChange={(checked) =>
                      setPrivacySettings((prev) => ({
                        ...prev,
                        hideEmail: checked,
                      }))
                    }
                    disabled={isPublished}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Hide phone number</span>
                  <Switch
                    checked={privacySettings.hidePhone}
                    onCheckedChange={(checked) =>
                      setPrivacySettings((prev) => ({
                        ...prev,
                        hidePhone: checked,
                      }))
                    }
                    disabled={isPublished}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Hide location</span>
                  <Switch
                    checked={privacySettings.hideLocation}
                    onCheckedChange={(checked) =>
                      setPrivacySettings((prev) => ({
                        ...prev,
                        hideLocation: checked,
                      }))
                    }
                    disabled={isPublished}
                  />
                </div>
              </div>
            </div>

            {!isPublished && (
              <Button
                onClick={handlePublish}
                disabled={isLoading || (canPublish !== null && !canPublish.allowed)}
                className="w-full"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Globe className="w-4 h-4 mr-2" />
                )}
                Publish Resume
              </Button>
            )}
          </TabsContent>

          <TabsContent value="share" className="space-y-4 py-4">
            {publicUrl && (
              <>
                {/* Copy Link */}
                <div className="space-y-2">
                  <Label>Resume Link</Label>
                  <div className="flex gap-2">
                    <Input
                      value={publicUrl}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={handleCopyLink}
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Social Share */}
                <div className="space-y-2">
                  <Label>Share on Social</Label>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleShare("twitter")}
                      aria-label="Share on Twitter"
                    >
                      <Twitter className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleShare("linkedin")}
                      aria-label="Share on LinkedIn"
                    >
                      <Linkedin className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleShare("facebook")}
                      aria-label="Share on Facebook"
                    >
                      <Facebook className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleShare("email")}
                      aria-label="Share via Email"
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* QR Code */}
                <div className="space-y-2">
                  <Label>QR Code</Label>
                  <div className="flex justify-center py-4">
                    <QRCodeDisplay url={publicUrl} size={160} />
                  </div>
                </div>

                {/* Stats */}
                <div className="flex gap-4 justify-center">
                  <div className="text-center">
                    <p className="text-2xl font-bold">-</p>
                    <p className="text-xs text-muted-foreground">Views</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">-</p>
                    <p className="text-xs text-muted-foreground">Downloads</p>
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
