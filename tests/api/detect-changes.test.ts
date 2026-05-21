import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../../app/api/detect-changes/route";
import * as detectInvalidatedAuditsModule from "../../lib/re-audit/detect-invalidated-audits";
import * as sendReauditEmailModule from "../../lib/email/send-reaudit-email";
import type { AffectedAudit } from "../../lib/re-audit/types";

vi.mock("../../lib/re-audit/detect-invalidated-audits", () => ({
  detectInvalidatedAudits: vi.fn(),
}));

vi.mock("../../lib/email/send-reaudit-email", () => ({
  sendReauditEmail: vi.fn(),
}));

interface MockResponse {
  status: number;
  json: () => Promise<Record<string, unknown>>;
}

// Mock NextResponse
vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: Record<string, unknown>, init?: { status?: number }): MockResponse => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

describe("POST /api/detect-changes", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns 200 and triggers emails for affected users", async () => {
    const makeAffectedAudit = (id: string, delta: number): AffectedAudit =>
      ({
        auditDiff: { reportId: id, savingsDelta: delta },
        pricingChanges: [],
      }) as unknown as AffectedAudit;

    vi.spyOn(
      detectInvalidatedAuditsModule,
      "detectInvalidatedAudits"
    ).mockResolvedValue([
      {
        userEmail: "test1@example.com",
        affectedAudits: [makeAffectedAudit("1", 10)],
      },
      {
        userEmail: "test2@example.com",
        affectedAudits: [makeAffectedAudit("2", -5)],
      },
    ]);

    vi.spyOn(sendReauditEmailModule, "sendReauditEmail").mockResolvedValue(true);

    const response = (await POST()) as unknown as MockResponse;
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.affectedUsersCount).toBe(2);
    expect(json.affectedAuditsCount).toBe(2);
    expect(json.emailsSent).toBe(2);
    expect(sendReauditEmailModule.sendReauditEmail).toHaveBeenCalledTimes(2);
  });

  it("handles errors gracefully", async () => {
    vi.spyOn(
      detectInvalidatedAuditsModule,
      "detectInvalidatedAudits"
    ).mockRejectedValue(new Error("DB Error"));

    const response = (await POST()) as unknown as MockResponse;
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
  });
});
