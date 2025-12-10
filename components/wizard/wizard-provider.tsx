"use client";

import { createContext, useContext, ReactNode } from "react";
import { useWizardMode } from "@/hooks/use-wizard-mode";
import { WizardTooltip } from "./wizard-tooltip";

interface WizardContextType {
  isActive: boolean;
  hasCompleted: boolean;
  startWizard: () => void;
  resetWizard: () => void;
}

const WizardContext = createContext<WizardContextType | null>(null);

export function useWizard() {
  const context = useContext(WizardContext);
  if (!context) {
    throw new Error("useWizard must be used within a WizardProvider");
  }
  return context;
}

interface WizardProviderProps {
  children: ReactNode;
}

export function WizardProvider({ children }: WizardProviderProps) {
  const wizard = useWizardMode();

  return (
    <WizardContext.Provider
      value={{
        isActive: wizard.isActive,
        hasCompleted: wizard.hasCompleted,
        startWizard: wizard.startWizard,
        resetWizard: wizard.resetWizard,
      }}
    >
      {children}
      {wizard.isActive && wizard.currentStepData && (
        <WizardTooltip
          step={wizard.currentStepData}
          currentStep={wizard.currentStep}
          totalSteps={wizard.totalSteps}
          progress={wizard.progress}
          onNext={wizard.nextStep}
          onPrevious={wizard.previousStep}
          onSkip={wizard.skipWizard}
        />
      )}
    </WizardContext.Provider>
  );
}
