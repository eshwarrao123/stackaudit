
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


  return { reportId: report.id };
}
