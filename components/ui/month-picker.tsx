"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface MonthPickerProps {
  value?: string; // Format: "YYYY-MM"
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  "aria-invalid"?: "true" | "false";
  "aria-required"?: boolean;
  "aria-describedby"?: string;
  id?: string;
}

export function MonthPicker({
  value,
  onChange,
  placeholder = "Pick a month",
  disabled = false,
  className,
  "aria-invalid": ariaInvalid,
  "aria-required": ariaRequired,
  "aria-describedby": ariaDescribedBy,
  id,
}: MonthPickerProps) {
  const [open, setOpen] = React.useState(false);

  // Convert "YYYY-MM" to Date (first day of month)
  const date = value
    ? new Date(value + "-01")
    : undefined;

  const handleSelect = (selectedDate: Date | undefined) => {
    if (selectedDate) {
      // Format as "YYYY-MM"
      const formatted = format(selectedDate, "yyyy-MM");
      onChange(formatted);
      setOpen(false);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground",
            className
          )}
          disabled={disabled}
          aria-invalid={ariaInvalid}
          aria-required={ariaRequired}
          aria-describedby={ariaDescribedBy}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "MMM yyyy") : <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-3">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleSelect}
            defaultMonth={date}
            captionLayout="dropdown"
            fromYear={1950}
            toYear={new Date().getFullYear() + 10}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}

