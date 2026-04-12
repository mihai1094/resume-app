"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { authFetch } from "@/lib/api/auth-fetch";
import { Star, Quote } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface TestimonialRequestCardProps {
  defaultName?: string | null;
}

const MAX_CONTENT_LENGTH = 400;

export function TestimonialRequestCard({
  defaultName,
}: TestimonialRequestCardProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(defaultName ?? "");
  const [role, setRole] = useState("");
  const [company, setCompany] = useState("");
  const [content, setContent] = useState("");
  const [rating, setRating] = useState(5);
  const [consentToPublish, setConsentToPublish] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reset = () => {
    setName(defaultName ?? "");
    setRole("");
    setCompany("");
    setContent("");
    setRating(5);
    setConsentToPublish(false);
  };

  const handleSubmit = async () => {
    if (
      !name.trim() ||
      !role.trim() ||
      !company.trim() ||
      !content.trim() ||
      !consentToPublish
    ) {
      toast.error("Please complete the testimonial form before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await authFetch("/api/testimonials", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          role: role.trim(),
          company: company.trim(),
          content: content.trim(),
          rating,
          consentToPublish,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || "Failed to submit testimonial.");
      }

      toast.success("Thanks. Your testimonial is pending review.");
      reset();
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to submit testimonial."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
      <CardHeader className="space-y-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Quote className="h-4 w-4 text-primary" />
          Share a real testimonial
        </CardTitle>
        <CardDescription>
          If ResumeZeus helped you ship a better application faster, send a
          short quote. We only publish approved testimonials from real users.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Keep it specific: what changed, what felt useful, or what saved you time.
        </p>
        <Dialog
          open={open}
          onOpenChange={(nextOpen) => {
            setOpen(nextOpen);
            if (!nextOpen) reset();
          }}
        >
          <DialogTrigger asChild>
            <Button type="button">Submit testimonial</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Share your ResumeZeus experience</DialogTitle>
              <DialogDescription>
                This goes into an admin review queue first. Nothing is published automatically.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="testimonial-name">Your name</Label>
                  <Input
                    id="testimonial-name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Jane Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="testimonial-role">Role</Label>
                  <Input
                    id="testimonial-role"
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    placeholder="Product Designer"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="testimonial-company">Company</Label>
                <Input
                  id="testimonial-company"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                  placeholder="Acme"
                />
              </div>

              <div className="space-y-2">
                <Label>Rating</Label>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, index) => {
                    const starValue = index + 1;
                    return (
                      <button
                        key={starValue}
                        type="button"
                        className="rounded-lg p-1"
                        onClick={() => setRating(starValue)}
                        aria-label={`Rate ${starValue} stars`}
                      >
                        <Star
                          className={cn(
                            "h-5 w-5 transition-colors",
                            starValue <= rating
                              ? "fill-primary text-primary"
                              : "text-muted-foreground/40"
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="testimonial-content">Quote</Label>
                <Textarea
                  id="testimonial-content"
                  rows={5}
                  value={content}
                  onChange={(event) =>
                    setContent(event.target.value.slice(0, MAX_CONTENT_LENGTH))
                  }
                  placeholder="ResumeZeus helped me tighten the resume, check ATS gaps live, and send a much better PDF in one sitting."
                />
                <p className="text-right text-xs text-muted-foreground">
                  {content.length}/{MAX_CONTENT_LENGTH}
                </p>
              </div>

              <label className="flex items-start gap-3 rounded-lg border p-3">
                <Checkbox
                  checked={consentToPublish}
                  onCheckedChange={(checked) =>
                    setConsentToPublish(checked === true)
                  }
                />
                <span className="text-sm text-muted-foreground">
                  I confirm this quote is mine and I consent to ResumeZeus publishing it after review.
                </span>
              </label>

              <Button
                type="button"
                className="w-full"
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? "Submitting..." : "Send testimonial"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
