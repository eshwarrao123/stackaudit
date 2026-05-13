
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
  } catch {
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}
