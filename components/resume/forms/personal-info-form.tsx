"use client";

import { EXAMPLE_RESUME_DATA } from "@/lib/constants/example-data";
import { FormField, FormTextarea } from "@/components/forms";
import { PersonalInfo } from "@/lib/types/resume";
import { useTouchedFields } from "@/hooks/use-touched-fields";
import {
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
} from "lucide-react";

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onChange: (data: Partial<PersonalInfo>) => void;
  validationErrors?: Record<string, string>;
}

export function PersonalInfoForm({
  data,
  onChange,
  validationErrors = {},
}: PersonalInfoFormProps) {
  const { markTouched, getFieldError: getTouchedFieldError } =
    useTouchedFields();

  const getFieldError = (errors: Record<string, string>, field: string) => {
    // Convert Record to array format for the hook
    const validationErrorsArray = Object.entries(errors).map(([field, message]) => ({
      field,
      message,
    }));
    return getTouchedFieldError(validationErrorsArray, field) || errors[field];
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
          helperText={!data.firstName ? "Required field" : undefined}
        />
        <FormField
          label="Last Name"
          value={data.lastName}
          onChange={(val) => onChange({ lastName: val })}
          onBlur={() => markTouched("lastName")}
          placeholder={EXAMPLE_RESUME_DATA.personalInfo.lastName}
          required
          error={getFieldError(validationErrors, "lastName")}
          helperText={!data.lastName ? "Required field" : undefined}
        />
      </div>

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
      <FormTextarea
        label="Professional Summary"
        value={data.summary || ""}
        onChange={(val) => onChange({ summary: val })}
        onBlur={() => markTouched("summary")}
        placeholder={EXAMPLE_RESUME_DATA.personalInfo.summary}
        rows={5}
        showCharacterCount
        helperText="2-3 sentences recommended"
      />
    </div>
  );
}
