"use client";

import { useEffect, useMemo, useState } from "react";
import { ResumeData } from "@/lib/types/resume";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CoverLetterOutput } from "@/lib/ai/content-generator";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Clipboard, Sparkles } from "lucide-react";
import { AiAction } from "@/components/ai/ai-action";
import { AiPreviewSheet } from "@/components/ai/ai-preview-sheet";
import { useAiAction } from "@/hooks/use-ai-action";
import {
  useAiPreferences,
  AI_TONE_OPTIONS,
  AI_LENGTH_OPTIONS,
} from "@/hooks/use-ai-preferences";
import { AiActionContract } from "@/lib/ai/action-contract";
import { authPost } from "@/lib/api/auth-fetch";

interface CoverLetterQuickDialogProps {
  resumeData: ResumeData;
  trigger?: React.ReactNode;
  /** Pre-populate with JD from context */
  initialJobDescription?: string;
  /** Pre-populate company name from context */
  initialCompany?: string;
  /** Pre-populate position title from context */
  initialPosition?: string;
  /** Control open state externally */
  open?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
}

type Step = 1 | 2 | 3;
const LAST_JD_KEY = "cover-letter-last-jd";

const COVER_LETTER_CONTRACT: AiActionContract = {
  inputs: ["resume", "jobDescription", "userPreferences"],
  output: "Personalized cover letter (salutation, intro, body, closing)",
  description:
    "Uses your resume, job description, and tone/length preferences.",
};

function renderCoverLetter(letter: CoverLetterOutput | null): string {
  if (!letter) return "";
  return [
    letter.salutation,
    "",
    letter.introduction,
    "",
    ...(letter.bodyParagraphs || []),
    "",
    letter.closing,
    "",
    letter.signature,
  ]
    .filter(Boolean)
    .join("\n");
}

export function CoverLetterQuickDialog({
  resumeData,
  trigger,
  initialJobDescription,
  initialCompany,
  initialPosition,
  open: controlledOpen,
  onOpenChange,
}: CoverLetterQuickDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const [companyName, setCompanyName] = useState(initialCompany || "");
  const [positionTitle, setPositionTitle] = useState(initialPosition || "");
  const [jobDescription, setJobDescription] = useState(initialJobDescription || "");
  const [hiringManagerName, setHiringManagerName] = useState("");
  const [output, setOutput] = useState<CoverLetterOutput | null>(null);
  const [step, setStep] = useState<Step>(1);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [lastSavedJD, setLastSavedJD] = useState("");

  const { preferences, setTone, setLength } = useAiPreferences();

  // Sync with initial values when dialog opens
  useEffect(() => {
    if (!open) return;
    if (initialJobDescription && !jobDescription) {
      setJobDescription(initialJobDescription);
    }
    if (initialCompany && !companyName) {
      setCompanyName(initialCompany);
    }
    if (initialPosition && !positionTitle) {
      setPositionTitle(initialPosition);
    }
  }, [open, initialJobDescription, initialCompany, initialPosition, jobDescription, companyName, positionTitle]);

  useEffect(() => {
    if (!open) return;
    if (typeof window === "undefined") return;
    const saved = window.localStorage.getItem(LAST_JD_KEY) || "";
    if (saved) {
      setLastSavedJD(saved);
    }
  }, [open]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (jobDescription.trim().length > 0) {
      window.localStorage.setItem(LAST_JD_KEY, jobDescription);
      setLastSavedJD(jobDescription);
    }
  }, [jobDescription]);

  const outline = useMemo(() => {
    const topSkills =
      resumeData.skills
        ?.map((s) => s.name)
        .slice(0, 5)
        .join(", ") || "N/A";
    const recentRole =
      resumeData.workExperience?.[0]?.position ||
      resumeData.personalInfo?.jobTitle ||
      "Recent role not provided";
    return [
      `Target: ${positionTitle || "Role"} @ ${companyName || "Company"}`,
      `Recent role: ${recentRole}`,
      `Top skills: ${topSkills}`,
      `JD length: ${jobDescription.trim().length} chars`,
      preferences.tone ? `Tone: ${preferences.tone}` : "",
      preferences.length ? `Length: ${preferences.length}` : "",
    ].filter(Boolean);
  }, [
    companyName,
    jobDescription,
    positionTitle,
    preferences.length,
    preferences.tone,
    resumeData.personalInfo?.jobTitle,
    resumeData.skills,
    resumeData.workExperience,
  ]);

  const coverLetterAction = useAiAction<CoverLetterOutput>({
    surface: "cover-letter",
    actionName: "generate-cover-letter",
    perform: async () => {
      if (!companyName.trim() || !positionTitle.trim()) {
        throw new Error("Completează compania și poziția.");
      }
      if (jobDescription.trim().length < 50) {
        throw new Error("Adaugă un job description de minim 50 caractere.");
      }

      const response = await authPost("/api/ai/generate-cover-letter", {
        resumeData,
        jobDescription,
        companyName,
        positionTitle,
        hiringManagerName: hiringManagerName.trim() || undefined,
        tone: preferences.tone,
        length: preferences.length,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to generate cover letter");
      }

      const data = await response.json();
      return data.coverLetter as CoverLetterOutput;
    },
    onApply: (value) => setOutput(value),
  });

  const handleGenerate = async () => {
    setPreviewOpen(true);
    await coverLetterAction.run();
  };

  const copyAll = async () => {
    if (!output) return;
    const text = renderCoverLetter(output);
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Cover letter copiat");
    } catch (err) {
      console.error("Clipboard error", err);
      toast.error("Nu am putut copia. Încearcă din nou.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Sparkles className="w-4 h-4" />
            AI Cover Letter
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Generate Cover Letter (from this CV)
          </DialogTitle>
          <DialogDescription>
            Folosește CV-ul curent + JD pentru a genera o scrisoare
            personalizată.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <Badge variant="outline">Step {step}/3</Badge>
            {step === 1 && "Context"}
            {step === 2 && "Outline"}
            {step === 3 && "Generate & review"}
          </div>

          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Company</Label>
                  <Input
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="Ex: Acme Corp"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Position</Label>
                  <Input
                    value={positionTitle}
                    onChange={(e) => setPositionTitle(e.target.value)}
                    placeholder="Ex: Product Manager"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Hiring Manager (opțional)</Label>
                <Input
                  value={hiringManagerName}
                  onChange={(e) => setHiringManagerName(e.target.value)}
                  placeholder="Ex: Ana Ionescu"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Job Description</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    disabled={!lastSavedJD}
                    onClick={() => setJobDescription(lastSavedJD)}
                  >
                    Use last JD
                  </Button>
                </div>
                <Textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste JD (minim 50 caractere)…"
                  className="min-h-[140px]"
                />
                <div className="text-xs text-muted-foreground">
                  {jobDescription.trim().length} caractere
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  disabled={
                    jobDescription.trim().length < 50 ||
                    !companyName.trim() ||
                    !positionTitle.trim()
                  }
                  onClick={() => setStep(2)}
                  className="gap-2"
                >
                  Continue to outline
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/40 p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Outline</Badge>
                  <span className="text-sm text-muted-foreground">
                    Quick context we’ll send to AI
                  </span>
                </div>
                <ul className="text-sm text-foreground space-y-2 list-disc pl-5">
                  {outline.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Tone</Label>
                  <select
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={preferences.tone}
                    onChange={(e) =>
                      setTone(e.target.value as typeof preferences.tone)
                    }
                  >
                    {AI_TONE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Length</Label>
                  <select
                    className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                    value={preferences.length}
                    onChange={(e) =>
                      setLength(e.target.value as typeof preferences.length)
                    }
                  >
                    {AI_LENGTH_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  onClick={() => setStep(1)}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button
                  className="gap-2"
                  onClick={() => setStep(3)}
                  disabled={
                    jobDescription.trim().length < 50 ||
                    !companyName.trim() ||
                    !positionTitle.trim()
                  }
                >
                  Continue to generate
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Generate</Badge>
                  <span className="text-sm text-muted-foreground">
                    Stage, review, and apply
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="gap-1"
                  onClick={() => setStep(2)}
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              </div>

              <AiAction
                label="Generate cover letter"
                status={coverLetterAction.status}
                onClick={handleGenerate}
                contract={COVER_LETTER_CONTRACT}
                description="Uses your resume + JD; staged before applying."
                disabled={
                  coverLetterAction.isRunning ||
                  jobDescription.trim().length < 50 ||
                  !companyName.trim() ||
                  !positionTitle.trim()
                }
              />

              {output && (
                <div className="space-y-3">
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Applied</Badge>
                      <span className="text-sm text-muted-foreground">
                        Copiază și editează în /cover-letter
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={copyAll}
                      className="gap-2"
                    >
                      <Clipboard className="w-4 h-4" />
                      Copiază tot
                    </Button>
                  </div>
                  <div className="space-y-2 text-sm leading-6 bg-muted/40 p-4 rounded-lg border">
                    <p className="font-medium">{output.salutation}</p>
                    <p>{output.introduction}</p>
                    {output.bodyParagraphs.map((p, i) => (
                      <p key={i}>{p}</p>
                    ))}
                    <p>{output.closing}</p>
                    <p className="font-medium whitespace-pre-line">
                      {output.signature}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="mt-4">
          <p className="text-xs text-muted-foreground">
            După generare, poți deschide editorul de cover letter pentru
            fine-tuning.
          </p>
        </DialogFooter>

        <AiPreviewSheet
          open={previewOpen}
          onOpenChange={setPreviewOpen}
          title="Cover letter preview"
          description="Review before applying to your resume."
          contract={COVER_LETTER_CONTRACT}
          status={coverLetterAction.status}
          suggestion={renderCoverLetter(coverLetterAction.suggestion ?? null)}
          previousText={renderCoverLetter(output)}
          onApply={() => coverLetterAction.apply(output || undefined)}
          onUndo={coverLetterAction.undo}
          canUndo={coverLetterAction.canUndo}
          toneControl={{
            value: preferences.tone,
            onChange: setTone,
          }}
          lengthControl={{
            value: preferences.length,
            onChange: setLength,
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
