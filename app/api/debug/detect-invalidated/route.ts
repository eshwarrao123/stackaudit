import { NextResponse } from "next/server";
import { detectInvalidatedAudits } from "@/lib/re-audit/detect-invalidated-audits";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const notifications = await detectInvalidatedAudits();

    return NextResponse.json(
      {
        success: true,
        count: notifications.length,
        notifications,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Debug Route] detectInvalidatedAudits failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: String(error),
      },
      { status: 500 }
    );
  }
}
