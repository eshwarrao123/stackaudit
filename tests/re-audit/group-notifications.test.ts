import { describe, it, expect } from "vitest";
import { groupNotifications } from "../../lib/re-audit/group-notifications";
import type { AffectedAudit } from "../../lib/re-audit/types";
import type { FullAuditReport } from "../../lib/audit-engine/types";

describe("groupNotifications", () => {
  const createMockAudit = (email?: string, id: string = "1"): AffectedAudit => ({
    auditDiff: {
      reportId: id,
      oldReport: { userEmail: email } as FullAuditReport,
      newReport: {} as FullAuditReport,
      recommendationDiffs: [],
      scoreDelta: 0,
      savingsDelta: 0
    },
    pricingChanges: []
  });

  it("groups multiple audits by the same email", () => {
    const audits = [
      createMockAudit("user@example.com", "1"),
      createMockAudit("user@example.com", "2"),
      createMockAudit("other@example.com", "3"),
    ];

    const grouped = groupNotifications(audits);

    expect(grouped).toHaveLength(2);
    
    const user = grouped.find(g => g.userEmail === "user@example.com");
    expect(user?.affectedAudits).toHaveLength(2);
    expect(user?.affectedAudits.map(a => a.auditDiff.reportId)).toEqual(["1", "2"]);

    const other = grouped.find(g => g.userEmail === "other@example.com");
    expect(other?.affectedAudits).toHaveLength(1);
  });

  it("ignores audits without an email", () => {
    const audits = [
      createMockAudit(undefined, "1"),
      createMockAudit("user@example.com", "2")
    ];

    const grouped = groupNotifications(audits);
    expect(grouped).toHaveLength(1);
    expect(grouped[0].userEmail).toBe("user@example.com");
  });
});
