// ─────────────────────────────────────────────────────────────────────────────
// AI Summary Generator
//
// Generates a ~100-word operator-focused personalized audit summary.
// Calls the OpenAI Chat Completions API (server-side only) via a Next.js
// route handler, so no API key is exposed to the client.
//
// Fallback chain:
//   1. OpenAI API (if OPENAI_API_KEY is set)
//   2. Deterministic templated summary (always available)
// ─────────────────────────────────────────────────────────────────────────────

import type { FullAuditReport } from "@/lib/audit-engine/types";
import { TOOLS } from "@/lib/constants";

// ─── Prompt builder ───────────────────────────────────────────────────────────
// Exported so it can be documented and inspected in tests.

export function buildSummaryPrompt(report: FullAuditReport): string {
  const toolNames = report.input.tools
    .map((t) => TOOLS[t.toolId as keyof typeof TOOLS]?.name ?? t.toolId)
    .join(", ");

  const overlapList =
    report.overlaps.length > 0
      ? report.overlaps
          .map(
            (o) =>
              `${o.tools.map((t) => TOOLS[t as keyof typeof TOOLS]?.name ?? t).join(" and ")} (${o.overlapPercentage}% overlap)`
          )
          .join("; ")
      : "none detected";

  return `You are a financial analyst specializing in SaaS spend optimization for early-stage startups.

Write a concise, operator-focused audit summary (~90-110 words) based ONLY on the data provided below. 
Do NOT invent numbers, tools, or pricing. Be direct and actionable.

Data:
- Company stage: ${report.input.companyStage}
- Team size: ${report.input.teamSize}
- Primary use case: ${report.input.primaryUseCase}
- AI tools in use: ${toolNames}
- Total monthly AI spend: $${report.totalSpend.toLocaleString()}
- Estimated monthly savings: $${Math.round(report.monthlyWaste).toLocaleString()}
- Optimization score: ${report.score}/100
- Overlapping tools: ${overlapList}
- Number of recommendations: ${report.recommendations.length}

Tone: concise, no fluff, startup-operator voice. Start directly with the finding.`;
}

// ─── Deterministic fallback ───────────────────────────────────────────────────

export function buildDeterministicSummary(report: FullAuditReport): string {
  const toolNames = report.input.tools
    .map((t) => TOOLS[t.toolId as keyof typeof TOOLS]?.name ?? t.toolId)
    .join(", ");

  const savingsFmt = `$${Math.round(report.monthlyWaste).toLocaleString()}/mo`;
  const spendFmt = `$${report.totalSpend.toLocaleString()}/mo`;

  const hasOverlaps = report.overlaps.length > 0;
  const hasCriticals = report.criticalIssueCount > 0;

  const stage =
    report.input.companyStage === "pre-seed" || report.input.companyStage === "seed"
      ? "early-stage"
      : "growth-stage";

  let body: string;

  if (report.score >= 70) {
    body = `Your ${stage} team is running a relatively lean AI stack across ${toolNames}. At ${spendFmt} total spend, there are limited immediate consolidation opportunities. ${hasCriticals ? `However, ${report.criticalIssueCount} issue${report.criticalIssueCount > 1 ? "s" : ""} warrant attention.` : "Maintain your current discipline as the team scales."} Focus on usage tracking as headcount grows to prevent seat sprawl before it compounds.`;
  } else if (report.score >= 40) {
    body = `Your team is spending ${spendFmt} on AI tooling with ${savingsFmt} in recoverable waste. ${hasOverlaps ? `Tool overlap between ${report.overlaps.map((o) => o.tools.map((t) => TOOLS[t as keyof typeof TOOLS]?.name ?? t).join(" and ")).join(", ")} is the primary driver.` : `Underutilization is the main cost driver.`} With ${report.recommendations.length} specific recommendation${report.recommendations.length !== 1 ? "s" : ""}, this audit provides a clear consolidation roadmap. Implementing these changes should improve your score to the 70+ range within one billing cycle.`;
  } else {
    body = `Significant AI spend inefficiency detected. Your team is spending ${spendFmt}/month with ${savingsFmt} potentially recoverable — that's ${Math.round((report.monthlyWaste / report.totalSpend) * 100)}% of your AI budget. ${hasCriticals ? `${report.criticalIssueCount} critical issue${report.criticalIssueCount > 1 ? "s require" : " requires"} immediate action.` : ""} ${hasOverlaps ? `Tool overlap across ${report.overlaps.length} pair${report.overlaps.length > 1 ? "s" : ""} is driving redundant costs.` : ""} Prioritize the highest-savings recommendations first for fastest runway impact.`;
  }

  return body.replace(/\s+/g, " ").trim();
}

// ─── Main export ──────────────────────────────────────────────────────────────

export type SummaryResult = {
  summary: string;
  source: "ai" | "fallback";
  prompt?: string;
};

/**
 * Called from a Server Action or API route — never directly from the browser.
 * Returns the generated summary and the source used.
 */
export async function generateAuditSummary(
  report: FullAuditReport
): Promise<SummaryResult> {
  const prompt = buildSummaryPrompt(report);
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return {
      summary: buildDeterministicSummary(report),
      source: "fallback",
      prompt,
    };
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 180,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const json = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    const summary = json.choices[0]?.message?.content?.trim();
    if (!summary) throw new Error("Empty response from OpenAI");

    return { summary, source: "ai", prompt };
  } catch (err) {
    console.warn("[StackAudit] AI summary generation failed, using fallback:", err);
    return {
      summary: buildDeterministicSummary(report),
      source: "fallback",
      prompt,
    };
  }
}
