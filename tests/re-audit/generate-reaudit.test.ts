import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateReaudit } from "../../lib/re-audit/generate-reaudit";
import type { FullAuditReport } from "../../lib/audit-engine/types";
import { createPricingSnapshot } from "../../lib/pricing/current-pricing";

// We need to mock the audit-engine so it returns predictable results.
vi.mock("../../lib/audit-engine/engine", () => {
  return {
    runAuditEngine: vi.fn()
  };
});

import { runAuditEngine } from "../../lib/audit-engine/engine";

describe("generateReaudit", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const baseReport: FullAuditReport = {
    id: "old-123",
    timestamp: "2026-05-20T00:00:00.000Z",
    input: {
      teamSize: 10,
      companyStage: "series-a",
      primaryUseCase: "engineering",
      tools: []
    },
    userEmail: "test@example.com",
    score: 80,
    monthlyWaste: 50,
    totalRecoverableSavings: 50,
    criticalIssueCount: 0,
    activeToolsCount: 2,
    recommendations: [],
    overlaps: [],
    totalSpend: 100,
    pricingSnapshot: createPricingSnapshot(),
    pricingVersion: "test-v1"
  };

  it("generates an audit diff properly", () => {
    // Mock the new result returning a better score and new recommendation
    vi.mocked(runAuditEngine).mockReturnValue({
      score: 90,
      monthlyWaste: 0,
      totalRecoverableSavings: 0,
      criticalIssueCount: 0,
      activeToolsCount: 2,
      recommendations: [
        {
          id: "rec-1",
          severity: "low",
          title: "Save money",
          description: "Cancel tool",
          estimatedSavings: 20,
          confidence: 100,
          action: "cancel",
          category: "billing"
        }
      ],
      overlaps: [],
      totalSpend: 80
    });

    const diff = generateReaudit(baseReport);

    expect(diff.reportId).toBe("old-123");
    expect(diff.scoreDelta).toBe(10); // 90 - 80
    expect(diff.savingsDelta).toBe(-50); // 0 - 50
    expect(diff.recommendationDiffs).toHaveLength(1);
    expect(diff.recommendationDiffs[0].type).toBe("added");
    expect(diff.newReport.userEmail).toBe("test@example.com");
  });
});
