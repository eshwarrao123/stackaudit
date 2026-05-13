// ─────────────────────────────────────────────────────────────────────────────
// API Route: POST /api/leads
//
// Handles lead capture from the report page:
//   1. Honeypot check — silently rejects bot submissions
//   2. Persists lead to Supabase via submitLead()
//   3. Sends transactional email via Resend (non-blocking)
//
// Abuse protection:
//   Hidden field `website` — humans leave it blank; bots fill it in.
//   If filled, we return 200 (so bots don't know they were rejected)
//   but do NOT persist or send email.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { submitLead } from "@/lib/supabase/db";
import { sendAuditEmail } from "@/lib/email/send-audit-email";

interface LeadPayload {
  email: string;
  reportId: string;
  reportUrl: string;
  estimatedSavings: number;
  totalSpend: number;
  score: number;
  source?: string;
  // Honeypot field — should always be empty from real users
  website?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as LeadPayload;

    // ── Honeypot check ────────────────────────────────────────────────────
    // The `website` field is hidden in the UI via CSS (not display:none —
    // that's too obvious for some bots). Real users never see or fill it.
    // If it contains any value, this is a bot submission — reject silently.
    if (body.website) {
      // Return 200 so bots believe the submission succeeded.
      // Log at warn level for monitoring, but don't persist anything.
      console.warn("[StackAudit] Honeypot triggered — bot submission rejected:", {
        email: body.email?.slice(0, 5) + "***",
      });
      return NextResponse.json({ success: true });
    }

    // ── Basic validation ──────────────────────────────────────────────────
    const email = body.email?.trim().toLowerCase();
    if (!email || !email.includes("@") || !body.reportId) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // ── Persist lead ──────────────────────────────────────────────────────
    const leadResult = await submitLead(
      email,
      body.reportId,
      (body.source as "report_cta" | "report_export") ?? "report_cta"
    );

    // ── Send email (fire-and-forget — never blocks user response) ─────────
    if (leadResult.success && body.reportUrl) {
      sendAuditEmail({
        to: email,
        reportId: body.reportId,
        reportUrl: body.reportUrl,
        estimatedSavings: body.estimatedSavings ?? 0,
        totalSpend: body.totalSpend ?? 0,
        score: body.score ?? 0,
      }).catch((err) => {
        console.warn("[StackAudit] Email fire-and-forget failed:", err);
      });
    }

    return NextResponse.json({ success: leadResult.success });
  } catch (err) {
    console.error("[StackAudit] /api/leads error:", err);
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
