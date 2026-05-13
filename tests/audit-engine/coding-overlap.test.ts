// ─────────────────────────────────────────────────────────────────────────────
// Audit Engine Tests — Coding Assistant Overlap Detection
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import { checkCodingAssistantOverlap } from "@/lib/audit-engine/rules";
import type { RuleContext } from "@/lib/audit-engine/types";
import type { ToolEntrySchema } from "@/lib/schemas/audit";

function makeContext(tools: Partial<ToolEntrySchema>[]): RuleContext {
  const fullTools: ToolEntrySchema[] = tools.map((t) => ({
    toolId: t.toolId ?? "cursor",
    monthlySpend: t.monthlySpend ?? 20,
    seats: t.seats ?? 1,
    usageFrequency: t.usageFrequency ?? "daily",
    usedFor: t.usedFor ?? ["code-gen"],
  }));

  const toolMap = new Map<string, ToolEntrySchema>(
    fullTools.map((t) => [t.toolId, t])
  );

  return {
    input: {
      tools: fullTools,
      teamSize: 8,
      companyStage: "series-a",
      primaryUseCase: "engineering",
    },
    totalSpend: fullTools.reduce((s, t) => s + t.monthlySpend, 0),
    toolMap,
  };
}

describe("checkCodingAssistantOverlap", () => {
  it("returns null when only Cursor is present", () => {
    const ctx = makeContext([{ toolId: "cursor", monthlySpend: 20 }]);
    const result = checkCodingAssistantOverlap(ctx);
    expect(result.rec).toBeNull();
    expect(result.overlap).toBeNull();
  });

  it("returns null when only Copilot is present", () => {
    const ctx = makeContext([{ toolId: "copilot", monthlySpend: 19 }]);
    const result = checkCodingAssistantOverlap(ctx);
    expect(result.rec).toBeNull();
  });

  it("flags duplicate when both Cursor and Copilot are present", () => {
    const ctx = makeContext([
      { toolId: "cursor", monthlySpend: 80 },
      { toolId: "copilot", monthlySpend: 57 },
    ]);
    const result = checkCodingAssistantOverlap(ctx);
    expect(result.rec).not.toBeNull();
    expect(result.rec?.id).toBe("overlap-coding");
    expect(result.rec?.severity).toBe("critical");
  });

  it("waste estimate equals min of the two costs", () => {
    const ctx = makeContext([
      { toolId: "cursor", monthlySpend: 200 },
      { toolId: "copilot", monthlySpend: 95 },
    ]);
    const result = checkCodingAssistantOverlap(ctx);
    // min(200, 95) = 95
    expect(result.rec?.estimatedSavings).toBe(95);
  });

  it("overlap is 92%", () => {
    const ctx = makeContext([
      { toolId: "cursor", monthlySpend: 20 },
      { toolId: "copilot", monthlySpend: 19 },
    ]);
    const result = checkCodingAssistantOverlap(ctx);
    expect(result.overlap?.overlapPercentage).toBe(92);
  });

  it("confidence is 95 — highest of all rules", () => {
    const ctx = makeContext([
      { toolId: "cursor", monthlySpend: 20 },
      { toolId: "copilot", monthlySpend: 19 },
    ]);
    const result = checkCodingAssistantOverlap(ctx);
    expect(result.rec?.confidence).toBe(95);
  });
});
