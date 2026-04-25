"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface NumericStepperProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (value: number) => void;
}

export function NumericStepper({
  label,
  value,
  min,
  max,
  step,
  unit,
  onChange,
}: NumericStepperProps) {
  const precision = step < 1 ? 1 : 0;
  const atMin = value <= min;
  const atMax = value >= max;

  const decrement = () => {
    if (!atMin) onChange(parseFloat((value - step).toFixed(precision)));
  };

  const increment = () => {
    if (!atMax) onChange(parseFloat((value + step).toFixed(precision)));
  };

  return (
    <div className="flex items-center justify-between h-9">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={decrement}
          disabled={atMin}
          aria-label={`Decrease ${label}`}
          className={cn(
            "inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
            "bg-muted/50 hover:bg-muted active:bg-muted/80",
            "disabled:opacity-30 disabled:pointer-events-none"
          )}
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="text-sm font-medium tabular-nums w-12 text-center select-none">
          {value.toFixed(precision)}{unit}
        </span>
        <button
          type="button"
          onClick={increment}
          disabled={atMax}
          aria-label={`Increase ${label}`}
          className={cn(
            "inline-flex items-center justify-center w-8 h-8 rounded-lg transition-colors",
            "bg-muted/50 hover:bg-muted active:bg-muted/80",
            "disabled:opacity-30 disabled:pointer-events-none"
          )}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
