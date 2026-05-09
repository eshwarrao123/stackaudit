"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────
// StepIndicator
// ─────────────────────────────────────────────

interface Step {
  label: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number; // 0-indexed
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full flex items-start justify-between gap-3">
      {steps.map((step, index) => {
        const isDone = index < currentStep;
        const isActive = index === currentStep;

        return (
          <div key={step.label} className="flex flex-col flex-1 gap-2.5">
            {/* Progress line */}
            <div
              className={cn(
                "h-1 w-full rounded-full transition-all duration-500 ease-out",
                isDone ? "bg-primary" : isActive ? "bg-primary/60" : "bg-border/50"
              )}
            />

            {/* Label — hidden on xs, visible sm+ */}
            <div className="hidden sm:block">
              <p
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-wider transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground"
                )}
              >
                {step.label}
              </p>
              <p className="text-[11px] text-muted-foreground/70 mt-0.5 truncate">
                {step.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
