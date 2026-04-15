"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { SKILL_CATEGORIES } from "@/lib/constants";

interface CategoryComboboxProps {
  value: string;
  onValueChange: (value: string) => void;
  existingCategories: string[];
  className?: string;
  triggerClassName?: string;
}

export function CategoryCombobox({
  value,
  onValueChange,
  existingCategories,
  className,
  triggerClassName,
}: CategoryComboboxProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const suggestedCategories = SKILL_CATEGORIES.filter(
    (cat) => !existingCategories.includes(cat)
  );

  const trimmedQuery = query.trim();
  const allKnown = [...existingCategories, ...suggestedCategories];
  const showCreateOption =
    trimmedQuery.length > 0 &&
    !allKnown.some((cat) => cat.toLowerCase() === trimmedQuery.toLowerCase());

  const select = (category: string) => {
    onValueChange(category);
    setOpen(false);
    setQuery("");
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "h-6 w-[130px] shrink-0 justify-between border-border/40 bg-transparent",
            "text-xs text-muted-foreground hover:bg-muted/50 px-2 font-normal",
            triggerClassName
          )}
        >
          <span className="truncate">{value}</span>
          <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className={cn("w-[220px] p-0", className)}
        align="end"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search or create..."
            value={query}
            onValueChange={setQuery}
            className="h-9 text-xs"
          />
          <CommandList>
            <CommandEmpty>No categories found.</CommandEmpty>

            {showCreateOption && (
              <CommandGroup>
                <CommandItem onSelect={() => select(trimmedQuery)}>
                  <Plus className="mr-2 h-3.5 w-3.5" />
                  Create &quot;{trimmedQuery}&quot;
                </CommandItem>
              </CommandGroup>
            )}

            {existingCategories.length > 0 && (
              <CommandGroup heading="Used in resume">
                {existingCategories
                  .filter((cat) =>
                    cat.toLowerCase().includes(trimmedQuery.toLowerCase())
                  )
                  .map((cat) => (
                    <CommandItem
                      key={cat}
                      onSelect={() => select(cat)}
                      className="text-xs"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-3.5 w-3.5",
                          value === cat ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {cat}
                    </CommandItem>
                  ))}
              </CommandGroup>
            )}

            {suggestedCategories.length > 0 && (
              <CommandGroup heading="Suggestions">
                {suggestedCategories
                  .filter((cat) =>
                    cat.toLowerCase().includes(trimmedQuery.toLowerCase())
                  )
                  .map((cat) => (
                    <CommandItem
                      key={cat}
                      onSelect={() => select(cat)}
                      className="text-xs"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-3.5 w-3.5",
                          value === cat ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {cat}
                    </CommandItem>
                  ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
