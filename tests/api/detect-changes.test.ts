import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST } from "../../app/api/detect-changes/route";
import * as detectInvalidatedAuditsModule from "../../lib/re-audit/detect-invalidated-audits";
import * as sendReauditEmailModule from "../../lib/email/send-reaudit-email";

vi.mock("../../lib/re-audit/detect-invalidated-audits", () => ({
  detectInvalidatedAudits: vi.fn(),
}));

vi.mock("../../lib/email/send-reaudit-email", () => ({
  sendReauditEmail: vi.fn(),
}));

// Mock NextResponse
vi.mock("next/server", () => ({
  NextResponse: {
    json: (body: any, init?: { status?: number }) => ({
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
    vi.spyOn(
      detectInvalidatedAuditsModule,
      "detectInvalidatedAudits"
    ).mockResolvedValue([
      {
        userEmail: "test1@example.com",
        affectedAudits: [
          { auditDiff: { reportId: "1", savingsDelta: 10 } } as any,
        ],
      },
      {
        userEmail: "test2@example.com",
        affectedAudits: [
          { auditDiff: { reportId: "2", savingsDelta: -5 } } as any,
        ],
      },
    ]);

    vi.spyOn(sendReauditEmailModule, "sendReauditEmail").mockResolvedValue(
      true
    );

    const response = (await POST()) as any;
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

    const response = (await POST()) as any;
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.success).toBe(false);
  });
});
