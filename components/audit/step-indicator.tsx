"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  label: string;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="w-full space-y-4">
      {/* Progress segments */}
      <div className="flex gap-1.5">
        {steps.map((_, index) => {
          const isDone = index < currentStep;
          const isActive = index === currentStep;
          return (
            <div
              key={index}
              className={cn(
                "h-[2px] flex-1 rounded-full transition-all duration-500 ease-out",
                isDone
                  ? "bg-indigo-500"
                  : isActive
                  ? "bg-indigo-500/50"
                  : "bg-white/[0.08]"
              )}
            />
          );
        })}
      </div>

      {/* Step labels (desktop) */}
      <div className="hidden sm:flex items-start justify-between">
        {steps.map((step, index) => {
          const isDone = index < currentStep;
          const isActive = index === currentStep;
          return (
            <div key={step.label} className="flex flex-1 flex-col gap-0.5">
              <p
                className={cn(
                  "text-[10px] font-semibold uppercase tracking-widest transition-colors",
                  isActive
                    ? "text-white/90"
                    : isDone
                    ? "text-indigo-400"
                    : "text-white/25"
                )}
              >
                {step.label}
              </p>
              <p
                className={cn(
                  "text-[11px] truncate transition-colors",
                  isActive ? "text-white/40" : "text-white/20"
                )}
              >
                {step.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
