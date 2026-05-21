import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendReauditEmail } from "../../lib/email/send-reaudit-email";

const { sendMock } = vi.hoisted(() => ({
  sendMock: vi.fn().mockResolvedValue({ id: "mock-id" }),
}));

vi.mock("resend", () => {
  return {
    Resend: class {
      emails = { send: sendMock };
    },
  };
});

describe("sendReauditEmail", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, RESEND_API_KEY: "test_key" };
  });

  it("sends an email when API key is present", async () => {
    const success = await sendReauditEmail({
      userEmail: "test@example.com",
      affectedAudits: [
        {
          auditDiff: { reportId: "123", savingsDelta: 10, scoreDelta: 5 },
        } as any,
      ],
    });

    expect(success).toBe(true);
    expect(sendMock).toHaveBeenCalledTimes(1);
    expect(sendMock.mock.calls[0][0].to).toBe("test@example.com");
  });

  it("skips sending if API key is missing", async () => {
    delete process.env.RESEND_API_KEY;

    const success = await sendReauditEmail({
      userEmail: "test@example.com",
      affectedAudits: [],
    });

    expect(success).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });
});
