
"use client";

import { runAuditEngine } from "@/lib/audit-engine/engine";
import { persistReport, REPORT_STORAGE_PREFIX } from "@/lib/supabase/db";
import type { AuditInputSchema } from "@/lib/schemas/audit";
import type { FullAuditReport } from "@/lib/audit-engine/types";

import { createPricingSnapshot } from "@/lib/pricing/current-pricing";

export { REPORT_STORAGE_PREFIX };

export async function runAuditClient(
  data: AuditInputSchema
): Promise<{ reportId: string }> {
  const result = runAuditEngine(data);
  const reportId = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  const snapshot = createPricingSnapshot();

  const report: FullAuditReport = {
    id: reportId,
    timestamp: new Date().toISOString(),
    input: data,
    pricingSnapshot: snapshot,
    pricingVersion: snapshot.version,
    ...result,
  };

  await persistReport(report);


  return { reportId: report.id };
}
