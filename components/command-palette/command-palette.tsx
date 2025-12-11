"use client";

import { useEffect, useCallback } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useCommandPaletteContext } from "@/hooks/use-command-palette";
import { AICommand } from "@/lib/constants/ai-commands";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function CommandPalette() {
  const {
    isOpen,
    close,
    searchQuery,
    setSearchQuery,
    availableCommands,
    executeCommand,
    focusedField,
  } = useCommandPaletteContext();

  // Group commands by context
  const contextCommands = availableCommands.filter(
    (cmd) => !cmd.contexts.includes("global")
  );
  const globalCommands = availableCommands.filter((cmd) =>
    cmd.contexts.includes("global")
  );

  const handleSelect = useCallback(
    (command: AICommand) => {
      executeCommand(command);
    },
    [executeCommand]
  );

  return (
    <CommandDialog open={isOpen} onOpenChange={(open) => !open && close()}>
      <CommandInput
        placeholder="Search AI commands..."
        value={searchQuery}
        onValueChange={setSearchQuery}
      />
      <CommandList>
        <CommandEmpty>No commands found.</CommandEmpty>

        {/* Context-specific commands */}
        {contextCommands.length > 0 && (
          <CommandGroup
            heading={
              focusedField?.context
                ? `${focusedField.context.charAt(0).toUpperCase() + focusedField.context.slice(1)} Actions`
                : "Field Actions"
            }
          >
            {contextCommands.map((command) => (
              <CommandItem
                key={command.id}
                value={command.id}
                onSelect={() => handleSelect(command)}
                className="gap-3 cursor-pointer"
              >
                <command.icon className="w-4 h-4 text-primary" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{command.label}</span>
                    {command.requiresJD && (
                      <Badge variant="outline" className="text-[10px] px-1.5">
                        JD
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {command.description}
                  </p>
                </div>
                {command.shortcut && (
                  <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    {command.shortcut}
                  </kbd>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        {/* Separator if both groups exist */}
        {contextCommands.length > 0 && globalCommands.length > 0 && (
          <CommandSeparator />
        )}

        {/* Global commands */}
        {globalCommands.length > 0 && (
          <CommandGroup heading="Resume Actions">
            {globalCommands.map((command) => (
              <CommandItem
                key={command.id}
                value={command.id}
                onSelect={() => handleSelect(command)}
                className="gap-3 cursor-pointer"
              >
                <command.icon className="w-4 h-4 text-primary" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{command.label}</span>
                    {command.requiresJD && (
                      <Badge variant="outline" className="text-[10px] px-1.5">
                        JD
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {command.description}
                  </p>
                </div>
                {command.shortcut && (
                  <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    {command.shortcut}
                  </kbd>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}
      </CommandList>

      {/* Footer */}
      <div className="border-t px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-muted text-[10px]">↑↓</kbd>
            navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-muted text-[10px]">↵</kbd>
            select
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded bg-muted text-[10px]">esc</kbd>
            close
          </span>
        </div>
        <span className="flex items-center gap-1">
          <kbd className="px-1 py-0.5 rounded bg-muted text-[10px]">⌘K</kbd>
          to open
        </span>
      </div>
    </CommandDialog>
  );
}
