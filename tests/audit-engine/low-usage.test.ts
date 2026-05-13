// ─────────────────────────────────────────────────────────────────────────────
// Audit Engine Tests — Low Usage Detection
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import { checkLowUsage } from "@/lib/audit-engine/rules";
import type { RuleContext } from "@/lib/audit-engine/types";
import type { ToolEntrySchema } from "@/lib/schemas/audit";

function makeContext(tools: Partial<ToolEntrySchema>[], teamSize = 5): RuleContext {
  const fullTools: ToolEntrySchema[] = tools.map((t) => ({
    toolId: t.toolId ?? "chatgpt",
    monthlySpend: t.monthlySpend ?? 50,
    seats: t.seats ?? 1,
    usageFrequency: t.usageFrequency ?? "daily",
    usedFor: t.usedFor ?? ["research"],
  }));

  const toolMap = new Map<string, ToolEntrySchema>(
    fullTools.map((t) => [t.toolId, t])
  );

  return {
    input: {
      tools: fullTools,
      teamSize,
      companyStage: "pre-seed",
      primaryUseCase: "marketing",
    },
    totalSpend: fullTools.reduce((s, t) => s + t.monthlySpend, 0),
    toolMap,
  };
}

describe("checkLowUsage", () => {
  it("returns empty array for daily usage", () => {
    const ctx = makeContext([
      { toolId: "chatgpt", monthlySpend: 50, usageFrequency: "daily" },
    ]);
    expect(checkLowUsage(ctx)).toHaveLength(0);
  });

  it("returns empty array for weekly usage", () => {
    const ctx = makeContext([
      { toolId: "claude", monthlySpend: 50, usageFrequency: "weekly" },
    ]);
    expect(checkLowUsage(ctx)).toHaveLength(0);
  });

  it("flags occasional usage", () => {
    const ctx = makeContext([
      { toolId: "jasper", monthlySpend: 100, usageFrequency: "occasional" },
    ]);
    const result = checkLowUsage(ctx);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("low-usage-jasper");
  });

  it("flags rare usage with high severity when spend > $50", () => {
    const ctx = makeContext([
      { toolId: "runway", monthlySpend: 100, usageFrequency: "rare" },
    ]);
    const result = checkLowUsage(ctx);
    expect(result[0].severity).toBe("high");
    expect(result[0].action).toBe("Cancel Subscription");
  });

  it("recommends downgrade (not cancel) for occasional usage", () => {
    const ctx = makeContext([
      { toolId: "grammarly", monthlySpend: 60, usageFrequency: "occasional" },
    ]);
    const result = checkLowUsage(ctx);
    expect(result[0].action).toBe("Downgrade to cheaper tier");
  });

  it("rare usage savings = 100% of monthly spend", () => {
    const ctx = makeContext([
      { toolId: "perplexity", monthlySpend: 80, usageFrequency: "rare" },
    ]);
    const result = checkLowUsage(ctx);
    expect(result[0].estimatedSavings).toBe(80);
  });

  it("occasional usage savings = 50% of monthly spend", () => {
    const ctx = makeContext([
      { toolId: "notion-ai", monthlySpend: 60, usageFrequency: "occasional" },
    ]);
    const result = checkLowUsage(ctx);
    expect(result[0].estimatedSavings).toBe(30);
  });

  it("flags multiple low-usage tools independently", () => {
    const ctx = makeContext([
      { toolId: "jasper", monthlySpend: 100, usageFrequency: "rare" },
      { toolId: "runway", monthlySpend: 80, usageFrequency: "occasional" },
    ]);
    const result = checkLowUsage(ctx);
    expect(result).toHaveLength(2);
  });
});
