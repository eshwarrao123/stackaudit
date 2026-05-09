"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { auditInputSchema, type AuditInputSchema } from "@/lib/schemas/audit";
import { useLocalStorage } from "./use-local-storage";
import { runAuditClient } from "@/app/actions/audit";

// ─────────────────────────────────────────────
// useAuditForm
//
// Wraps react-hook-form with:
//   - Zod validation
//   - LocalStorage draft auto-save
//   - Step navigation state
//   - Submit handler (calls /api/audit)
// ─────────────────────────────────────────────

const DRAFT_KEY = "stackaudit:draft";
const TOTAL_STEPS = 4;

const DEFAULT_VALUES: AuditInputSchema = {
  tools: [],
  teamSize: 1,
  companyStage: "seed",
  primaryUseCase: "engineering",
};

export function useAuditForm() {
  const router = useRouter();

  const [draft, setDraft, clearDraft] = useLocalStorage<Partial<AuditInputSchema>>(
    DRAFT_KEY,
    {}
  );

  const form = useForm<AuditInputSchema>({
    resolver: zodResolver(auditInputSchema),
    defaultValues: DEFAULT_VALUES,
    mode: "onChange",
  });

  // Hydrate form from draft after localStorage loads
  useEffect(() => {
    if (draft && Object.keys(draft).length > 0) {
      form.reset({ ...DEFAULT_VALUES, ...draft });
    }
    // Run only once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-save on every change
  useEffect(() => {
    const subscription = form.watch((values) => {
      setDraft(values as Partial<AuditInputSchema>);
    });
    return () => subscription.unsubscribe();
  }, [form, setDraft]);

  const submit = form.handleSubmit(async (data: AuditInputSchema) => {
    const { reportId } = await runAuditClient(data);

    clearDraft();
    router.push(`/report/${reportId}`);
  });

  return {
    form,
    totalSteps: TOTAL_STEPS,
    submit,
    clearDraft,
  };
}
