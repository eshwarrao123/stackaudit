// ─────────────────────────────────────────────────────────────────────────────
// Audit Engine Tests — Scoring (Optimized Stack)
// ─────────────────────────────────────────────────────────────────────────────

import { describe, it, expect } from "vitest";
import { runAuditEngine } from "@/lib/audit-engine/engine";
import type { AuditInputSchema } from "@/lib/schemas/audit";

// Helper: build a minimal clean stack with no overlaps and good usage
function cleanStack(): AuditInputSchema {
  return {
    tools: [
      {
        toolId: "chatgpt",
        monthlySpend: 20,
        seats: 3,
        usageFrequency: "daily",
        usedFor: ["content-writing", "research"],
      },
      {
        toolId: "cursor",
        monthlySpend: 40,
        seats: 3,
        usageFrequency: "daily",
        usedFor: ["code-gen", "debugging"],
      },
    ],
    teamSize: 5,
    companyStage: "seed",
    primaryUseCase: "engineering",
  };
}

// Helper: build a stack with every type of issue
function wasteStack(): AuditInputSchema {
  return {
    tools: [
      {
        toolId: "chatgpt",
        monthlySpend: 100,
        seats: 20, // excess: team is 5
        usageFrequency: "daily",
        usedFor: ["research"],
      },
      {
        toolId: "claude",
        monthlySpend: 100,
        seats: 5,
        usageFrequency: "daily",
        usedFor: ["research"],
      },
      {
        toolId: "cursor",
        monthlySpend: 80,
        seats: 5,
        usageFrequency: "daily",
        usedFor: ["code-gen"],
      },
      {
        toolId: "copilot",
        monthlySpend: 95,
        seats: 5,
        usageFrequency: "daily",
        usedFor: ["code-gen"],
      },
      {
        toolId: "jasper",
        monthlySpend: 200,
        seats: 1,
        usageFrequency: "rare",
        usedFor: ["content-writing"],
      },
    ],
    teamSize: 5,
    companyStage: "seed",
    primaryUseCase: "marketing",
  };
}

describe("runAuditEngine — scoring", () => {
  it("returns a score between 0 and 100", () => {
    const result = runAuditEngine(cleanStack());
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("optimized stack scores 70 or above", () => {
    const result = runAuditEngine(cleanStack());
    expect(result.score).toBeGreaterThanOrEqual(70);
  });

  it("waste-heavy stack scores below 50", () => {
    const result = runAuditEngine(wasteStack());
    expect(result.score).toBeLessThan(50);
  });

  it("optimized stack has zero recommendations", () => {
    const result = runAuditEngine(cleanStack());
    // No overlaps, no excess seats (3 seats, team of 5), daily usage
    expect(result.recommendations).toHaveLength(0);
  });

  it("waste stack produces at least 3 recommendations", () => {
    const result = runAuditEngine(wasteStack());
    expect(result.recommendations.length).toBeGreaterThanOrEqual(3);
  });

  it("total spend sums all tool costs correctly", () => {
    const result = runAuditEngine(cleanStack());
    // 20 + 40 = 60
    expect(result.totalSpend).toBe(60);
  });

  it("monthly waste is non-negative", () => {
    const result = runAuditEngine(cleanStack());
    expect(result.monthlyWaste).toBeGreaterThanOrEqual(0);
  });

  it("active tools count matches input", () => {
    const result = runAuditEngine(cleanStack());
    expect(result.activeToolsCount).toBe(2);
  });

  it("waste stack has non-zero monthly waste", () => {
    const result = runAuditEngine(wasteStack());
    expect(result.monthlyWaste).toBeGreaterThan(0);
  });

  it("recommendations are deduplicated — no duplicate IDs", () => {
    const result = runAuditEngine(wasteStack());
    const ids = result.recommendations.map((r) => r.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });
});
