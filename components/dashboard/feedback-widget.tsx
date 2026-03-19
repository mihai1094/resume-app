"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { MessageSquarePlus, Bug, Lightbulb, MessageCircle } from "lucide-react";
import { authFetch } from "@/lib/api/auth-fetch";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type FeedbackCategory = "bug" | "feature" | "general";

const CATEGORIES: {
  id: FeedbackCategory;
  label: string;
  icon: typeof Bug;
  description: string;
}[] = [
  {
    id: "bug",
    label: "Bug",
    icon: Bug,
    description: "Something isn't working",
  },
  {
    id: "feature",
    label: "Feature",
    icon: Lightbulb,
    description: "Suggest an improvement",
  },
  {
    id: "general",
    label: "General",
    icon: MessageCircle,
    description: "Other feedback",
  },
];

const MAX_LENGTH = 2000;

export function FeedbackWidget() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState<FeedbackCategory | null>(null);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setCategory(null);
    setMessage("");
  };

  const handleSubmit = async () => {
    if (!category || !message.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await authFetch("/api/feedback", {
        method: "POST",
        body: JSON.stringify({ category, message: message.trim() }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to submit feedback");
      }

      toast.success("Thanks for your feedback!");
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit feedback",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 gap-2 shadow-lg hover:shadow-xl transition-shadow rounded-full px-4 h-11 sm:h-10 bg-background/95 backdrop-blur-sm"
          aria-label="Send feedback"
        >
          <MessageSquarePlus className="w-4 h-4" />
          <span className="hidden sm:inline">Feedback</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Send Feedback</DialogTitle>
          <DialogDescription>
            Help us improve ResumeZeus. Bug reports, feature ideas, or general
            feedback — all welcome.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Category selector */}
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const isSelected = category === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-lg border p-3 text-center transition-all",
                    isSelected
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border hover:border-primary/30 hover:bg-muted/50 text-muted-foreground",
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-xs font-medium">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Message */}
          <div className="space-y-1.5">
            <Textarea
              placeholder={
                category === "bug"
                  ? "What happened? What did you expect instead?"
                  : category === "feature"
                    ? "Describe the feature you'd like to see..."
                    : "What's on your mind?"
              }
              value={message}
              onChange={(e) =>
                setMessage(e.target.value.slice(0, MAX_LENGTH))
              }
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/{MAX_LENGTH}
            </p>
          </div>

          {/* Submit */}
          <Button
            onClick={handleSubmit}
            disabled={!category || !message.trim() || isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Sending..." : "Send Feedback"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
