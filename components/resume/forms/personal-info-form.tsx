"use client";

import { useEffect, useState, useMemo } from "react";
import { FormField, FormTextarea } from "@/components/forms";
import { PersonalInfo } from "@/lib/types/resume";
import { PhotoUpload } from "./photo-upload";
import { useTouchedFields } from "@/hooks/use-touched-fields";
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Plus, ChevronDown, ChevronUp, X } from "lucide-react";
import { ValidationError } from "@/lib/validation/resume-validation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { AiAction } from "@/components/ai/ai-action";
import { AiPreviewSheet } from "@/components/ai/ai-preview-sheet";
import { useAiAction } from "@/hooks/use-ai-action";
import { useAiPreferences } from "@/hooks/use-ai-preferences";
import { AiActionContract } from "@/lib/ai/action-contract";
import { authPost } from "@/lib/api/auth-fetch";
import { cn } from "@/lib/utils";

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
  /** Whether to show the photo upload (based on template support) */
  showPhotoUpload?: boolean;
}

const SUMMARY_CONTRACT: AiActionContract = {
  inputs: ["resume", "section", "userPreferences"],
  output: "Professional summary text (2-3 sentences)",
  description: "Uses your name, title, skills, and recent experience.",
};

type LinkField = "website" | "linkedin" | "github";

const LINK_CONFIG: Record<LinkField, { label: string; icon: React.ReactNode; placeholder?: string }> = {
  website: { label: "Website", icon: <Globe className="w-4 h-4" /> },
  linkedin: { label: "LinkedIn", icon: <Linkedin className="w-4 h-4" /> },
  github: { label: "GitHub", icon: <Github className="w-4 h-4" />, placeholder: "github.com/username" },
};

export function PersonalInfoForm({
  data,
  onChange,
  validationErrors = [],
  showErrors = false,
  workExperiences = [],
  skills = [],
  showPhotoUpload = true,
}: PersonalInfoFormProps) {
  const { markTouched, markErrors, getFieldError } = useTouchedFields();
  const { preferences, setTone, setLength } = useAiPreferences();
  const [summarySheetOpen, setSummarySheetOpen] = useState(false);

  // Track which link fields are visible (either have data or user expanded them)
  const [visibleLinks, setVisibleLinks] = useState<Set<LinkField>>(() => {
    const initial = new Set<LinkField>();
    if (data.website) initial.add("website");
    if (data.linkedin) initial.add("linkedin");
    if (data.github) initial.add("github");
    return initial;
  });

  // Sync visible links when data changes externally
  useEffect(() => {
    setVisibleLinks(prev => {
      const updated = new Set(prev);
      if (data.website && !prev.has("website")) updated.add("website");
      if (data.linkedin && !prev.has("linkedin")) updated.add("linkedin");
      if (data.github && !prev.has("github")) updated.add("github");
      return updated;
    });
  }, [data.website, data.linkedin, data.github]);

  const hiddenLinks = useMemo(() => {
    return (["website", "linkedin", "github"] as LinkField[]).filter(
      link => !visibleLinks.has(link)
    );
  }, [visibleLinks]);

  const addLink = (link: LinkField) => {
    setVisibleLinks(prev => new Set(prev).add(link));
  };

  const removeLink = (link: LinkField) => {
    // Only allow removing if the field is empty
    if (!data[link]) {
      setVisibleLinks(prev => {
        const updated = new Set(prev);
        updated.delete(link);
        return updated;
      });
    }
  };

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

      const response = await authPost("/api/ai/generate-summary", {
        firstName: data.firstName,
        lastName: data.lastName,
        jobTitle: data.jobTitle,
        yearsOfExperience,
        keySkills: skills.slice(0, 5),
        recentPosition: recentExperience?.position,
        recentCompany: recentExperience?.company,
        tone: preferences.tone,
        length: preferences.length,
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
      {/* Profile Photo - only show if template supports it */}
      {showPhotoUpload && (
        <PhotoUpload
          photo={data.photo}
          onChange={(photo) => onChange({ photo })}
          firstName={data.firstName}
          lastName={data.lastName}
        />
      )}

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

      {/* Optional Links - Collapsible */}
      <div className="space-y-3">
        {/* Visible link fields */}
        {visibleLinks.size > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-muted-foreground">Links</span>
              <div className="h-px flex-1 bg-border" />
            </div>
            <div className="space-y-3">
              {(["website", "linkedin", "github"] as LinkField[])
                .filter(link => visibleLinks.has(link))
                .map(link => {
                  const config = LINK_CONFIG[link];
                  const hasValue = !!data[link];
                  return (
                    <div key={link} className="relative group">
                      <FormField
                        label={config.label}
                        value={data[link] || ""}
                        onChange={(val) => onChange({ [link]: val })}
                        onBlur={() => markTouched(link)}
                        placeholder={config.placeholder}
                        placeholderType={link === "github" ? undefined : link}
                        type={link === "website" ? "url" : undefined}
                        error={getFieldError(validationErrors, link)}
                        icon={config.icon}
                      />
                      {/* Remove button - only when empty */}
                      {!hasValue && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => removeLink(link)}
                          aria-label={`Remove ${config.label} field`}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      )}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* Add link buttons */}
        {hiddenLinks.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {hiddenLinks.map(link => {
              const config = LINK_CONFIG[link];
              return (
                <Button
                  key={link}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5"
                  onClick={() => addLink(link)}
                >
                  <Plus className="w-3 h-3" />
                  {config.label}
                </Button>
              );
            })}
          </div>
        )}
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
