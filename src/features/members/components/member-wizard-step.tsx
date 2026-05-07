"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface MemberWizardStepProps {
  step: number;
  currentStep: number;
  title: string;
  children: React.ReactNode;
}

export function MemberWizardStep({ step, currentStep, title, children }: MemberWizardStepProps) {
  const isActive = step === currentStep;

  if (!isActive) return null;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="mb-6">
        <h2 className="text-xl font-heading tracking-tight">{title}</h2>
      </div>
      {children}
    </div>
  );
}

export function WizardProgress({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((step) => (
          <div key={step} className="flex items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors",
                step < currentStep && "bg-emerald-500 text-white",
                step === currentStep && "bg-primary text-primary-foreground",
                step > currentStep && "bg-muted text-muted-foreground"
              )}
            >
              {step < currentStep ? <Check className="h-4 w-4" /> : step}
            </div>
            {step < totalSteps && (
              <div
                className={cn(
                  "w-12 h-1 mx-2 transition-colors",
                  step < currentStep ? "bg-emerald-500" : "bg-muted"
                )}
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Stammdaten</span>
        <span>Status & Beitrag</span>
        <span>Einladung</span>
      </div>
    </div>
  );
}
