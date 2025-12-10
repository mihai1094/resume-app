"use client";

import { Button } from "@/components/ui/button";
import { HelpCircle } from "lucide-react";
import { useWizard } from "./wizard-provider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export function WizardTrigger() {
  const { startWizard, isActive } = useWizard();

  if (isActive) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={startWizard}
            className="w-9 h-9"
          >
            <HelpCircle className="w-4 h-4" />
            <span className="sr-only">Start tutorial</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Take a tour</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
