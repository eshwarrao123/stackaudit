import { Resend } from "resend";
import type { GroupedUserNotifications } from "../re-audit/types";

const resend = new Resend(process.env.RESEND_API_KEY || "dummy_key");

export async function sendReauditEmail(
  notification: GroupedUserNotifications
): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.warn(
      "[StackAudit] RESEND_API_KEY missing. Skipping email for:",
      notification.userEmail
    );
    return false;
  }

  // Count total deltas across all affected audits for this user
  let totalSavingsDelta = 0;
  for (const audit of notification.affectedAudits) {
    totalSavingsDelta += audit.auditDiff.savingsDelta;
  }

  const savingsString =
    totalSavingsDelta > 0
      ? `+$${totalSavingsDelta}/mo in new savings`
      : `$${Math.abs(totalSavingsDelta)}/mo drift in savings`;

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #0f1115; color: #f3f4f6; padding: 24px; border-radius: 8px; border: 1px solid #1f2937;">
      <h2 style="color: #f8fafc; border-bottom: 1px solid #1f2937; padding-bottom: 12px;">StackAudit Monitor</h2>
      <p style="font-size: 16px; color: #cbd5e1;">We detected pricing changes in your tech stack that affect your previous optimization audits.</p>
      
      <div style="background-color: #1e293b; padding: 16px; border-radius: 6px; margin-bottom: 24px; border: 1px solid #334155;">
        <h3 style="margin-top: 0; color: #94a3b8; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Impact Summary</h3>
        <p style="font-size: 20px; font-weight: bold; color: ${totalSavingsDelta > 0 ? "#34d399" : "#f87171"
    }; margin-bottom: 0;">
          ${savingsString}
        </p>
      </div>
      
      <p style="font-size: 14px; color: #94a3b8;">Below are the audits affected by recent pricing shifts:</p>
      
      ${notification.affectedAudits
      .map(
        (audit) => `
        <div style="border-top: 1px solid #1f2937; padding-top: 16px; margin-top: 16px;">
          <p style="margin-bottom: 4px; font-size: 14px; color: #cbd5e1;"><strong>Audit ID:</strong> ${audit.auditDiff.reportId.slice(0, 8)}...</p>
          <p style="margin-top: 0; margin-bottom: 16px; font-size: 13px; color: #64748b;">
            Score changed by ${audit.auditDiff.scoreDelta > 0 ? "+" : ""}${audit.auditDiff.scoreDelta} pts
          </p>
          <a href="https://stackaudit.app/re-audit/${audit.auditDiff.reportId}" 
             style="display: inline-block; background-color: #ffffff; color: #000000; text-decoration: none; padding: 10px 16px; border-radius: 4px; font-weight: 500; font-size: 14px;">
            View Side-by-Side Diff
          </a>
        </div>
      `
      )
      .join("")}
      
      <hr style="border: none; border-top: 1px solid #1f2937; margin-top: 32px; margin-bottom: 16px;" />
      <p style="font-size: 12px; color: #475569; text-align: center;">You are receiving this because you requested StackAudit updates.</p>
    </div>
  `;

  try {
    await resend.emails.send({
      from: "StackAudit <onboarding@resend.dev>",
      to: notification.userEmail,
      subject: "StackAudit: New Pricing Changes Detected",
      html,
    });
    return true;
  } catch (error) {
    console.error(
      "[StackAudit] Failed to send email to",
      notification.userEmail,
      error
    );
    return false;
  }
}
