"use client";

import { useMemo } from "react";
import { ResumeData } from "@/lib/types/resume";
import { SECTION_LABELS, TrackedSection } from "@/lib/types/version";
import { cn } from "@/lib/utils";
import { Plus, Minus, Edit2 } from "lucide-react";

interface VersionDiffViewProps {
  oldData: ResumeData;
  newData: ResumeData;
  className?: string;
}

interface DiffItem {
  section: TrackedSection;
  type: "added" | "removed" | "modified";
  details: string[];
}

/**
 * Simple diff view showing what changed between two resume versions
 */
export function VersionDiffView({
  oldData,
  newData,
  className,
}: VersionDiffViewProps) {
  const diffs = useMemo(() => {
    const changes: DiffItem[] = [];

    // Compare personalInfo
    const oldInfo = oldData.personalInfo;
    const newInfo = newData.personalInfo;
    const infoChanges: string[] = [];

    const personalFields = [
      { key: "firstName", label: "First Name" },
      { key: "lastName", label: "Last Name" },
      { key: "email", label: "Email" },
      { key: "phone", label: "Phone" },
      { key: "location", label: "Location" },
      { key: "website", label: "Website" },
      { key: "linkedin", label: "LinkedIn" },
      { key: "github", label: "GitHub" },
      { key: "summary", label: "Summary" },
      { key: "jobTitle", label: "Job Title" },
    ] as const;

    for (const field of personalFields) {
      const oldVal = oldInfo[field.key as keyof typeof oldInfo];
      const newVal = newInfo[field.key as keyof typeof newInfo];
      if (oldVal !== newVal) {
        if (!oldVal && newVal) {
          infoChanges.push(`Added ${field.label}`);
        } else if (oldVal && !newVal) {
          infoChanges.push(`Removed ${field.label}`);
        } else {
          infoChanges.push(`Updated ${field.label}`);
        }
      }
    }

    if (infoChanges.length > 0) {
      changes.push({
        section: "personalInfo",
        type: "modified",
        details: infoChanges,
      });
    }

    // Compare array sections
    const arraySections = [
      { key: "workExperience", label: "Experience", nameField: "position" },
      { key: "education", label: "Education", nameField: "institution" },
      { key: "skills", label: "Skills", nameField: "name" },
      { key: "projects", label: "Projects", nameField: "name" },
      { key: "languages", label: "Languages", nameField: "name" },
      { key: "certifications", label: "Certifications", nameField: "name" },
      { key: "hobbies", label: "Hobbies", nameField: "name" },
      { key: "extraCurricular", label: "Activities", nameField: "title" },
    ] as const;

    for (const { key, nameField } of arraySections) {
      const oldArr = (oldData[key as keyof ResumeData] as unknown as Array<{ id: string; [k: string]: unknown }>) || [];
      const newArr = (newData[key as keyof ResumeData] as unknown as Array<{ id: string; [k: string]: unknown }>) || [];

      const oldIds = new Set(oldArr.map((item) => item.id));
      const newIds = new Set(newArr.map((item) => item.id));

      const sectionDetails: string[] = [];

      // Added items
      for (const item of newArr) {
        if (!oldIds.has(item.id)) {
          const name = item[nameField] as string;
          sectionDetails.push(`Added: ${name || "New item"}`);
        }
      }

      // Removed items
      for (const item of oldArr) {
        if (!newIds.has(item.id)) {
          const name = item[nameField] as string;
          sectionDetails.push(`Removed: ${name || "Item"}`);
        }
      }

      // Modified items
      for (const newItem of newArr) {
        if (oldIds.has(newItem.id)) {
          const oldItem = oldArr.find((i) => i.id === newItem.id);
          if (oldItem && JSON.stringify(oldItem) !== JSON.stringify(newItem)) {
            const name = newItem[nameField] as string;
            sectionDetails.push(`Modified: ${name || "Item"}`);
          }
        }
      }

      if (sectionDetails.length > 0) {
        const hasAdded = sectionDetails.some((d) => d.startsWith("Added:"));
        const hasRemoved = sectionDetails.some((d) => d.startsWith("Removed:"));
        const hasModified = sectionDetails.some((d) => d.startsWith("Modified:"));

        let type: "added" | "removed" | "modified" = "modified";
        if (hasAdded && !hasRemoved && !hasModified) type = "added";
        if (hasRemoved && !hasAdded && !hasModified) type = "removed";

        changes.push({
          section: key as TrackedSection,
          type,
          details: sectionDetails,
        });
      }
    }

    return changes;
  }, [oldData, newData]);

  if (diffs.length === 0) {
    return (
      <div className={cn("text-center py-8 text-muted-foreground", className)}>
        No differences found between versions.
      </div>
    );
  }

  const getIcon = (type: "added" | "removed" | "modified") => {
    switch (type) {
      case "added":
        return <Plus className="w-4 h-4 text-green-600" />;
      case "removed":
        return <Minus className="w-4 h-4 text-red-600" />;
      default:
        return <Edit2 className="w-4 h-4 text-amber-600" />;
    }
  };

  const getTypeStyles = (type: "added" | "removed" | "modified") => {
    switch (type) {
      case "added":
        return "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800/30";
      case "removed":
        return "bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800/30";
      default:
        return "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800/30";
    }
  };

  const getDetailColor = (detail: string) => {
    if (detail.startsWith("Added:")) return "text-green-700 dark:text-green-400";
    if (detail.startsWith("Removed:")) return "text-red-700 dark:text-red-400";
    return "text-amber-700 dark:text-amber-400";
  };

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm text-muted-foreground mb-4">
        {diffs.length} section{diffs.length !== 1 ? "s" : ""} changed
      </p>

      {diffs.map((diff) => (
        <div
          key={diff.section}
          className={cn(
            "p-3 rounded-lg border",
            getTypeStyles(diff.type)
          )}
        >
          <div className="flex items-center gap-2 mb-2">
            {getIcon(diff.type)}
            <span className="font-medium text-sm">
              {SECTION_LABELS[diff.section]}
            </span>
          </div>

          <ul className="space-y-1 pl-6">
            {diff.details.slice(0, 5).map((detail, idx) => (
              <li
                key={idx}
                className={cn("text-xs", getDetailColor(detail))}
              >
                {detail}
              </li>
            ))}
            {diff.details.length > 5 && (
              <li className="text-xs text-muted-foreground">
                +{diff.details.length - 5} more changes
              </li>
            )}
          </ul>
        </div>
      ))}
    </div>
  );
}
