"use client";

import { useState } from "react";
import { FormProvider } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useAuditForm } from "@/hooks/use-audit-form";
import { StepIndicator } from "@/components/audit/step-indicator";
import { ToolSelector } from "@/components/audit/tool-selector";
import { SpendInput } from "@/components/audit/spend-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ToolId } from "@/lib/engine/types";


const STEPS = [
  { label: "Tools",   description: "Pick your AI stack" },
  { label: "Spend",   description: "Enter costs & usage" },
  { label: "Team",    description: "Company context" },
  { label: "Audit",   description: "Generate report" },
];


const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 40 : -40,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -40 : 40,
    opacity: 0,
  }),
};


export default function AuditPage() {
  const router = useRouter();
  const { form, submit } = useAuditForm();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const selectedToolIds = (form.watch("tools") ?? []).map(
    (t) => t.toolId as ToolId
  );


  const goNext = async () => {
    let valid = false;

    if (step === 0) {
      valid = selectedToolIds.length > 0;
      if (!valid) {
        form.setError("tools", { message: "Select at least one AI tool to continue" });
      } else {
        form.clearErrors("tools");
      }
    } else if (step === 1) {
      valid = await form.trigger("tools");
    } else if (step === 2) {
      valid = await form.trigger(["teamSize", "companyStage", "primaryUseCase"]);
    }

    if (valid) {
      setDirection(1);
      setStep((s) => Math.min(s + 1, STEPS.length - 1));
    }
  };

  const goBack = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };


  const handleSubmit = async () => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await submit();
    } catch {
      setSubmitError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };


  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <StepContent
            title="Which AI tools does your team use?"
            subtitle="Select every tool your team has an active subscription for."
          >
            <ToolSelector
              selected={selectedToolIds}
              onChange={(ids) => {
                form.setValue(
                  "tools",
                  ids.map((id) => {
                    const existing = form.getValues("tools").find((t) => t.toolId === id);
                    return (
                      existing ?? {
                        toolId: id,
                        monthlySpend: 20,
                        seats: 1,
                        usageFrequency: "weekly" as const,
                        usedFor: [],
                      }
                    );
                  }),
                  { shouldValidate: false }
                );
              }}
              error={form.formState.errors.tools?.message}
            />
          </StepContent>
        );

      case 1:
        return (
          <StepContent
            title="How much are you spending?"
            subtitle="Enter costs and usage details for each tool. We'll pre-fill typical prices."
          >
            <SpendInput selectedToolIds={selectedToolIds} />
          </StepContent>
        );

      case 2:
        return (
          <StepContent
            title="Tell us about your team"
            subtitle="This helps calibrate the audit to your company's stage and size."
          >
            <CompanyStep form={form} />
          </StepContent>
        );

      case 3:
        return (
          <StepContent
            title="Ready to audit your AI spend?"
            subtitle="We'll analyze your stack and surface concrete savings opportunities."
          >
            <AuditSummary
              toolCount={selectedToolIds.length}
              totalSpend={form
                .getValues("tools")
                .reduce((sum, t) => sum + (t.monthlySpend ?? 0), 0)}
              teamSize={form.getValues("teamSize")}
              isSubmitting={isSubmitting}
              error={submitError}
              onSubmit={handleSubmit}
            />
          </StepContent>
        );

      default:
        return null;
    }
  };


  return (
    <div className="min-h-screen bg-[#13131b]">
      {/* ── Top navbar ── */}
      <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#13131b]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 sm:px-5 py-3.5">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm font-bold tracking-tight text-white/90 transition-opacity hover:opacity-70"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            StackAudit
          </button>
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/30">
            Step {step + 1} of {STEPS.length}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 sm:px-5 py-8 sm:py-10 space-y-8 sm:space-y-10">
        {/* Step indicator */}
        <StepIndicator steps={STEPS} currentStep={step} />

        {/* Animated step content */}
        <FormProvider {...form}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.22, ease: "easeInOut" }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>
        </FormProvider>

        {/* Navigation buttons */}
        {step < 3 && (
          <div className="flex items-center justify-between pt-2">
            <Button
              type="button"
              variant="ghost"
              onClick={goBack}
              disabled={step === 0}
              className="gap-1.5 text-white/50 hover:text-white/80 hover:bg-white/[0.05] disabled:opacity-20"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button
              type="button"
              onClick={goNext}
              className="gap-1.5 bg-indigo-500 text-white hover:bg-indigo-400 shadow-[0_0_16px_rgba(99,102,241,0.3)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
            >
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}


function StepContent({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl text-white/95 leading-tight">
          {title}
        </h1>
        <p className="text-sm text-white/45 leading-relaxed">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}


function CompanyStep({
  form,
}: {
  form: ReturnType<typeof useAuditForm>["form"];
}) {
  const errors = form.formState.errors;

  return (
    <div className="space-y-5">
      {/* Team size */}
      <div className="space-y-2">
        <label htmlFor="teamSize" className="label-caps">
          Total team size
        </label>
        <Input
          id="teamSize"
          type="number"
          min={1}
          placeholder="e.g. 12"
          className="bg-white/[0.04] border-white/[0.08] text-white/85 placeholder:text-white/25 focus:border-indigo-500/50 focus:ring-indigo-500/20"
          {...form.register("teamSize", { valueAsNumber: true })}
        />
        {errors.teamSize && (
          <p className="text-xs text-red-400">{errors.teamSize.message}</p>
        )}
      </div>

      {/* Company stage */}
      <div className="space-y-2">
        <label htmlFor="companyStage" className="label-caps">
          Company stage
        </label>
        <Select
          value={form.watch("companyStage")}
          onValueChange={(v) =>
            form.setValue("companyStage", v as AuditInputSchema["companyStage"], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger id="companyStage">
            <SelectValue placeholder="Select stage" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pre-seed">Pre-seed</SelectItem>
            <SelectItem value="seed">Seed</SelectItem>
            <SelectItem value="series-a">Series A</SelectItem>
            <SelectItem value="series-b-plus">Series B+</SelectItem>
          </SelectContent>
        </Select>
        {errors.companyStage && (
          <p className="text-xs text-destructive">{errors.companyStage.message}</p>
        )}
      </div>

      {/* Primary use case */}
      <div className="space-y-2">
        <label htmlFor="primaryUseCase" className="label-caps">
          Primary AI use case
        </label>
        <Select
          value={form.watch("primaryUseCase")}
          onValueChange={(v) =>
            form.setValue("primaryUseCase", v as AuditInputSchema["primaryUseCase"], {
              shouldValidate: true,
            })
          }
        >
          <SelectTrigger id="primaryUseCase">
            <SelectValue placeholder="Select primary use case" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="engineering">Engineering / Development</SelectItem>
            <SelectItem value="product">Product & Design</SelectItem>
            <SelectItem value="marketing">Marketing & Content</SelectItem>
            <SelectItem value="support">Customer Support</SelectItem>
            <SelectItem value="mixed">Mixed / Cross-functional</SelectItem>
          </SelectContent>
        </Select>
        {errors.primaryUseCase && (
          <p className="text-xs text-destructive">{errors.primaryUseCase.message}</p>
        )}
      </div>
    </div>
  );
}


import type { AuditInputSchema } from "@/lib/schemas/audit";

function AuditSummary({
  toolCount,
  totalSpend,
  teamSize,
  isSubmitting,
  error,
  onSubmit,
}: {
  toolCount: number;
  totalSpend: number;
  teamSize: number;
  isSubmitting: boolean;
  error: string | null;
  onSubmit: () => void;
}) {
  return (
    <div className="space-y-8">
      {/* Summary card */}
      <div className="rounded-2xl border border-white/[0.07] bg-[#1f1f27] p-6 sm:p-8 space-y-6">
        <p className="label-caps text-center">Audit Summary</p>
        <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
          <div className="space-y-1.5">
            <p className="text-3xl sm:text-4xl font-semibold tabular-nums text-white/90">{toolCount}</p>
            <p className="label-caps">{toolCount === 1 ? "Tool" : "Tools"}</p>
          </div>
          <div className="space-y-1.5 border-x border-white/[0.06]">
            <p className="text-3xl sm:text-4xl font-semibold tabular-nums text-white/90">${totalSpend.toLocaleString()}</p>
            <p className="label-caps">Monthly spend</p>
          </div>
          <div className="space-y-1.5">
            <p className="text-3xl sm:text-4xl font-semibold tabular-nums text-white/90">{teamSize}</p>
            <p className="label-caps">{teamSize === 1 ? "Member" : "Members"}</p>
          </div>
        </div>
      </div>

      {/* What you'll get */}
      <div className="space-y-2.5">
        {[
          "Optimization score (0–100)",
          "Estimated monthly savings",
          "Specific tool recommendations",
          "Shareable report link",
        ].map((item) => (
          <div key={item} className="flex items-center gap-2.5 text-sm text-white/50">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-400 text-[10px] font-bold shrink-0">+</span>
            {item}
          </div>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-red-400 bg-red-500/[0.08] border border-red-500/20 rounded-lg px-3 py-2">{error}</p>
      )}

      {/* Submit button */}
      <Button
        id="generate-audit-btn"
        type="button"
        size="lg"
        className="w-full gap-2 bg-indigo-500 text-white hover:bg-indigo-400 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_28px_rgba(99,102,241,0.4)] transition-all"
        onClick={onSubmit}
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating your audit…
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Generate Audit Report
          </>
        )}
      </Button>

      <p className="text-center text-xs text-white/25">
        Free · No credit card required · Results in seconds
      </p>
    </div>
  );
}
