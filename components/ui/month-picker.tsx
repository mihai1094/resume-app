"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  /** Default year to show when no value is set. Defaults to current year. */
  defaultYear?: number;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

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
  defaultYear,
}: MonthPickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse value or use defaultYear or current year for initial view
  const currentYear = new Date().getFullYear();
  const initialYear = defaultYear ?? currentYear;
  const [selectedYear, setSelectedYear] = React.useState<number>(() => {
    if (value) {
      const [year] = value.split("-").map(Number);
      return year;
    }
    return initialYear;
  });
  const [selectedMonth, setSelectedMonth] = React.useState<number | null>(() => {
    if (value) {
      const [, month] = value.split("-").map(Number);
      return month - 1; // 0-indexed
    }
    return null;
  });

  // Generate year range
  const startYear = 1950;
  const endYear = currentYear + 10;
  const years = Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);

  // Handle month selection
  const handleMonthSelect = (monthIndex: number) => {
    setSelectedMonth(monthIndex);
    const formatted = `${selectedYear}-${String(monthIndex + 1).padStart(2, "0")}`;
    onChange(formatted);
    setOpen(false);
  };

  // Handle year change
  const handleYearChange = (year: string) => {
    setSelectedYear(Number(year));
  };

  // Navigate year with arrows
  const prevYear = () => setSelectedYear((y) => Math.max(startYear, y - 1));
  const nextYear = () => setSelectedYear((y) => Math.min(endYear, y + 1));

  // Format display value
  const displayValue = value
    ? format(new Date(value + "-01"), "MMM yyyy")
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !displayValue && "text-muted-foreground",
            className
          )}
          disabled={disabled}
          aria-invalid={ariaInvalid}
          aria-required={ariaRequired}
          aria-describedby={ariaDescribedBy}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayValue || <span>{placeholder}</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[280px] p-0" align="start">
        <div className="p-3 space-y-3">
          {/* Year selector */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={prevYear}
              disabled={selectedYear <= startYear}
              aria-label="Previous year"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Select value={String(selectedYear)} onValueChange={handleYearChange}>
              <SelectTrigger className="w-[120px] h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {years.map((year) => (
                  <SelectItem key={year} value={String(year)}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={nextYear}
              disabled={selectedYear >= endYear}
              aria-label="Next year"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Month grid */}
          <div className="grid grid-cols-3 gap-2">
            {MONTHS.map((month, index) => {
              const isSelected = selectedMonth === index && value?.startsWith(String(selectedYear));
              return (
                <Button
                  key={month}
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className={cn(
                    "h-9 text-xs font-medium",
                    isSelected && "bg-primary text-primary-foreground"
                  )}
                  onClick={() => handleMonthSelect(index)}
                >
                  {month.slice(0, 3)}
                </Button>
              );
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

