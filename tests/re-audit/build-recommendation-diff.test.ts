import { describe, it, expect } from "vitest";
import { buildRecommendationDiff } from "../../lib/re-audit/build-recommendation-diff";
import type { AuditRecommendation } from "../../lib/audit-engine/types";

describe("buildRecommendationDiff", () => {
  const baseRec: AuditRecommendation = {
    id: "rec-1",
    severity: "low",
    title: "Test",
    description: "Desc",
    estimatedSavings: 100,
    confidence: 100,
    action: "test",
    category: "test"
  };

  it("detects unchanged recommendations", () => {
    const oldRecs = [baseRec];
    const newRecs = [{ ...baseRec }];
    
    const diffs = buildRecommendationDiff(oldRecs, newRecs);
    expect(diffs).toHaveLength(1);
    expect(diffs[0].type).toBe("unchanged");
    expect(diffs[0].savingsDelta).toBe(0);
  });

  it("detects changed savings", () => {
    const oldRecs = [baseRec];
    const newRecs = [{ ...baseRec, estimatedSavings: 150 }];
    
    const diffs = buildRecommendationDiff(oldRecs, newRecs);
    expect(diffs).toHaveLength(1);
    expect(diffs[0].type).toBe("changed");
    expect(diffs[0].savingsDelta).toBe(50); // 150 - 100
  });

  it("detects changed severity", () => {
    const oldRecs = [baseRec];
    const newRecs: AuditRecommendation[] = [{ ...baseRec, severity: "high" }];
    
    const diffs = buildRecommendationDiff(oldRecs, newRecs);
    expect(diffs).toHaveLength(1);
    expect(diffs[0].type).toBe("changed");
    expect(diffs[0].savingsDelta).toBe(0);
  });

  it("detects removed recommendations", () => {
    const oldRecs = [baseRec];
    const newRecs: AuditRecommendation[] = [];
    
    const diffs = buildRecommendationDiff(oldRecs, newRecs);
    expect(diffs).toHaveLength(1);
    expect(diffs[0].type).toBe("removed");
    expect(diffs[0].savingsDelta).toBe(-100);
  });

  it("detects added recommendations", () => {
    const oldRecs: AuditRecommendation[] = [];
    const newRecs = [baseRec];
    
    const diffs = buildRecommendationDiff(oldRecs, newRecs);
    expect(diffs).toHaveLength(1);
    expect(diffs[0].type).toBe("added");
    expect(diffs[0].savingsDelta).toBe(100);
  });
});
