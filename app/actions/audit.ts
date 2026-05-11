// ─────────────────────────────────────────────
// Audit Action — Client-Side
//
// Calls the deterministic audit engine directly in the browser.
// Stores the full report in localStorage so the report
// page can read it without a backend.
// ─────────────────────────────────────────────

import { runAuditEngine } from "@/lib/audit-engine/engine";
import type { AuditInputSchema } from "@/lib/schemas/audit";
import type { FullAuditReport } from "@/lib/audit-engine/types";

export const REPORT_STORAGE_PREFIX = "stackaudit:report:";

/**
 * Runs the deterministic audit engine, stores the
 * result in localStorage, and returns the report ID.
 */
export async function runAuditClient(
  data: AuditInputSchema
): Promise<{ reportId: string }> {
  
  const result = runAuditEngine(data);
  const reportId = crypto.randomUUID().replace(/-/g, "").slice(0, 16);
  
  const report: FullAuditReport = {
    id: reportId,
    timestamp: new Date().toISOString(),
    input: data,
    ...result
  };

  // Persist to localStorage so /report/[id] can read it
  try {
    localStorage.setItem(
      `${REPORT_STORAGE_PREFIX}${report.id}`,
      JSON.stringify(report)
    );

    // Also keep a recent-audits index (max 10)
    const recentRaw = localStorage.getItem("stackaudit:recent") ?? "[]";
    const recent: string[] = JSON.parse(recentRaw);
    const updated = [report.id, ...recent.filter((id) => id !== report.id)].slice(0, 10);
    localStorage.setItem("stackaudit:recent", JSON.stringify(updated));
  } catch (err) {
    // Storage quota exceeded — non-fatal
    console.warn("[StackAudit] Could not persist report to localStorage:", err);
  }

  // Dev: log the full report so you can inspect it in the console
  if (process.env.NODE_ENV === "development") {
    console.group(`[StackAudit] Audit complete — ${report.id}`);
    console.log("Score:", report.score);
    console.log("Total spend:", `$${report.totalSpend}/mo`);
    console.log("Estimated savings:", `$${report.totalRecoverableSavings}/mo`);
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
