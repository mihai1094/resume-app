"use client";

import { PersonalInfo } from "@/lib/types/resume";
import { Badge } from "@/components/ui/badge";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Linkedin,
  Github,
} from "lucide-react";
import { validatePersonalInfo } from "@/lib/validation";
import { FormField, FormTextarea } from "@/components/forms";
import { useTouchedFields } from "@/hooks/use-touched-fields";

interface PersonalInfoFormProps {
  data: PersonalInfo;
  onChange: (data: Partial<PersonalInfo>) => void;
}

export function PersonalInfoForm({ data, onChange }: PersonalInfoFormProps) {
  const { markTouched, getFieldError } = useTouchedFields();
  const validationErrors = validatePersonalInfo(data);

  // Calculate completion percentage
  const requiredFields = [
    data.firstName,
    data.lastName,
    data.email,
    data.phone,
    data.location,
  ];
  const optionalFields = [
    data.website,
    data.linkedin,
    data.github,
    data.summary,
  ];
  const requiredCount = requiredFields.filter(
    (f) => f && f.trim().length > 0
  ).length;
  const optionalCount = optionalFields.filter(
    (f) => f && f.trim().length > 0
  ).length;
  const completionPercentage = Math.round(
    ((requiredCount * 2 + optionalCount) / 14) * 100
  );

  return (
    <div className="space-y-6">
      {/* Completion Badge */}
      <div className="flex justify-end">
        <Badge
          variant={completionPercentage === 100 ? "default" : "secondary"}
        >
          {completionPercentage}% Complete
        </Badge>
      </div>

      {/* Name Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField
          label="First Name"
          value={data.firstName}
          onChange={(val) => onChange({ firstName: val })}
          onBlur={() => markTouched("firstName")}
          placeholder="John"
          required
          error={getFieldError(validationErrors, "firstName")}
          helperText={!data.firstName ? "Required field" : undefined}
        />
        <FormField
          label="Last Name"
          value={data.lastName}
          onChange={(val) => onChange({ lastName: val })}
          onBlur={() => markTouched("lastName")}
          placeholder="Doe"
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
          placeholder="john.doe@example.com"
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
          placeholder="+1 (555) 123-4567"
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
        placeholder="New York, NY"
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
            placeholder="https://johndoe.com"
            type="url"
            error={getFieldError(validationErrors, "website")}
            icon={<Globe className="w-4 h-4" />}
          />
          <FormField
            label="LinkedIn"
            value={data.linkedin || ""}
            onChange={(val) => onChange({ linkedin: val })}
            onBlur={() => markTouched("linkedin")}
            placeholder="linkedin.com/in/johndoe"
            error={getFieldError(validationErrors, "linkedin")}
            icon={<Linkedin className="w-4 h-4" />}
          />
          <FormField
            label="GitHub"
            value={data.github || ""}
            onChange={(val) => onChange({ github: val })}
            onBlur={() => markTouched("github")}
            placeholder="github.com/johndoe"
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
        placeholder="Brief summary of your professional background and key achievements..."
        rows={5}
        showCharacterCount
        helperText="2-3 sentences recommended"
      />
    </div>
  );
}
