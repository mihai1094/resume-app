"use client";

import { useEffect, useState } from "react";
import { EXAMPLE_RESUME_DATA } from "@/lib/constants/example-data";
import { FormField, FormTextarea } from "@/components/forms";
import { PersonalInfo } from "@/lib/types/resume";
import { useTouchedFields } from "@/hooks/use-touched-fields";
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Sparkles, Loader2 } from "lucide-react";
import { ValidationError } from "@/lib/validation/resume-validation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAiProgress } from "@/hooks/use-ai-progress";
import { AI_OPERATION_STAGES } from "@/lib/ai/progress-tracker";
import { ProgressIndicator } from "@/components/ui/progress-indicator";

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onChange: (data: Partial<PersonalInfo>) => void;
  validationErrors?: ValidationError[];
  showErrors?: boolean;
  workExperiences?: Array<{
    position: string;
    company: string;
  }>;
  skills?: string[];
}

// Custom stages for summary generation
const SUMMARY_STAGES = [
  { id: "analyze", label: "Analyzing your profile", estimatedDuration: 2000 },
  { id: "generate", label: "Generating professional summary", estimatedDuration: 5000 },
  { id: "refine", label: "Refining and polishing", estimatedDuration: 2000 },
];

export function PersonalInfoForm({
  data,
  onChange,
  validationErrors = [],
  showErrors = false,
  workExperiences = [],
  skills = [],
}: PersonalInfoFormProps) {
  const { markTouched, markErrors, getFieldError } = useTouchedFields();
  const [isGenerating, setIsGenerating] = useState(false);
  const [tone, setTone] = useState<'professional' | 'creative' | 'technical'>('professional');

  // Progress tracking
  const aiProgress = useAiProgress({
    stages: SUMMARY_STAGES,
    onCancel: () => {
      setIsGenerating(false);
      toast.info("Summary generation cancelled");
    },
  });

  useEffect(() => {
    if (showErrors && validationErrors.length > 0) {
      markErrors(validationErrors);
    }
  }, [showErrors, validationErrors, markErrors]);

  const handleGenerateSummary = async () => {
    // Validation
    if (!data.firstName || !data.lastName) {
      toast.error("Please fill in your first and last name first");
      return;
    }

    setIsGenerating(true);
    aiProgress.start();

    try {
      // Get most recent work experience
      const recentExperience = workExperiences[0];

      // Calculate years of experience (rough estimate from work experience)
      const yearsOfExperience = workExperiences.length > 0 ? workExperiences.length * 2 : undefined;

      // Stage 1: Analyzing
      const response = await fetch("/api/ai/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          jobTitle: data.jobTitle,
          yearsOfExperience,
          keySkills: skills.slice(0, 5),
          recentPosition: recentExperience?.position,
          recentCompany: recentExperience?.company,
          tone,
        }),
        signal: aiProgress.getSignal(),
      });

      // Stage 2: Generating
      aiProgress.nextStage();

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate summary");
      }

      const responseData = await response.json();
      const summary = responseData.summary;

      // Stage 3: Refining
      aiProgress.nextStage();

      // Check if cancelled
      if (aiProgress.isCancelled()) {
        return;
      }

      // Update the summary
      onChange({ summary });

      // Complete progress
      aiProgress.complete();

      // Show different success messages based on cache
      if (responseData.meta.fromCache) {
        toast.success("Generated instantly from cache! ⚡", {
          description: `Saved $${(0.001).toFixed(4)}`,
        });
      } else {
        toast.success("Professional summary generated! ✨", {
          description: `${tone} tone | ${responseData.meta?.responseTime || 0}ms`,
        });
      }
    } catch (error) {
      // Check if error is due to cancellation
      if (error instanceof Error && error.name === "AbortError") {
        aiProgress.reset();
        return;
      }

      console.error("Error generating summary:", error);

      // Show error toast with retry option
      toast.error("Failed to generate summary", {
        description: error instanceof Error
          ? error.message
          : "Could not generate your summary. Please try again.",
        action: {
          label: "Retry",
          onClick: () => handleGenerateSummary(),
        },
      });

      aiProgress.reset();
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="First Name"
          value={data.firstName}
          onChange={(val) => onChange({ firstName: val })}
          onBlur={() => markTouched("firstName")}
          placeholder={EXAMPLE_RESUME_DATA.personalInfo.firstName}
          required
          error={getFieldError(validationErrors, "firstName")}
        />
        <FormField
          label="Last Name"
          value={data.lastName}
          onChange={(val) => onChange({ lastName: val })}
          onBlur={() => markTouched("lastName")}
          placeholder={EXAMPLE_RESUME_DATA.personalInfo.lastName}
          required
          error={getFieldError(validationErrors, "lastName")}
        />
      </div>

      {/* Job Title */}
      <FormField
        label="Job Title"
        value={data.jobTitle || ""}
        onChange={(val) => onChange({ jobTitle: val })}
        onBlur={() => markTouched("jobTitle")}
        placeholder="e.g. Product Designer"
        error={getFieldError(validationErrors, "jobTitle")}
      />

      {/* Contact Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Email"
          value={data.email}
          onChange={(val) => onChange({ email: val })}
          onBlur={() => markTouched("email")}
          placeholder={EXAMPLE_RESUME_DATA.personalInfo.email}
          type="email"
          required
          error={getFieldError(validationErrors, "email")}
          icon={<Mail className="w-4 h-4" />}
        />
        <FormField
          label="Phone"
          value={data.phone}
          onChange={(val) => onChange({ phone: val })}
          onBlur={() => markTouched("phone")}
          placeholder={EXAMPLE_RESUME_DATA.personalInfo.phone}
          type="tel"
          required
          error={getFieldError(validationErrors, "phone")}
          icon={<Phone className="w-4 h-4" />}
        />
      </div>

      {/* Location */}
      <FormField
        label="Location"
        value={data.location}
        onChange={(val) => onChange({ location: val })}
        onBlur={() => markTouched("location")}
        placeholder={EXAMPLE_RESUME_DATA.personalInfo.location}
        required
        error={getFieldError(validationErrors, "location")}
        icon={<MapPin className="w-4 h-4" />}
        helperText="City, State or City, Country"
      />

      {/* Optional Links */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-sm text-muted-foreground">Optional Links</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField
            label="Website"
            value={data.website || ""}
            onChange={(val) => onChange({ website: val })}
            onBlur={() => markTouched("website")}
            placeholder={EXAMPLE_RESUME_DATA.personalInfo.website}
            type="url"
            error={getFieldError(validationErrors, "website")}
            icon={<Globe className="w-4 h-4" />}
          />
          <FormField
            label="LinkedIn"
            value={data.linkedin || ""}
            onChange={(val) => onChange({ linkedin: val })}
            onBlur={() => markTouched("linkedin")}
            placeholder={EXAMPLE_RESUME_DATA.personalInfo.linkedin}
            error={getFieldError(validationErrors, "linkedin")}
            icon={<Linkedin className="w-4 h-4" />}
          />
          <FormField
            label="GitHub"
            value={data.github || ""}
            onChange={(val) => onChange({ github: val })}
            onBlur={() => markTouched("github")}
            placeholder={EXAMPLE_RESUME_DATA.personalInfo.github}
            error={getFieldError(validationErrors, "github")}
            icon={<Github className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Professional Summary */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">
            Professional Summary
          </label>
          {!isGenerating && (
            <div className="flex gap-2 items-center">
              <Select
                value={tone}
                onValueChange={(value: 'professional' | 'creative' | 'technical') => setTone(value)}
              >
                <SelectTrigger className="w-[140px] h-8">
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="creative">Creative</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGenerateSummary}
                disabled={
                  isGenerating ||
                  !data.firstName ||
                  !data.lastName
                }
                className="h-8 text-xs"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                Generate with AI
              </Button>
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        {isGenerating && aiProgress.progress && (
          <ProgressIndicator
            progress={aiProgress.progress}
            onCancel={aiProgress.cancel}
            compact
          />
        )}

        <FormTextarea
          label=""
          value={data.summary || ""}
          onChange={(val) => onChange({ summary: val })}
          onBlur={() => markTouched("summary")}
          placeholder={EXAMPLE_RESUME_DATA.personalInfo.summary}
          rows={5}
          showCharacterCount
          helperText="2-3 sentences recommended"
          error={getFieldError(validationErrors, "summary")}
          disabled={isGenerating}
        />
      </div>
    </div>
  );
}
