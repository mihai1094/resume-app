"use client";

import { memo } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface FormCheckboxProps {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  error?: string;
  helperText?: string;
  id?: string;
  className?: string;
  required?: boolean;
}

function FormCheckboxComponent({
  label,
  checked,
  onCheckedChange,
  error,
  helperText,
  id,
  className,
  required = false,
}: FormCheckboxProps) {
  const fieldId = id || `checkbox-${label.toLowerCase().replace(/\s+/g, "-")}`;

  const errorId = error ? `${fieldId}-error` : undefined;
  const helperId = helperText && !error ? `${fieldId}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center space-x-2">
        <Checkbox
          id={fieldId}
          checked={checked}
          onCheckedChange={(checked) => onCheckedChange(checked as boolean)}
          aria-invalid={error ? "true" : "false"}
          aria-required={required}
          aria-describedby={describedBy}
        />
        <Label
          htmlFor={fieldId}
          className="font-normal cursor-pointer flex items-center gap-1"
        >
          {label}
          {required && (
            <span className="text-destructive" aria-label="required">
              *
            </span>
          )}
        </Label>
      </div>
      {error && (
        <p id={errorId} className="text-sm text-destructive ml-6" role="alert">
          {error}
        </p>
      )}
      {helperText && !error && (
        <p id={helperId} className="text-sm text-muted-foreground ml-6">
          {helperText}
        </p>
      )}
    </div>
  );
}

export const FormCheckbox = memo(FormCheckboxComponent);

