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

// ─────────────────────────────────────────────
// Step definitions
// ─────────────────────────────────────────────

const STEPS = [
  { label: "Tools",   description: "Pick your AI stack" },
  { label: "Spend",   description: "Enter costs & usage" },
  { label: "Team",    description: "Company context" },
  { label: "Audit",   description: "Generate report" },
];

// ─────────────────────────────────────────────
// Slide animation variants
// ─────────────────────────────────────────────

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

// ─────────────────────────────────────────────
// Audit Page
// ─────────────────────────────────────────────

export default function AuditPage() {
  const router = useRouter();
  const { form, submit } = useAuditForm();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Derive selected tool IDs from form state for cross-step sharing
  const selectedToolIds = (form.watch("tools") ?? []).map(
    (t) => t.toolId as ToolId
  );

  // ── Step navigation ───────────────────────

  const goNext = async () => {
    let valid = false;

    if (step === 0) {
      // Validate: at least one tool selected
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

  // ── Submit ────────────────────────────────

  const handleSubmit = async () => {
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await submit();
      // Navigation handled inside useAuditForm after success
    } catch {
      setSubmitError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  // ── Step content ──────────────────────────

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
                // Maintain field array in sync — SpendInput handles append/remove
                // Here we just set the top-level selection for the selector UI
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

  // ─────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="sticky top-0 z-10 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-xl items-center justify-between px-5 py-4">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm font-bold tracking-tight text-foreground transition-opacity hover:opacity-80"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            StackAudit
          </button>
          <span className="text-[11px] font-medium tracking-widest text-muted-foreground uppercase">
            Step {step + 1} of {STEPS.length}
          </span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl px-5 py-10 space-y-10">
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
              className="gap-1.5"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <Button type="button" onClick={goNext} className="gap-1.5">
              Continue
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}

// ─────────────────────────────────────────────
// StepContent wrapper
// ─────────────────────────────────────────────

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
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl text-foreground">
          {title}
        </h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

// ─────────────────────────────────────────────
// Step 3 — Company details sub-form
// ─────────────────────────────────────────────

function CompanyStep({
  form,
}: {
  form: ReturnType<typeof useAuditForm>["form"];
}) {
  const errors = form.formState.errors;

  return (
    <div className="space-y-5">
      {/* Team size */}
      <div className="space-y-1.5">
        <label htmlFor="teamSize" className="text-sm font-medium">
          Total team size
        </label>
        <Input
          id="teamSize"
          type="number"
          min={1}
          placeholder="e.g. 12"
          {...form.register("teamSize", { valueAsNumber: true })}
        />
        {errors.teamSize && (
          <p className="text-xs text-destructive">{errors.teamSize.message}</p>
        )}
      </div>

      {/* Company stage */}
      <div className="space-y-1.5">
        <label htmlFor="companyStage" className="text-sm font-medium">
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
      <div className="space-y-1.5">
        <label htmlFor="primaryUseCase" className="text-sm font-medium">
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

// ─────────────────────────────────────────────
// Step 4 — Audit summary + submit
// ─────────────────────────────────────────────

// Import type for the form
type AuditInputSchema = import("@/lib/schemas/audit").AuditInputSchema;

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
      <div className="rounded-2xl border border-border/50 bg-gradient-to-b from-card to-muted/20 p-8 space-y-6 shadow-sm">
        <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest text-center">
          Audit Summary
        </h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="space-y-1">
            <p className="text-3xl font-semibold">{toolCount}</p>
            <p className="text-xs text-muted-foreground">
              {toolCount === 1 ? "Tool" : "Tools"}
            </p>
          </div>
          <div className="space-y-1 border-x border-border/40">
            <p className="text-3xl font-semibold">${totalSpend.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Monthly spend</p>
          </div>
          <div className="space-y-1">
            <p className="text-3xl font-semibold">{teamSize}</p>
            <p className="text-xs text-muted-foreground">
              {teamSize === 1 ? "Team member" : "Team members"}
            </p>
          </div>
        </div>
      </div>

      {/* What you'll get */}
      <div className="space-y-2">
        {[
          "Optimization score (0–100)",
          "Estimated monthly savings",
          "Specific tool recommendations",
          "Shareable report link",
        ].map((item) => (
          <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="text-primary">✓</span>
            {item}
          </div>
        ))}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Submit button */}
      <Button
        id="generate-audit-btn"
        type="button"
        size="lg"
        className="w-full gap-2"
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

      <p className="text-center text-xs text-muted-foreground">
        Free · No credit card required · Results in seconds
      </p>
    </div>
  );
}
