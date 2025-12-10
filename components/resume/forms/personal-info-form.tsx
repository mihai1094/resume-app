"use client";

import { useEffect, useState } from "react";
import { FormField, FormTextarea } from "@/components/forms";
import { PersonalInfo } from "@/lib/types/resume";
import { useTouchedFields } from "@/hooks/use-touched-fields";
import { Mail, Phone, MapPin, Globe, Linkedin, Github } from "lucide-react";
import { ValidationError } from "@/lib/validation/resume-validation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AiAction } from "@/components/ai/ai-action";
import { AiPreviewSheet } from "@/components/ai/ai-preview-sheet";
import { useAiAction } from "@/hooks/use-ai-action";
import { useAiPreferences } from "@/hooks/use-ai-preferences";
import { AiActionContract } from "@/lib/ai/action-contract";

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

const SUMMARY_CONTRACT: AiActionContract = {
  inputs: ["resume", "section", "userPreferences"],
  output: "Professional summary text (2-3 sentences)",
  description: "Uses your name, title, skills, and recent experience.",
};

export function PersonalInfoForm({
  data,
  onChange,
  validationErrors = [],
  showErrors = false,
  workExperiences = [],
  skills = [],
}: PersonalInfoFormProps) {
  const { markTouched, markErrors, getFieldError } = useTouchedFields();
  const { preferences, setTone, setLength } = useAiPreferences();
  const [summarySheetOpen, setSummarySheetOpen] = useState(false);

  const summaryAction = useAiAction<string>({
    surface: "personal-info",
    actionName: "generate-summary",
    perform: async () => {
      if (!data.firstName || !data.lastName) {
        throw new Error("Please fill in your first and last name first");
      }

      const recentExperience = workExperiences[0];
      const yearsOfExperience =
        workExperiences.length > 0 ? workExperiences.length * 2 : undefined;

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
          tone: preferences.tone,
          length: preferences.length,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate summary");
      }

      const responseData = await response.json();
      return responseData.summary as string;
    },
    onApply: (value) => onChange({ summary: value }),
  });

  useEffect(() => {
    if (showErrors && validationErrors.length > 0) {
      markErrors(validationErrors);
    }
  }, [showErrors, validationErrors, markErrors]);

  const handleGenerateSummary = async () => {
    if (!data.firstName || !data.lastName) {
      toast.error("Please fill in your first and last name first");
      return;
    }
    setSummarySheetOpen(true);
    await summaryAction.run();
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
          placeholderType="firstName"
          required
          error={getFieldError(validationErrors, "firstName")}
        />
        <FormField
          label="Last Name"
          value={data.lastName}
          onChange={(val) => onChange({ lastName: val })}
          onBlur={() => markTouched("lastName")}
          placeholderType="lastName"
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
        placeholderType="jobTitle"
        error={getFieldError(validationErrors, "jobTitle")}
      />

      {/* Contact Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="Email"
          value={data.email}
          onChange={(val) => onChange({ email: val })}
          onBlur={() => markTouched("email")}
          placeholderType="email"
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
          placeholderType="phone"
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
        placeholderType="location"
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
            placeholderType="website"
            type="url"
            error={getFieldError(validationErrors, "website")}
            icon={<Globe className="w-4 h-4" />}
          />
          <FormField
            label="LinkedIn"
            value={data.linkedin || ""}
            onChange={(val) => onChange({ linkedin: val })}
            onBlur={() => markTouched("linkedin")}
            placeholderType="linkedin"
            error={getFieldError(validationErrors, "linkedin")}
            icon={<Linkedin className="w-4 h-4" />}
          />
          <FormField
            label="GitHub"
            value={data.github || ""}
            onChange={(val) => onChange({ github: val })}
            onBlur={() => markTouched("github")}
            placeholder="github.com/username"
            error={getFieldError(validationErrors, "github")}
            icon={<Github className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Professional Summary */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Professional Summary</label>
          <div className="flex flex-wrap gap-2 items-center justify-end">
            <AiAction
              label="Generate summary"
              onClick={handleGenerateSummary}
              status={summaryAction.status}
              contract={SUMMARY_CONTRACT}
              description="Draft a concise professional summary using your profile."
              disabled={!data.firstName || !data.lastName}
            />
          </div>
        </div>

        <FormTextarea
          label=""
          value={data.summary || ""}
          onChange={(val) => onChange({ summary: val })}
          onBlur={() => markTouched("summary")}
          placeholderType="summary"
          rows={5}
          showCharacterCount
          helperText="2-3 sentences recommended"
          error={getFieldError(validationErrors, "summary")}
        />
      </div>

      <AiPreviewSheet
        open={summarySheetOpen}
        onOpenChange={setSummarySheetOpen}
        title="AI Summary"
        description="Review the generated summary before applying."
        contract={SUMMARY_CONTRACT}
        status={summaryAction.status}
        suggestion={summaryAction.suggestion || ""}
        previousText={data.summary || ""}
        onApply={() => summaryAction.apply(data.summary)}
        onUndo={summaryAction.undo}
        canUndo={summaryAction.canUndo}
        toneControl={{
          value: preferences.tone,
          onChange: setTone,
        }}
        lengthControl={{
          value: preferences.length,
          onChange: setLength,
        }}
      />
    </div>
  );
}
