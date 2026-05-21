import { notFound } from "next/navigation";
import { supabase, isSupabaseConfigured } from "@/lib/supabase/client";
import { generateReaudit } from "@/lib/re-audit/generate-reaudit";
import type { FullAuditReport } from "@/lib/audit-engine/types";
import { AuditComparisonHeader } from "@/components/re-audit/audit-comparison-header";
import { DiffSummary } from "@/components/re-audit/diff-summary";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ReauditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isSupabaseConfigured || !supabase) {
    return (
      <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center p-6">
        <p className="text-red-400">Database not configured.</p>
      </div>
    );
  }

  const { data, error } = await supabase
    .from("reports")
    .select("payload")
    .eq("id", id)
    .single();

  if (error || !data || !data.payload) {
    notFound();
  }

  const oldReport = data.payload as FullAuditReport;
  const auditDiff = generateReaudit(oldReport);

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-slate-200">
      <div className="max-w-4xl mx-auto px-6 py-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors mb-8"
        >
          <ArrowLeftIcon className="w-4 h-4" /> Create New Audit
        </Link>

        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white tracking-tight mb-3">
            Pricing Shift Analysis
          </h1>
          <p className="text-slate-400 text-lg">
            We've re-run your previous audit against the latest SaaS pricing
            models. Here is exactly what changed.
          </p>
        </div>

        <AuditComparisonHeader
          oldSavings={oldReport.totalRecoverableSavings}
          newSavings={auditDiff.newReport.totalRecoverableSavings}
          oldScore={oldReport.score}
          newScore={auditDiff.newReport.score}
        />

        <DiffSummary
          diffs={auditDiff.recommendationDiffs}
          oldReport={oldReport}
          newReport={auditDiff.newReport}
        />
      </div>
    </div>
  );
}
