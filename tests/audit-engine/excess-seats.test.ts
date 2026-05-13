// ─────────────────────────────────────────────────────────────────────────────
// Audit Engine Tests — Excess Seats Detection
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import { checkExcessSeats } from "@/lib/audit-engine/rules";
import type { RuleContext } from "@/lib/audit-engine/types";
import type { ToolEntrySchema } from "@/lib/schemas/audit";

function makeContext(
  tools: Partial<ToolEntrySchema>[],
  teamSize = 5
): RuleContext {
  const fullTools: ToolEntrySchema[] = tools.map((t) => ({
    toolId: t.toolId ?? "chatgpt",
    monthlySpend: t.monthlySpend ?? 40,
    seats: t.seats ?? 2,
    usageFrequency: t.usageFrequency ?? "daily",
    usedFor: t.usedFor ?? ["code-gen"],
  }));

  const toolMap = new Map<string, ToolEntrySchema>(
    fullTools.map((t) => [t.toolId, t])
  );

  return {
    input: {
      tools: fullTools,
      teamSize,
      companyStage: "seed",
      primaryUseCase: "mixed",
    },
    totalSpend: fullTools.reduce((s, t) => s + t.monthlySpend, 0),
    toolMap,
  };
}

describe("checkExcessSeats", () => {
  it("returns empty array when seats equal team size", () => {
    const ctx = makeContext(
      [{ toolId: "chatgpt", monthlySpend: 100, seats: 5 }],
      5
    );
    const result = checkExcessSeats(ctx);
    expect(result).toHaveLength(0);
  });

  it("returns empty array when seats are below team size", () => {
    const ctx = makeContext(
      [{ toolId: "cursor", monthlySpend: 80, seats: 4 }],
      10
    );
    const result = checkExcessSeats(ctx);
    expect(result).toHaveLength(0);
  });

  it("flags a tool when seats exceed team size", () => {
    const ctx = makeContext(
      [{ toolId: "copilot", monthlySpend: 190, seats: 10 }],
      5 // team is 5, tool has 10 seats
    );
    const result = checkExcessSeats(ctx);
    expect(result).toHaveLength(1);
    expect(result[0].severity).toBe("critical");
    expect(result[0].id).toBe("excess-seats-copilot");
  });

  it("calculates waste correctly for excess seats", () => {
    // 10 seats, $200/mo → $20/seat. Team size = 6, excess = 4 seats
    const ctx = makeContext(
      [{ toolId: "gemini", monthlySpend: 200, seats: 10 }],
      6
    );
    const result = checkExcessSeats(ctx);
    // 4 excess seats × $20/seat = $80 waste
    expect(result[0].estimatedSavings).toBe(80);
  });

  it("flags multiple tools independently", () => {
    const ctx = makeContext(
      [
        { toolId: "chatgpt", monthlySpend: 100, seats: 10 },
        { toolId: "cursor", monthlySpend: 80, seats: 8 },
      ],
      4
    );
    const result = checkExcessSeats(ctx);
    expect(result).toHaveLength(2);
  });

  it("action string mentions the excess seat count", () => {
    const ctx = makeContext(
      [{ toolId: "notion-ai", monthlySpend: 60, seats: 8 }],
      5
    );
    const result = checkExcessSeats(ctx);
    // 3 excess seats
    expect(result[0].action).toContain("3");
  });
});
