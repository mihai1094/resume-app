"use client";

import { memo, useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useSmartPlaceholder, PlaceholderType } from "@/hooks/use-smart-placeholder";

interface FormFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  placeholderType?: PlaceholderType | string;
  required?: boolean;
  error?: string;
  helperText?: string;
  type?: string;
  id?: string;
  className?: string;
  icon?: React.ReactNode;
  showSuccessState?: boolean;
}

function FormFieldComponent({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  placeholderType,
  required = false,
  error,
  helperText,
  type = "text",
  id,
  className,
  icon,
  showSuccessState = true,
}: FormFieldProps) {
  const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const [shouldShake, setShouldShake] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const prevErrorRef = useRef<string | undefined>(undefined);
  const prevValueRef = useRef<string>(value);

  // Smart placeholder with rotation
  const hasValue = value.length > 0;
  const shouldRotate = !!placeholderType && isFocused && !hasValue;
  const { placeholder: smartPlaceholder, isAnimating } = useSmartPlaceholder({
    type: placeholderType || "default",
    enabled: shouldRotate,
  });

  // Use smart placeholder if type provided, otherwise use static placeholder
  const displayPlaceholder = placeholderType ? smartPlaceholder : placeholder;

  // Trigger shake animation when error appears
  useEffect(() => {
    if (error && !prevErrorRef.current) {
      setShouldShake(true);
      const timer = setTimeout(() => setShouldShake(false), 500);
      return () => clearTimeout(timer);
    }
    prevErrorRef.current = error;
  }, [error]);

  // Show success state briefly when field becomes valid after having content
  useEffect(() => {
    const hadValue = prevValueRef.current.length > 0;
    const hasValue = value.length > 0;
    const wasInvalid = prevErrorRef.current;
    const isNowValid = !error && hasValue;

    if (showSuccessState && isNowValid && (wasInvalid || (hasValue && !hadValue))) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), 1500);
      return () => clearTimeout(timer);
    }
    prevValueRef.current = value;
  }, [value, error, showSuccessState]);

  const errorId = error ? `${fieldId}-error` : undefined;
  const helperId = helperText && !error ? `${fieldId}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;

  const isValid = !error && value.length > 0;

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
        {/* Success checkmark */}
        {showSuccessState && isValid && (
          <Check
            className={cn(
              "w-4 h-4 text-green-500 ml-auto transition-all duration-300",
              showSuccess ? "animate-success-pulse" : ""
            )}
          />
        )}
      </Label>
      <div className="relative">
        <Input
          id={fieldId}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          placeholder={displayPlaceholder}
          className={cn(
            "transition-all duration-200",
            error
              ? "border-destructive ring-2 ring-destructive/40 focus-visible:ring-destructive focus-visible:ring-offset-2 shadow-[0_0_0_4px_rgba(248,113,113,0.14)]"
              : isValid
              ? "border-green-500/50 focus-visible:ring-green-500/30"
              : "",
            shouldShake && "animate-shake",
            isAnimating && "placeholder:opacity-0 placeholder:transition-opacity"
          )}
          aria-invalid={error ? "true" : "false"}
          aria-required={required}
          aria-describedby={describedBy}
        />
      </div>
      {error && (
        <p id={errorId} className="text-sm text-destructive animate-fade-in" role="alert">
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

export const FormField = memo(FormFieldComponent);

