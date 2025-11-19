"use client";

import { memo } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface FormTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  rows?: number;
  id?: string;
  className?: string;
  icon?: React.ReactNode;
  showCharacterCount?: boolean;
  maxLength?: number;
}

function FormTextareaComponent({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  required = false,
  error,
  helperText,
  rows = 3,
  id,
  className,
  icon,
  showCharacterCount = false,
  maxLength,
}: FormTextareaProps) {
  const fieldId = id || `textarea-${label.toLowerCase().replace(/\s+/g, "-")}`;

  const errorId = error ? `${fieldId}-error` : undefined;
  const helperId = helperText && !error ? `${fieldId}-helper` : undefined;
  const countId = showCharacterCount ? `${fieldId}-count` : undefined;
  const describedBy = [errorId, helperId, countId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={fieldId} className="flex items-center gap-2">
        {icon}
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="required">
            *
          </span>
        )}
      </Label>
      <Textarea
        id={fieldId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className={cn(
          "resize-none",
          error ? "border-destructive" : ""
        )}
        aria-invalid={error ? "true" : "false"}
        aria-required={required}
        aria-describedby={describedBy}
      />
      <div className="flex items-center justify-between">
        <div>
          {error && (
            <p id={errorId} className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          {helperText && !error && (
            <p id={helperId} className="text-sm text-muted-foreground">
              {helperText}
            </p>
          )}
        </div>
        {showCharacterCount && (
          <span id={countId} className="text-xs text-muted-foreground" aria-live="polite">
            {value.length}
            {maxLength && ` / ${maxLength}`}
          </span>
        )}
      </div>
    </div>
  );
}

export const FormTextarea = memo(FormTextareaComponent);

