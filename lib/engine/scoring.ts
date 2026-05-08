import type { AuditInput, Recommendation, ToolAnalysis, ToolEntry } from "./types";
import { FREQUENCY_WEIGHT, TOOLS, LOW_UTILIZATION_THRESHOLD } from "../constants";

// ─────────────────────────────────────────────
// Scoring Engine
//
// Score = 100, then deduct based on recommendations and
// add bonuses for efficient spend patterns.
// Output is clamped to [0, 100].
// ─────────────────────────────────────────────

const SEVERITY_DEDUCTIONS: Record<string, number> = {
  critical: 20,
  warning:  10,
  info:      4,
};

/**
 * Compute the overall optimization score (0–100).
 * Higher = better optimized.
 */
export function calculateScore(
  input: AuditInput,
  recommendations: Recommendation[]
): number {
  let score = 100;

  // Deduct per recommendation severity
  for (const rec of recommendations) {
    score -= SEVERITY_DEDUCTIONS[rec.severity] ?? 0;
  }

  // Bonus: all tools are used at least weekly
  const allFrequentlyUsed = input.tools.every(
    (t) => t.usageFrequency === "daily" || t.usageFrequency === "weekly"
  );
  if (allFrequentlyUsed && input.tools.length > 0) {
    score += 5;
  }

  // Bonus: team has 1 or fewer tools per person on the team
  const spendPerHead = totalSpend(input) / input.teamSize;
  if (spendPerHead < 30) {
    score += 5;
  }

  return Math.max(0, Math.min(100, score));
}

// ─────────────────────────────────────────────
// Tool Breakdown
// ─────────────────────────────────────────────

/**
 * Compute per-tool utilization and verdict for the report breakdown.
 */
export function buildToolBreakdown(
  input: AuditInput,
  recommendations: Recommendation[]
): ToolAnalysis[] {
  return input.tools.map((entry) => {
    const score = computeUtilizationScore(entry);

    // Find the most severe recommendation affecting this tool
    const affecting = recommendations.filter((r) =>
      r.affectedToolIds.includes(entry.toolId)
    );
    const verdict =
      affecting.length > 0
        ? affecting.sort((a, b) => severityRank(b.severity) - severityRank(a.severity))[0].type
        : score >= LOW_UTILIZATION_THRESHOLD
        ? "keep"
        : "optimize";

    return {
      toolId: entry.toolId,
      monthlySpend: entry.monthlySpend,
      seats: entry.seats,
      utilizationScore: score,
      costPerSeat: entry.seats > 0 ? entry.monthlySpend / entry.seats : entry.monthlySpend,
      verdict,
    };
  });
}

// ─── Internals ────────────────────────────────

export function computeUtilizationScore(entry: ToolEntry): number {
  const freqWeight = FREQUENCY_WEIGHT[entry.usageFrequency] ?? 0.1;
  // More use cases = more justified spend
  const useCaseCoverage = Math.min(entry.usedFor.length / 3, 1);
  return Math.round((freqWeight * 0.7 + useCaseCoverage * 0.3) * 100);
}

function severityRank(s: string): number {
  return s === "critical" ? 3 : s === "warning" ? 2 : 1;
}

export function totalSpend(input: AuditInput): number {
  return input.tools.reduce((sum, t) => sum + t.monthlySpend, 0);
}
