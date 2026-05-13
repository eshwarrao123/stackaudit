
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

    // The `website` field is hidden in the UI via CSS (not display:none).
    // If it contains any value, this is a bot submission — reject silently.
    if (body.website) {
      return NextResponse.json({ success: true });
    }

    const email = body.email?.trim().toLowerCase();
    if (!email || !email.includes("@") || !body.reportId) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const leadResult = await submitLead(
      email,
      body.reportId,
      (body.source as "report_cta" | "report_export") ?? "report_cta"
    );

    if (leadResult.success && body.reportUrl) {
      sendAuditEmail({
        to: email,
        reportId: body.reportId,
        reportUrl: body.reportUrl,
        estimatedSavings: body.estimatedSavings ?? 0,
        totalSpend: body.totalSpend ?? 0,
        score: body.score ?? 0,
      }).catch(() => {});
    }

    return NextResponse.json({ success: leadResult.success });
  } catch {
    return NextResponse.json(
      { error: "Internal error" },
      { status: 500 }
    );
  }
}
