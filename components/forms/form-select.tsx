"use client";

import { memo } from "react";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface FormSelectOption {
    value: string;
    label: string;
}

interface FormSelectProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: FormSelectOption[];
    placeholder?: string;
    required?: boolean;
    error?: string;
    helperText?: string;
    id?: string;
    className?: string;
    icon?: React.ReactNode;
}

function FormSelectComponent({
    label,
    value,
    onChange,
    options,
    placeholder = "Select an option",
    required = false,
    error,
    helperText,
    id,
    className,
    icon,
}: FormSelectProps) {
    const fieldId = id || `select-${label.toLowerCase().replace(/\s+/g, "-")}`;
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
            <Select value={value} onValueChange={onChange}>
                <SelectTrigger
                    id={fieldId}
                    className={cn(
                        "transition-all duration-200",
                        error && "border-destructive ring-2 ring-destructive/40 focus:ring-destructive",
                        !value && "text-muted-foreground"
                    )}
                    aria-invalid={error ? "true" : "false"}
                    aria-required={required}
                    aria-describedby={describedBy}
                >
                    <SelectValue placeholder={placeholder} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
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

export const FormSelect = memo(FormSelectComponent);
