// ─────────────────────────────────────────────
// Audit Action — Client-Side
//
// Runs the deterministic audit engine and persists
// the result via the DB layer (Supabase + localStorage).
// ─────────────────────────────────────────────
"use client";

import { runAuditEngine } from "@/lib/audit-engine/engine";
import { persistReport, REPORT_STORAGE_PREFIX } from "@/lib/supabase/db";
import type { AuditInputSchema } from "@/lib/schemas/audit";
import type { FullAuditReport } from "@/lib/audit-engine/types";

export { REPORT_STORAGE_PREFIX };

export async function runAuditClient(
  data: AuditInputSchema
): Promise<{ reportId: string }> {
  const result = runAuditEngine(data);
  const reportId = crypto.randomUUID().replace(/-/g, "").slice(0, 16);

  const report: FullAuditReport = {
    id: reportId,
    timestamp: new Date().toISOString(),
    input: data,
    ...result,
  };

  await persistReport(report);

  if (process.env.NODE_ENV === "development") {
    console.group(`[StackAudit] Audit complete — ${report.id}`);
    console.log("Score:", report.score);
    console.log("Total spend:", `$${report.totalSpend}/mo`);
    console.log("Est. savings:", `$${report.totalRecoverableSavings}/mo`);
    console.log("Recommendations:", report.recommendations.length);
    console.table(
      report.recommendations.map((r) => ({
        severity: r.severity,
        title: r.title,
        saving: `$${r.estimatedSavings}/mo`,
        action: r.action,
      }))
    );
    console.groupEnd();
  }

  return { reportId: report.id };
}
