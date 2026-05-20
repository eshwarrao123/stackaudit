import { supabase, isSupabaseConfigured } from "../supabase/client";
import type { FullAuditReport } from "../audit-engine/types";
import { detectPricingChanges } from "./detect-pricing-changes";
import { generateReaudit } from "./generate-reaudit";
import { groupNotifications } from "./group-notifications";
import type { GroupedUserNotifications, AffectedAudit } from "./types";

/**
 * Orchestrator:
 * 1. Fetches all reports with pricing snapshots from Supabase
 * 2. Detects pricing changes
 * 3. Generates re-audits only for affected reports
 * 4. Skips reports where no meaningful change occurred
 * 5. Returns grouped notifications by user email
 */
export async function detectInvalidatedAudits(): Promise<GroupedUserNotifications[]> {
  if (!isSupabaseConfigured || !supabase) {
    console.warn("[StackAudit] Supabase not configured. Cannot fetch reports.");
    return [];
  }

  const { data, error } = await supabase
    .from("reports")
    .select("payload")
    .not("pricing_snapshot", "is", null);

  if (error || !data) {
    console.error("[StackAudit] Failed to fetch reports for re-audit:", error);
    return [];
  }

  const affectedAudits: AffectedAudit[] = [];

  for (const row of data) {
    const oldReport = row.payload as FullAuditReport;

    // Must have a pricing snapshot to compare
    if (!oldReport.pricingSnapshot) continue;

    const pricingChanges = detectPricingChanges(oldReport.pricingSnapshot);

    // If no pricing changed since this report was generated, skip
    if (pricingChanges.length === 0) continue;

    // Generate the re-audit diff
    const auditDiff = generateReaudit(oldReport);

    // Skip if there's no meaningful change in recommendations or score
    const hasRecommendationChanges = auditDiff.recommendationDiffs.some(
      (d) => d.type !== "unchanged"
    );
    const hasScoreChange = auditDiff.scoreDelta !== 0;
    
    if (hasRecommendationChanges || hasScoreChange) {
      affectedAudits.push({
        auditDiff,
        pricingChanges,
      });
    }
  }

  return groupNotifications(affectedAudits);
}
