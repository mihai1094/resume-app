"use client";

import { memo, useState, useEffect, useRef } from "react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { cleanPastedText } from "@/lib/utils/paste-cleanup";
import { Check } from "lucide-react";
import { useSmartPlaceholder, PlaceholderType } from "@/hooks/use-smart-placeholder";
import { RichTextEditor } from "./rich-text-editor";

interface FormTextareaProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  placeholderType?: PlaceholderType | string;
  required?: boolean;
  error?: string;
  helperText?: string;
  rows?: number;
  id?: string;
  className?: string;
  icon?: React.ReactNode;
  showCharacterCount?: boolean;
  maxLength?: number;
  disabled?: boolean;
  showSuccessState?: boolean;
  /** Enables rich text editing with visual bold/italic + Ctrl+B / Ctrl+I shortcuts */
  enableFormatting?: boolean;
}

function FormTextareaComponent({
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  placeholderType,
  required = false,
  error,
  helperText,
  rows = 3,
  id,
  className,
  icon,
  showCharacterCount = false,
  maxLength,
  disabled = false,
  showSuccessState = true,
  enableFormatting = false,
}: FormTextareaProps) {
  const fieldId = id || `textarea-${label.toLowerCase().replace(/\s+/g, "-")}`;
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
    rotationInterval: 4000,
  });

  const displayPlaceholder = placeholderType ? smartPlaceholder : placeholder;

  useEffect(() => {
    if (error && !prevErrorRef.current) {
      setShouldShake(true);
      const timer = setTimeout(() => setShouldShake(false), 500);
      return () => clearTimeout(timer);
    }
    prevErrorRef.current = error;
  }, [error]);

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
  const countId = showCharacterCount ? `${fieldId}-count` : undefined;
  const describedBy = [errorId, helperId, countId].filter(Boolean).join(" ") || undefined;

  const isValid = !error && value.length > 0;

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <Label htmlFor={fieldId} className="flex items-center gap-2">
          {icon}
          <span>
            {label}
            {required && (
              <span className="text-destructive ml-1" aria-label="required">
                *
              </span>
            )}
          </span>
          {showSuccessState && isValid && (
            <Check
              className={cn(
                "w-4 h-4 text-green-500 ml-auto transition-all duration-300",
                showSuccess ? "animate-success-pulse" : ""
              )}
            />
          )}
        </Label>
      )}
      {enableFormatting ? (
        <RichTextEditor
          id={fieldId}
          value={value}
          onChange={(val) => {
            if (maxLength && val.length > maxLength) return;
            onChange(val);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          placeholder={displayPlaceholder}
          aria-invalid={error ? "true" : "false"}
          aria-required={required}
          aria-describedby={describedBy}
          className={cn(
            error
              ? "border-destructive ring-2 ring-destructive/40"
              : isValid
                ? "border-green-500/50"
                : "",
            shouldShake && "animate-shake",
          )}
          minHeight={`${Math.max(rows * 24, 80)}px`}
        />
      ) : (
        <Textarea
          id={fieldId}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={(e) => {
            const pasted = e.clipboardData.getData("text/plain");
            if (pasted) {
              e.preventDefault();
              const cleaned = cleanPastedText(pasted);
              const ta = e.currentTarget;
              const start = ta.selectionStart ?? 0;
              const end = ta.selectionEnd ?? 0;
              const newValue = value.slice(0, start) + cleaned + value.slice(end);
              onChange(maxLength ? newValue.slice(0, maxLength) : newValue);
            }
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            onBlur?.();
          }}
          placeholder={displayPlaceholder}
          rows={rows}
          maxLength={maxLength}
          disabled={disabled}
          className={cn(
            "resize-none transition-all duration-200",
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
      )}
      <div className="flex items-center justify-between">
        <div>
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
