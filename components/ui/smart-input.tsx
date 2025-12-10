"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSmartPlaceholder, PlaceholderType } from "@/hooks/use-smart-placeholder";
import { cn } from "@/lib/utils";

interface SmartInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "placeholder"> {
  placeholderType?: PlaceholderType | string;
  staticPlaceholder?: string;
  enableRotation?: boolean;
  rotationInterval?: number;
}

export const SmartInput = React.forwardRef<HTMLInputElement, SmartInputProps>(
  (
    {
      placeholderType = "default",
      staticPlaceholder,
      enableRotation = true,
      rotationInterval = 3000,
      className,
      value,
      ...props
    },
    ref
  ) => {
    // Only enable rotation when field is empty and focused
    const [isFocused, setIsFocused] = React.useState(false);
    const hasValue = value !== undefined && value !== "";
    const shouldRotate = enableRotation && isFocused && !hasValue;

    const { placeholder, isAnimating } = useSmartPlaceholder({
      type: placeholderType,
      enabled: shouldRotate,
      rotationInterval,
    });

    const displayPlaceholder = staticPlaceholder || placeholder;

    return (
      <Input
        ref={ref}
        value={value}
        placeholder={displayPlaceholder}
        className={cn(
          "transition-opacity",
          isAnimating && "placeholder:opacity-0",
          className
        )}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
    );
  }
);

SmartInput.displayName = "SmartInput";

// Textarea version
interface SmartTextareaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "placeholder"> {
  placeholderType?: PlaceholderType | string;
  staticPlaceholder?: string;
  enableRotation?: boolean;
  rotationInterval?: number;
}

export const SmartTextarea = React.forwardRef<
  HTMLTextAreaElement,
  SmartTextareaProps
>(
  (
    {
      placeholderType = "default",
      staticPlaceholder,
      enableRotation = true,
      rotationInterval = 4000,
      className,
      value,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const hasValue = value !== undefined && value !== "";
    const shouldRotate = enableRotation && isFocused && !hasValue;

    const { placeholder, isAnimating } = useSmartPlaceholder({
      type: placeholderType,
      enabled: shouldRotate,
      rotationInterval,
    });

    const displayPlaceholder = staticPlaceholder || placeholder;

    return (
      <Textarea
        ref={ref}
        value={value}
        placeholder={displayPlaceholder}
        className={cn(
          "transition-opacity",
          isAnimating && "placeholder:opacity-0",
          className
        )}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
        {...props}
      />
    );
  }
);

SmartTextarea.displayName = "SmartTextarea";
