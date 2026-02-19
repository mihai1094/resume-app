"use client";

import { memo, useState, useEffect, useRef, useCallback } from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, Loader2, MapPin } from "lucide-react";
import { useLocationAutocomplete } from "@/hooks/use-location-autocomplete";

interface LocationFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  required?: boolean;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  showSuccessState?: boolean;
  placeholder?: string;
  id?: string;
  className?: string;
}

function LocationFieldComponent({
  label,
  value,
  onChange,
  onBlur,
  required = false,
  error,
  helperText,
  icon,
  showSuccessState = true,
  placeholder,
  id,
  className,
}: LocationFieldProps) {
  const fieldId = id || `field-${label.toLowerCase().replace(/\s+/g, "-")}`;
  const [shouldShake, setShouldShake] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const prevErrorRef = useRef<string | undefined>(undefined);
  const prevValueRef = useRef<string>(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const { predictions, isLoading, fetchPredictions, clearPredictions } =
    useLocationAutocomplete();

  const isValid = !error && value.length > 0;

  // Open dropdown when there are predictions
  useEffect(() => {
    if (predictions.length > 0) {
      setOpen(true);
      setActiveIndex(-1);
    } else {
      setOpen(false);
    }
  }, [predictions]);

  // Shake animation on error appearance
  useEffect(() => {
    if (error && !prevErrorRef.current) {
      setShouldShake(true);
      const timer = setTimeout(() => setShouldShake(false), 500);
      return () => clearTimeout(timer);
    }
    prevErrorRef.current = error;
  }, [error]);

  // Success state
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

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      onChange(val);
      fetchPredictions(val);
    },
    [onChange, fetchPredictions]
  );

  const selectPrediction = useCallback(
    (description: string) => {
      onChange(description);
      clearPredictions();
      setOpen(false);
      setActiveIndex(-1);
      inputRef.current?.focus();
    },
    [onChange, clearPredictions]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!open || predictions.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i < predictions.length - 1 ? i + 1 : 0));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i > 0 ? i - 1 : predictions.length - 1));
      } else if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        selectPrediction(predictions[activeIndex].description);
      } else if (e.key === "Escape") {
        e.preventDefault();
        clearPredictions();
        setOpen(false);
        setActiveIndex(-1);
      }
    },
    [open, predictions, activeIndex, selectPrediction, clearPredictions]
  );

  const handleBlur = useCallback(() => {
    // Delay to allow click on prediction to fire first
    setTimeout(() => {
      setOpen(false);
      clearPredictions();
      onBlur?.();
    }, 150);
  }, [onBlur, clearPredictions]);

  const errorId = error ? `${fieldId}-error` : undefined;
  const helperId = helperText && !error ? `${fieldId}-helper` : undefined;
  const describedBy = [errorId, helperId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("space-y-2", className)}>
      <Label htmlFor={fieldId} className="flex items-center gap-2">
        {icon ?? <MapPin className="w-4 h-4" />}
        {label}
        {required && (
          <span className="text-destructive ml-1" aria-label="required">
            *
          </span>
        )}
        {showSuccessState && isValid && (
          <Check
            className={cn(
              "w-4 h-4 text-green-500 ml-auto transition-all duration-300",
              showSuccess ? "animate-success-pulse" : ""
            )}
          />
        )}
      </Label>

      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Anchor asChild>
          <div className="relative">
            <Input
              ref={inputRef}
              id={fieldId}
              type="text"
              value={value}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              placeholder={placeholder}
              autoComplete="off"
              role="combobox"
              aria-autocomplete="list"
              aria-expanded={open}
              aria-controls={open ? `${fieldId}-listbox` : undefined}
              aria-activedescendant={
                activeIndex >= 0 ? `${fieldId}-option-${activeIndex}` : undefined
              }
              aria-invalid={error ? "true" : "false"}
              aria-required={required}
              aria-describedby={describedBy}
              className={cn(
                "transition-all duration-200",
                error
                  ? "border-destructive ring-2 ring-destructive/40 focus-visible:ring-destructive focus-visible:ring-offset-2 shadow-[0_0_0_4px_rgba(248,113,113,0.14)]"
                  : isValid
                  ? "border-green-500/50 focus-visible:ring-green-500/30"
                  : "",
                shouldShake && "animate-shake"
              )}
            />
            {isLoading && (
              <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
            )}
          </div>
        </PopoverPrimitive.Anchor>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            onOpenAutoFocus={(e) => e.preventDefault()}
            onInteractOutside={() => {
              clearPredictions();
              setOpen(false);
            }}
            align="start"
            sideOffset={4}
            style={{ width: "var(--radix-popover-trigger-width)" }}
            className="z-50 rounded-md border bg-popover shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
          >
            <ul
              id={`${fieldId}-listbox`}
              role="listbox"
              aria-label={`${label} suggestions`}
              className="py-1 max-h-60 overflow-auto"
            >
              {predictions.map((prediction, index) => (
                <li
                  key={prediction.placeId}
                  id={`${fieldId}-option-${index}`}
                  role="option"
                  aria-selected={index === activeIndex}
                >
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault(); // prevent blur on input
                      selectPrediction(prediction.description);
                    }}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm flex items-center gap-2 transition-colors",
                      index === activeIndex
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <MapPin className="w-3 h-3 shrink-0 text-muted-foreground" />
                    {prediction.description}
                  </button>
                </li>
              ))}
            </ul>
            <div className="px-3 py-1.5 border-t">
              <p className="text-[10px] text-muted-foreground/60">
                © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline-offset-2 hover:underline">OpenStreetMap</a> contributors
              </p>
            </div>
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>

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

export const LocationField = memo(LocationFieldComponent);
