import type { AuditInput, AuditReport, Recommendation } from "./types";
import RULES from "./rules";
import { calculateScore, buildToolBreakdown, totalSpend } from "./scoring";

// ─────────────────────────────────────────────
// Audit Analyzer — Entry Point
//
// Pure function: AuditInput → AuditReport
// No side effects. Safe to call from API routes,
// server components, or tests.
// ─────────────────────────────────────────────

export function generateAuditReport(input: AuditInput): AuditReport {
  // Run all rules and collect non-null recommendations
  const recommendations: Recommendation[] = RULES
    .map((rule) => rule.check(input))
    .filter((r): r is Recommendation => r !== null);

  // Sort: critical first, then warning, then info
  recommendations.sort((a, b) => severityRank(b.severity) - severityRank(a.severity));

  const score = calculateScore(input, recommendations);
  const monthly = totalSpend(input);
  const savings = recommendations.reduce((sum, r) => sum + r.estimatedMonthlySaving, 0);

  return {
    id: generateId(),
    score,
    totalMonthlySpend: monthly,
    // Cap savings at 95% of total spend (can't save more than you spend)
    estimatedMonthlySavings: Math.min(savings, monthly * 0.95),
    recommendations,
    toolBreakdown: buildToolBreakdown(input, recommendations),
    input,
    createdAt: new Date().toISOString(),
  };
}

// ─── Helpers ─────────────────────────────────

function severityRank(s: string): number {
  return s === "critical" ? 3 : s === "warning" ? 2 : 1;
}

/**
 * Generates a short, URL-safe ID without external dependencies.
 * Format: 10 alphanumeric chars (e.g., "xK9mQ2pLr1")
 */
function generateId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(10));
  return Array.from(bytes, (b) => chars[b % chars.length]).join("");
}
