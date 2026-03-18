"use client";

import type { ReactNode } from "react";
import { cn } from "@/shared/lib/ui/cn";
import { AppButton } from "@/shared/ui/primitives/button";
import { useI18n } from "@/shared/providers/locale-provider";

export interface AppStepWizardStep {
  id: string;
  label: string;
  description?: string;
  optional?: boolean;
  content: ReactNode;
  validate?: () => boolean | Promise<boolean>;
}

interface AppStepWizardProps {
  steps: readonly AppStepWizardStep[];
  activeStep: number;
  onStepChange: (step: number) => void;
  onComplete: () => void;
  completeLabel?: string;
  nextLabel?: string;
  backLabel?: string;
  loading?: boolean;
  className?: string;
}

export function AppStepWizard({
  steps,
  activeStep,
  onStepChange,
  onComplete,
  completeLabel,
  nextLabel,
  backLabel,
  loading = false,
  className,
}: AppStepWizardProps) {
  const { t } = useI18n();
  const currentStep = steps[activeStep];
  const isLast = activeStep === steps.length - 1;
  const isFirst = activeStep === 0;

  const handleNext = async () => {
    if (currentStep?.validate) {
      const valid = await currentStep.validate();
      if (!valid) return;
    }
    if (isLast) {
      onComplete();
    } else {
      onStepChange(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (!isFirst) onStepChange(activeStep - 1);
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Stepper */}
      <div className="mb-6 flex items-center justify-between gap-2">
        {steps.map((step, idx) => {
          const isActive = idx === activeStep;
          const isCompleted = idx < activeStep;

          return (
            <div className="flex flex-1 flex-col items-center gap-1" key={step.id}>
              <div className="flex w-full items-center">
                {idx > 0 ? (
                  <div
                    className={cn(
                      "h-0.5 flex-1",
                      isCompleted ? "bg-primary" : "bg-border",
                    )}
                  />
                ) : null}
                <div
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : isCompleted
                        ? "bg-primary/15 text-primary"
                        : "bg-muted text-muted-foreground",
                  )}
                >
                  {isCompleted ? "✓" : idx + 1}
                </div>
                {idx < steps.length - 1 ? (
                  <div
                    className={cn(
                      "h-0.5 flex-1",
                      isCompleted ? "bg-primary" : "bg-border",
                    )}
                  />
                ) : null}
              </div>
              <span
                className={cn(
                  "text-center text-xs",
                  isActive ? "font-semibold text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
              {step.description || step.optional ? (
                <span className="text-center text-[10px] text-muted-foreground">
                  {step.description ?? (step.optional ? t("wizard.optional") : "")}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="min-h-[200px] pb-4">{currentStep?.content}</div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 border-t border-border pt-4">
        <AppButton
          disabled={isFirst || loading}
          label={backLabel ?? t("wizard.back")}
          onClick={handleBack}
          variant="outline"
        />
        <AppButton
          disabled={loading}
          label={
            isLast
              ? (completeLabel ?? t("wizard.complete"))
              : (nextLabel ?? t("wizard.next"))
          }
          onClick={() => void handleNext()}
          variant="primary"
        />
      </div>
    </div>
  );
}
