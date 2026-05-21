/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { detectInvalidatedAudits } from "../../lib/re-audit/detect-invalidated-audits";

// We need to mock the Supabase client and dependencies
vi.mock("../../lib/supabase/client", () => {
  const notMock = vi.fn();
  const selectMock = vi.fn().mockReturnValue({ not: notMock });
  const fromMock = vi.fn().mockReturnValue({ select: selectMock });
  return {
    isSupabaseConfigured: true,
    supabase: {
      from: fromMock
    }
  };
});

import { supabase } from "../../lib/supabase/client";
import * as detectPricingChangesModule from "../../lib/re-audit/detect-pricing-changes";
import * as generateReauditModule from "../../lib/re-audit/generate-reaudit";
import type { FullAuditReport } from "../../lib/audit-engine/types";
import type { AuditDiff, PricingChange } from "../../lib/re-audit/types";

describe("detectInvalidatedAudits", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("skips audits when no pricing changes occurred", async () => {
    const mockReport: FullAuditReport = {
      id: "1",
      userEmail: "test@example.com",
      pricingSnapshot: { version: "v1", prices: {} as any },
    } as any;

    const notMock = vi.fn().mockResolvedValue({
      data: [{ payload: mockReport }],
      error: null
    });
    vi.mocked(supabase!.from).mockReturnValue({
      select: vi.fn().mockReturnValue({ not: notMock })
    } as any);

    vi.spyOn(detectPricingChangesModule, "detectPricingChanges").mockReturnValue([]);
    const generateSpy = vi.spyOn(generateReauditModule, "generateReaudit");

    const result = await detectInvalidatedAudits();

    expect(result).toHaveLength(0);
    expect(generateSpy).not.toHaveBeenCalled();
  });

  it("skips audits when pricing changed but recommendations/score did not", async () => {
    const mockReport: FullAuditReport = {
      id: "1",
      userEmail: "test@example.com",
      pricingSnapshot: { version: "v1", prices: {} as any },
    } as any;

    const notMock = vi.fn().mockResolvedValue({
      data: [{ payload: mockReport }],
      error: null
    });
    vi.mocked(supabase!.from).mockReturnValue({
      select: vi.fn().mockReturnValue({ not: notMock })
    } as any);

    vi.spyOn(detectPricingChangesModule, "detectPricingChanges").mockReturnValue([
      { type: "changed", toolId: "chatgpt", oldPrice: 20, newPrice: 30 } as PricingChange
    ]);

    // Mock an AuditDiff with zero score delta and all unchanged recommendations
    vi.spyOn(generateReauditModule, "generateReaudit").mockReturnValue({
      reportId: "1",
      scoreDelta: 0,
      savingsDelta: 0,
      recommendationDiffs: [{ type: "unchanged", recommendationId: "1", savingsDelta: 0 }],
      oldReport: mockReport,
      newReport: mockReport
    } as AuditDiff);

    const result = await detectInvalidatedAudits();

    expect(result).toHaveLength(0);
  });

  it("groups and returns audits that had meaningful changes", async () => {
    const mockReport: FullAuditReport = {
      id: "1",
      userEmail: "test@example.com",
      pricingSnapshot: { version: "v1", prices: {} as any },
    } as any;

    const notMock = vi.fn().mockResolvedValue({
      data: [{ payload: mockReport }],
      error: null
    });
    vi.mocked(supabase!.from).mockReturnValue({
      select: vi.fn().mockReturnValue({ not: notMock })
    } as any);

    vi.spyOn(detectPricingChangesModule, "detectPricingChanges").mockReturnValue([
      { type: "changed", toolId: "chatgpt", oldPrice: 20, newPrice: 30 } as PricingChange
    ]);

    // Mock an AuditDiff with a changed score
    vi.spyOn(generateReauditModule, "generateReaudit").mockReturnValue({
      reportId: "1",
      scoreDelta: -10, // Meaningful change
      savingsDelta: 10,
      recommendationDiffs: [{ type: "unchanged", recommendationId: "1", savingsDelta: 0 }],
      oldReport: mockReport,
      newReport: mockReport
    } as AuditDiff);

    const result = await detectInvalidatedAudits();

    expect(result).toHaveLength(1);
    expect(result[0].userEmail).toBe("test@example.com");
    expect(result[0].affectedAudits).toHaveLength(1);
  });
});
