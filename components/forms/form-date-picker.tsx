"use client";

import { memo } from "react";
import { Label } from "@/components/ui/label";
import { MonthPicker } from "@/components/ui/month-picker";
import { cn } from "@/lib/utils";

interface FormDatePickerProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  id?: string;
  className?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

function FormDatePickerComponent({
  label,
  value,
  onChange,
  placeholder = "Pick a month",
  required = false,
  error,
  helperText,
  id,
  className,
  icon,
  disabled = false,
}: FormDatePickerProps) {
  const fieldId = id || `date-${label.toLowerCase().replace(/\s+/g, "-")}`;

  const errorId = error ? `${fieldId}-error` : undefined;
  const helperId = helperText && !error ? `${fieldId}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;

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
      <MonthPicker
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(error ? "border-destructive" : "")}
        aria-invalid={error ? "true" : "false"}
        aria-required={required}
        aria-describedby={describedBy}
      />
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
  );
}

export const FormDatePicker = memo(FormDatePickerComponent);

