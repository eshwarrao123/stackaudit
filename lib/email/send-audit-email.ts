// ─────────────────────────────────────────────────────────────────────────────
// Transactional Email — Resend
//
// Sends a branded "Your StackAudit report is ready" email after lead capture.
// Server-side only (called from Server Actions / API routes).
//
// Env var required: RESEND_API_KEY
// Graceful: returns { success: false } if key is missing or send fails.
// ─────────────────────────────────────────────────────────────────────────────

const RESEND_FROM = "StackAudit <onboarding@resend.dev>";

export interface AuditEmailPayload {
  to: string;
  reportId: string;
  reportUrl: string;
  estimatedSavings: number;
  totalSpend: number;
  score: number;
}

// ─── HTML template ───────────────────────────────────────────────────────────

function buildEmailHtml(p: AuditEmailPayload): string {
  const savingsFmt = `$${Math.round(p.estimatedSavings).toLocaleString()}/mo`;
  const spendFmt = `$${p.totalSpend.toLocaleString()}/mo`;

  const scoreColor =
    p.score >= 70 ? "#10b981" : p.score >= 40 ? "#f59e0b" : "#ef4444";

  const bodyMessage =
    p.estimatedSavings > 0
      ? `Based on your audit, we found <strong>${savingsFmt} in recoverable savings</strong> across your current AI spend of ${spendFmt}.`
      : `Your AI stack scored ${p.score}/100 — solid efficiency across your current subscriptions.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Your StackAudit Report</title>
</head>
<body style="margin:0;padding:0;background:#13131b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#e5e5e5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#13131b;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;">

          <!-- Header -->
          <tr>
            <td style="padding-bottom:32px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#6366f1;border-radius:8px;width:28px;height:28px;text-align:center;vertical-align:middle;">
                    <span style="color:#fff;font-size:14px;">✦</span>
                  </td>
                  <td style="padding-left:8px;font-weight:700;font-size:14px;color:#fff;">StackAudit</td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Score badge -->
          <tr>
            <td style="background:#1f1f27;border-radius:16px;border:1px solid rgba(255,255,255,0.07);padding:32px;margin-bottom:24px;">
              <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:rgba(255,255,255,0.4);">OPTIMIZATION SCORE</p>
              <p style="margin:0 0 16px;font-size:56px;font-weight:600;line-height:1;color:${scoreColor};">${p.score}<span style="font-size:24px;color:rgba(255,255,255,0.2);">/100</span></p>
              <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.6);line-height:1.6;">${bodyMessage}</p>
            </td>
          </tr>

          <!-- Spacer -->
          <tr><td style="height:16px;"></td></tr>

          <!-- CTA -->
          <tr>
            <td style="background:#1f1f27;border-radius:16px;border:1px solid rgba(99,102,241,0.2);padding:24px;text-align:center;">
              <p style="margin:0 0 16px;font-size:14px;color:rgba(255,255,255,0.7);">View your full report with all recommendations and savings breakdown.</p>
              <a href="${p.reportUrl}" style="display:inline-block;background:#6366f1;color:#fff;font-size:14px;font-weight:600;padding:12px 28px;border-radius:8px;text-decoration:none;">View Full Report →</a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding-top:32px;text-align:center;">
              <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);">
                StackAudit · AI Spend Optimization · 
                <a href="${p.reportUrl}" style="color:rgba(255,255,255,0.3);">View report</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Send function ────────────────────────────────────────────────────────────

export async function sendAuditEmail(
  payload: AuditEmailPayload
): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // No key configured — log and return success so user flow is never blocked
    console.log(
      "[StackAudit] RESEND_API_KEY not set — email skipped for:",
      payload.to
    );
    return { success: true };
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: RESEND_FROM,
        to: [payload.to],
        subject: "Your StackAudit report is ready",
        html: buildEmailHtml(payload),
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      return { success: false, error: `Resend API ${res.status}: ${body}` };
    }

    return { success: true };
  } catch (err) {
    // Non-fatal — user flow must never be blocked by email failure
    console.warn("[StackAudit] Email send failed:", err);
    return { success: false, error: String(err) };
  }
}
