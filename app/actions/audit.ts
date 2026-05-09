// ─────────────────────────────────────────────
// Audit Action — Client-Side
//
// Calls generateAuditReport() directly in the browser.
// Stores the full report in localStorage so the report
// page can read it without a backend.
//
// When Supabase is wired up (Day 4), replace the
// localStorage.setItem call with a fetch to /api/audit.
// ─────────────────────────────────────────────

import { generateAuditReport } from "@/lib/engine/analyzer";
import type { AuditInputSchema } from "@/lib/schemas/audit";
import type { AuditInput } from "@/lib/engine/types";

export const REPORT_STORAGE_PREFIX = "stackaudit:report:";

/**
 * Maps the Zod form schema (AuditInputSchema) to the
 * engine's AuditInput type, runs the audit, stores the
 * result in localStorage, and returns the report ID.
 */
export async function runAuditClient(
  data: AuditInputSchema
): Promise<{ reportId: string }> {
  // AuditInputSchema and AuditInput are structurally identical —
  // the cast is safe because the Zod schema validates the same shape.
  const input = data as AuditInput;

  const report = generateAuditReport(input);

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
    console.log("Total spend:", `$${report.totalMonthlySpend}/mo`);
    console.log("Estimated savings:", `$${report.estimatedMonthlySavings.toFixed(0)}/mo`);
    console.log("Recommendations:", report.recommendations.length);
    console.table(
      report.recommendations.map((r) => ({
        severity: r.severity,
        title: r.title,
        saving: `$${r.estimatedMonthlySaving.toFixed(0)}/mo`,
        action: r.actionLabel,
      }))
    );
    console.groupEnd();
  }

  return { reportId: report.id };
}
