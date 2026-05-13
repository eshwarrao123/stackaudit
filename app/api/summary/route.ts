// ─────────────────────────────────────────────────────────────────────────────
// API Route: POST /api/summary
//
// Accepts a FullAuditReport, generates an AI summary server-side
// (so OPENAI_API_KEY is never exposed to the client), and returns it.
//
// Called by the report page after the report loads.
// ─────────────────────────────────────────────────────────────────────────────

import { NextRequest, NextResponse } from "next/server";
import { generateAuditSummary } from "@/lib/ai/generate-summary";
import type { FullAuditReport } from "@/lib/audit-engine/types";

export async function POST(req: NextRequest) {
  try {
    const report = (await req.json()) as FullAuditReport;

    if (!report?.id || !report?.input) {
      return NextResponse.json(
        { error: "Invalid report payload" },
        { status: 400 }
      );
    }

    const result = await generateAuditSummary(report);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[StackAudit] /api/summary error:", err);
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
