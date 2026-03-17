"use client";

import { Box, Step, StepLabel, Stepper, Typography } from "@mui/material";
import type { ReactNode } from "react";
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
      if (!valid) {
        return;
      }
    }
    if (isLast) {
      onComplete();
    } else {
      onStepChange(activeStep + 1);
    }
  };

  const handleBack = () => {
    if (!isFirst) {
      onStepChange(activeStep - 1);
    }
  };

  return (
    <Box className={className} sx={{ width: "100%" }}>
      <Stepper
        activeStep={activeStep}
        alternativeLabel
        sx={{
          mb: 3,
          "& .MuiStepLabel-label": { fontSize: 13, mt: 0.5 },
          "& .MuiStepLabel-label.Mui-active": { fontWeight: 600 },
        }}
      >
        {steps.map((step) => (
          <Step key={step.id}>
            <StepLabel
              optional={
                step.optional ? (
                  <Typography sx={{ fontSize: 11 }} variant="caption">
                    {step.description ?? t("wizard.optional")}
                  </Typography>
                ) : step.description ? (
                  <Typography sx={{ fontSize: 11 }} variant="caption">
                    {step.description}
                  </Typography>
                ) : undefined
              }
            >
              {step.label}
            </StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ minHeight: 200, mb: 3 }}>{currentStep?.content}</Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
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
      </Box>
    </Box>
  );
}
