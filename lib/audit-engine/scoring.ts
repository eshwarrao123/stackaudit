import { AuditRecommendation, OverlapInsight, RuleContext } from "./types";

export function calculateScore(recs: AuditRecommendation[], overlaps: OverlapInsight[], context: RuleContext): number {
  let score = 100;

  // Penalties for recommendations based on severity
  recs.forEach(rec => {
    if (rec.severity === "critical") score -= 15;
    else if (rec.severity === "high") score -= 10;
    else if (rec.severity === "medium") score -= 5;
    else score -= 2;
  });

  // Penalties for overlaps
  overlaps.forEach(overlap => {
    if (overlap.overlapPercentage > 80) score -= 10;
    else if (overlap.overlapPercentage > 50) score -= 5;
  });

  // Global penalty for waste ratio
  const totalWaste = recs.reduce((sum, r) => sum + r.estimatedSavings, 0);
  if (context.totalSpend > 0) {
    const wasteRatio = totalWaste / context.totalSpend;
    if (wasteRatio > 0.5) score -= 20;
    else if (wasteRatio > 0.2) score -= 10;
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}
