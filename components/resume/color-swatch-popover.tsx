"use client";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

interface ColorSwatchPopoverProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
}

export function ColorSwatchPopover({
  label,
  value,
  onChange,
}: ColorSwatchPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Change ${label} color: ${value}`}
          className="flex flex-col items-center gap-1 group"
        >
          <span
            className="w-8 h-8 rounded-full border-2 border-background shadow-sm ring-1 ring-border/50 transition-transform group-hover:scale-110"
            style={{ backgroundColor: value }}
          />
          <span className="text-[10px] text-muted-foreground leading-none">
            {label}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        sideOffset={8}
        className="w-auto p-3 z-[400]"
        align="center"
      >
        <p className="text-xs font-medium text-foreground mb-2">{label}</p>
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-20 w-full rounded-lg border cursor-pointer"
        />
        <p className="text-xs font-mono text-muted-foreground mt-1.5 text-center">
          {value.toUpperCase()}
        </p>
      </PopoverContent>
    </Popover>
  );
}
