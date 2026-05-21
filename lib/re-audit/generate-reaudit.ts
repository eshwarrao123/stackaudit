import { runAuditEngine } from "../audit-engine/engine";
import type { FullAuditReport } from "../audit-engine/types";
import { createPricingSnapshot } from "../pricing/current-pricing";
import { buildRecommendationDiff } from "./build-recommendation-diff";
import type { AuditDiff } from "./types";

/**
 * Takes a historic stored report, re-runs the audit engine against the
 * current pricing/rules, and generates a structural diff of the results.
 */
export function generateReaudit(oldReport: FullAuditReport): AuditDiff {
  // 1. Re-run the engine with the exact same input stack
  const newEngineResult = runAuditEngine(oldReport.input);
  
  // 2. Capture the current pricing state
  const newSnapshot = createPricingSnapshot();

  // 3. Construct the updated report
  const newReport: FullAuditReport = {
    id: oldReport.id, // Preserving original report ID to link them
    timestamp: new Date().toISOString(),
    input: oldReport.input,
    userEmail: oldReport.userEmail,
    pricingSnapshot: newSnapshot,
    pricingVersion: newSnapshot.version,
    ...newEngineResult
  };

  // 4. Generate recommendation diffs
  const recommendationDiffs = buildRecommendationDiff(
    oldReport.recommendations,
    newEngineResult.recommendations
  );

  // 5. Calculate deltas
  const scoreDelta = newEngineResult.score - oldReport.score;
  const savingsDelta = newEngineResult.totalRecoverableSavings - oldReport.totalRecoverableSavings;

  return {
    reportId: oldReport.id,
    oldReport,
    newReport,
    recommendationDiffs,
    scoreDelta,
    savingsDelta,
  };
}
