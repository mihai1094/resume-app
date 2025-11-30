"use client";

import { FormField, FormTextarea } from "@/components/forms";
import {
  CoverLetterData,
  CoverLetterRecipient,
  SALUTATION_OPTIONS,
  SIGN_OFF_OPTIONS,
} from "@/lib/types/cover-letter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  User,
  Briefcase,
  Mail,
  Phone,
  MapPin,
  Linkedin,
  Globe,
  Plus,
  Trash2,
  GripVertical,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { PersonalInfo } from "@/lib/types/resume";
import { useSimpleFieldValidation } from "@/hooks/use-simple-field-validation";

interface CoverLetterFormProps {
  data: CoverLetterData;
  onUpdateJobInfo: (updates: {
    jobTitle?: string;
    jobReference?: string;
    date?: string;
  }) => void;
  onUpdateRecipient: (updates: Partial<CoverLetterRecipient>) => void;
  onUpdateSenderInfo: (updates: {
    senderName?: string;
    senderEmail?: string;
    senderPhone?: string;
    senderLocation?: string;
    senderLinkedin?: string;
    senderWebsite?: string;
  }) => void;
  onSyncFromPersonalInfo?: () => void;
  onUpdateSalutation: (salutation: string) => void;
  onUpdateOpeningParagraph: (content: string) => void;
  onUpdateBodyParagraph: (index: number, content: string) => void;
  onAddBodyParagraph: () => void;
  onRemoveBodyParagraph: (index: number) => void;
  onUpdateClosingParagraph: (content: string) => void;
  onUpdateSignOff: (signOff: string) => void;
  personalInfo?: PersonalInfo;
  activeSection?: string;
  validationErrors?: Array<{ field: string; message: string }>;
}

export function CoverLetterForm({
  data,
  onUpdateJobInfo,
  onUpdateRecipient,
  onUpdateSenderInfo,
  onSyncFromPersonalInfo,
  onUpdateSalutation,
  onUpdateOpeningParagraph,
  onUpdateBodyParagraph,
  onAddBodyParagraph,
  onRemoveBodyParagraph,
  onUpdateClosingParagraph,
  onUpdateSignOff,
  personalInfo,
  activeSection = "job",
  validationErrors = [],
}: CoverLetterFormProps) {
  // Use centralized validation hook
  const { getFieldError, markTouched } =
    useSimpleFieldValidation(validationErrors);

  return (
    <div className="space-y-8">
      {/* Job Information Section */}
      {activeSection === "job" && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Job Details</h3>
              <p className="text-sm text-muted-foreground">
                Position you're applying for
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Job Title"
              value={data.jobTitle}
              onChange={(val) => onUpdateJobInfo({ jobTitle: val })}
              onBlur={() => markTouched("jobTitle")}
              placeholder="e.g., Senior Software Engineer"
              error={getFieldError("jobTitle")}
              icon={<Briefcase className="w-4 h-4" />}
            />
            <FormField
              label="Job Reference (optional)"
              value={data.jobReference || ""}
              onChange={(val) => onUpdateJobInfo({ jobReference: val })}
              placeholder="e.g., JOB-2024-001"
              helperText="Reference number from job posting"
            />
          </div>

          <FormField
            label="Application Date"
            value={data.date}
            onChange={(val) => onUpdateJobInfo({ date: val })}
            type="date"
            icon={<Calendar className="w-4 h-4" />}
          />
        </div>
      )}

      {/* Recipient Information Section */}
      {activeSection === "recipient" && (
        <div className="space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Recipient Information</h3>
              <p className="text-sm text-muted-foreground">
                Who will receive this letter
              </p>
            </div>
          </div>

          <FormField
            label="Company Name"
            value={data.recipient.company}
            onChange={(val) => onUpdateRecipient({ company: val })}
            onBlur={() => markTouched("company")}
            placeholder="e.g., Acme Corporation"
            error={getFieldError("company")}
            icon={<Building2 className="w-4 h-4" />}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Hiring Manager Name (optional)"
              value={data.recipient.name || ""}
              onChange={(val) => onUpdateRecipient({ name: val })}
              placeholder="e.g., Sarah Johnson"
              helperText="If known, personalizes the letter"
              icon={<User className="w-4 h-4" />}
            />
            <FormField
              label="Hiring Manager Title (optional)"
              value={data.recipient.title || ""}
              onChange={(val) => onUpdateRecipient({ title: val })}
              placeholder="e.g., Director of Engineering"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Department (optional)"
              value={data.recipient.department || ""}
              onChange={(val) => onUpdateRecipient({ department: val })}
              placeholder="e.g., Engineering"
            />
            <FormField
              label="Company Address (optional)"
              value={data.recipient.address || ""}
              onChange={(val) => onUpdateRecipient({ address: val })}
              placeholder="e.g., 123 Tech Street, SF, CA"
              icon={<MapPin className="w-4 h-4" />}
            />
          </div>
        </div>
      )}

      {/* Sender Information Section */}
      {activeSection === "sender" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <User className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Your Information</h3>
                <p className="text-sm text-muted-foreground">
                  Contact details in your letter
                </p>
              </div>
            </div>
            {onSyncFromPersonalInfo && personalInfo && (
              <Button
                variant="outline"
                size="sm"
                onClick={onSyncFromPersonalInfo}
                className="gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Sync from Resume
              </Button>
            )}
          </div>

          <FormField
            label="Your Full Name"
            value={data.senderName}
            onChange={(val) => onUpdateSenderInfo({ senderName: val })}
            onBlur={() => markTouched("senderName")}
            placeholder="e.g., John Doe"
            required
            error={getFieldError("senderName")}
            icon={<User className="w-4 h-4" />}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Email"
              value={data.senderEmail}
              onChange={(val) => onUpdateSenderInfo({ senderEmail: val })}
              onBlur={() => markTouched("senderEmail")}
              placeholder="e.g., john@example.com"
              type="email"
              required
              error={getFieldError("senderEmail")}
              icon={<Mail className="w-4 h-4" />}
            />
            <FormField
              label="Phone"
              value={data.senderPhone}
              onChange={(val) => onUpdateSenderInfo({ senderPhone: val })}
              placeholder="e.g., +1 (555) 123-4567"
              type="tel"
              icon={<Phone className="w-4 h-4" />}
            />
          </div>

          <FormField
            label="Location"
            value={data.senderLocation}
            onChange={(val) => onUpdateSenderInfo({ senderLocation: val })}
            placeholder="e.g., San Francisco, CA"
            icon={<MapPin className="w-4 h-4" />}
          />

          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="h-px flex-1 bg-border" />
              <span className="text-sm text-muted-foreground">
                Optional Links
              </span>
              <div className="h-px flex-1 bg-border" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label="LinkedIn (optional)"
                value={data.senderLinkedin || ""}
                onChange={(val) => onUpdateSenderInfo({ senderLinkedin: val })}
                placeholder="e.g., linkedin.com/in/johndoe"
                icon={<Linkedin className="w-4 h-4" />}
              />
              <FormField
                label="Website (optional)"
                value={data.senderWebsite || ""}
                onChange={(val) => onUpdateSenderInfo({ senderWebsite: val })}
                placeholder="e.g., johndoe.com"
                icon={<Globe className="w-4 h-4" />}
              />
            </div>
          </div>
        </div>
      )}

      {/* Letter Content Section */}
      {activeSection === "content" && (
        <div className="space-y-8">
          {/* Salutation */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                1
              </div>
              <Label className="font-semibold">Salutation</Label>
            </div>
            <Select value={data.salutation} onValueChange={onUpdateSalutation}>
              <SelectTrigger>
                <SelectValue placeholder="Select salutation" />
              </SelectTrigger>
              <SelectContent>
                {SALUTATION_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {data.recipient.name && (
              <p className="text-sm text-muted-foreground">
                💡 Tip: You can personalize this to "Dear {data.recipient.name}
                ,"
              </p>
            )}
          </div>

          <Separator />

          {/* Opening Paragraph */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                2
              </div>
              <div>
                <Label className="font-semibold">Opening Paragraph</Label>
                <p className="text-sm text-muted-foreground">
                  Hook the reader and state why you're applying
                </p>
              </div>
            </div>
            <FormTextarea
              label="Opening Paragraph"
              value={data.openingParagraph}
              onChange={onUpdateOpeningParagraph}
              onBlur={() => markTouched("openingParagraph")}
              placeholder={`I am writing to express my interest in the ${
                data.jobTitle || "[Position]"
              } role at ${
                data.recipient.company || "[Company]"
              }. With my background in [relevant field/skill], I am excited about the opportunity to contribute to your team.`}
              rows={4}
              showCharacterCount
              helperText="2-3 sentences: State the position, how you found it, and your main qualification"
              error={getFieldError("openingParagraph")}
            />
          </div>

          <Separator />

          {/* Body Paragraphs */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                  3
                </div>
                <div>
                  <Label className="font-semibold">Body Paragraphs</Label>
                  <p className="text-sm text-muted-foreground">
                    Highlight your qualifications and experiences
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onAddBodyParagraph}
                disabled={data.bodyParagraphs.length >= 4}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Paragraph
              </Button>
            </div>

            <div className="space-y-4">
              {data.bodyParagraphs.map((paragraph, index) => (
                <Card key={index} className="p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                      <span className="text-sm font-medium text-muted-foreground">
                        Paragraph {index + 1}
                      </span>
                    </div>
                    {data.bodyParagraphs.length > 1 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveBodyParagraph(index)}
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <FormTextarea
                    label={`Body Paragraph ${index + 1}`}
                    value={paragraph}
                    onChange={(val) => onUpdateBodyParagraph(index, val)}
                    onBlur={() => markTouched("bodyParagraphs")}
                    placeholder={
                      index === 0
                        ? "In my previous role at [Company], I [achievement/responsibility]. This experience has equipped me with [relevant skills] that align with the requirements of this position."
                        : "Additionally, I have experience in [relevant area]. I successfully [specific achievement with metrics if possible]."
                    }
                    rows={4}
                    showCharacterCount
                    error={
                      index === 0 ? getFieldError("bodyParagraphs") : undefined
                    }
                  />
                </Card>
              ))}
            </div>

            <div className="bg-muted/50 rounded-lg p-4 text-sm text-muted-foreground space-y-2">
              <p className="font-medium text-foreground">
                💡 Tips for body paragraphs:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  Use specific examples and quantify achievements when possible
                </li>
                <li>Align your experience with the job requirements</li>
                <li>Show how you can add value to their team</li>
                <li>Keep each paragraph focused on one main point</li>
              </ul>
            </div>
          </div>

          <Separator />

          {/* Closing Paragraph */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                4
              </div>
              <div>
                <Label className="font-semibold">Closing Paragraph</Label>
                <p className="text-sm text-muted-foreground">
                  Call to action and express enthusiasm
                </p>
              </div>
            </div>
            <FormTextarea
              label="Closing Paragraph"
              value={data.closingParagraph}
              onChange={onUpdateClosingParagraph}
              onBlur={() => markTouched("closingParagraph")}
              placeholder={`I am excited about the opportunity to bring my skills and passion to ${
                data.recipient.company || "[Company]"
              }. I would welcome the chance to discuss how my background, skills, and enthusiasm can contribute to your team's success. Thank you for considering my application.`}
              rows={4}
              showCharacterCount
              helperText="2-3 sentences: Express enthusiasm and include a call to action"
              error={getFieldError("closingParagraph")}
            />
          </div>

          <Separator />

          {/* Sign Off */}
          <div className="space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                5
              </div>
              <Label className="font-semibold">Sign Off</Label>
            </div>
            <Select value={data.signOff} onValueChange={onUpdateSignOff}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select sign off" />
              </SelectTrigger>
              <SelectContent>
                {SIGN_OFF_OPTIONS.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}
