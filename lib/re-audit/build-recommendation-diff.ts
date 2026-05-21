import type { AuditRecommendation } from "../audit-engine/types";
import type { RecommendationDiff } from "./types";

/**
 * Compares two arrays of recommendations and builds a deterministic diff.
 * Matches recommendations based on their stable `id`.
 */
export function buildRecommendationDiff(
  oldRecs: AuditRecommendation[],
  newRecs: AuditRecommendation[]
): RecommendationDiff[] {
  const diffs: RecommendationDiff[] = [];
  
  const oldMap = new Map(oldRecs.map(r => [r.id, r]));
  const newMap = new Map(newRecs.map(r => [r.id, r]));

  // Check for unchanged, changed, and removed
  for (const oldRec of oldRecs) {
    const newRec = newMap.get(oldRec.id);
    
    if (!newRec) {
      diffs.push({
        type: "removed",
        recommendationId: oldRec.id,
        oldRecommendation: oldRec,
        savingsDelta: -oldRec.estimatedSavings,
      });
      continue;
    }

    const savingsDelta = newRec.estimatedSavings - oldRec.estimatedSavings;
    const isChanged = savingsDelta !== 0 || oldRec.severity !== newRec.severity;

    diffs.push({
      type: isChanged ? "changed" : "unchanged",
      recommendationId: oldRec.id,
      oldRecommendation: oldRec,
      newRecommendation: newRec,
      savingsDelta,
    });
  }

  // Check for added
  for (const newRec of newRecs) {
    if (!oldMap.has(newRec.id)) {
      diffs.push({
        type: "added",
        recommendationId: newRec.id,
        newRecommendation: newRec,
        savingsDelta: newRec.estimatedSavings,
      });
    }
  }

  return diffs;
}
