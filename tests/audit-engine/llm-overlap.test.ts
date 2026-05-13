// ─────────────────────────────────────────────────────────────────────────────
// Audit Engine Tests — LLM Overlap Detection
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import { checkLLMOverlap } from "@/lib/audit-engine/rules";
import type { RuleContext } from "@/lib/audit-engine/types";
import type { ToolEntrySchema } from "@/lib/schemas/audit";

function makeContext(
  tools: Partial<ToolEntrySchema>[]
): RuleContext {
  const fullTools: ToolEntrySchema[] = tools.map((t) => ({
    toolId: t.toolId ?? "chatgpt",
    monthlySpend: t.monthlySpend ?? 20,
    seats: t.seats ?? 1,
    usageFrequency: t.usageFrequency ?? "daily",
    usedFor: t.usedFor ?? ["code-gen"],
  }));

  const toolMap = new Map<string, ToolEntrySchema>(
    fullTools.map((t) => [t.toolId, t])
  );

  const totalSpend = fullTools.reduce((s, t) => s + t.monthlySpend, 0);

  return {
    input: {
      tools: fullTools,
      teamSize: 5,
      companyStage: "seed",
      primaryUseCase: "engineering",
    },
    totalSpend,
    toolMap,
  };
}

describe("checkLLMOverlap", () => {
  it("returns null when only ChatGPT is present", () => {
    const ctx = makeContext([{ toolId: "chatgpt", monthlySpend: 20 }]);
    const result = checkLLMOverlap(ctx);
    expect(result.rec).toBeNull();
    expect(result.overlap).toBeNull();
  });

  it("returns null when only Claude is present", () => {
    const ctx = makeContext([{ toolId: "claude", monthlySpend: 20 }]);
    const result = checkLLMOverlap(ctx);
    expect(result.rec).toBeNull();
    expect(result.overlap).toBeNull();
  });

  it("detects overlap when both ChatGPT and Claude are present", () => {
    const ctx = makeContext([
      { toolId: "chatgpt", monthlySpend: 60 },
      { toolId: "claude", monthlySpend: 40 },
    ]);
    const result = checkLLMOverlap(ctx);
    expect(result.rec).not.toBeNull();
    expect(result.overlap).not.toBeNull();
    expect(result.rec?.id).toBe("overlap-llm");
    expect(result.rec?.severity).toBe("high");
    expect(result.rec?.category).toBe("Redundancy");
  });

  it("estimates waste as the cheaper of the two subscriptions", () => {
    const ctx = makeContext([
      { toolId: "chatgpt", monthlySpend: 100 },
      { toolId: "claude", monthlySpend: 40 },
    ]);
    const result = checkLLMOverlap(ctx);
    // min(100, 40) = 40
    expect(result.rec?.estimatedSavings).toBe(40);
  });

  it("recommends consolidating to the higher-spend (kept) tool", () => {
    const ctx = makeContext([
      { toolId: "chatgpt", monthlySpend: 30 },
      { toolId: "claude", monthlySpend: 80 },
    ]);
    const result = checkLLMOverlap(ctx);
    // Claude is more expensive → keep Claude (action says "Consolidate to Claude")
    expect(result.rec?.action).toContain("Claude");
  });

  it("overlap percentage is > 0", () => {
    const ctx = makeContext([
      { toolId: "chatgpt", monthlySpend: 20 },
      { toolId: "claude", monthlySpend: 20 },
    ]);
    const result = checkLLMOverlap(ctx);
    expect(result.overlap?.overlapPercentage).toBeGreaterThan(0);
  });
});
