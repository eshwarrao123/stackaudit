import { NextResponse } from "next/server";
import { detectInvalidatedAudits } from "@/lib/re-audit/detect-invalidated-audits";
import { sendReauditEmail } from "@/lib/email/send-reaudit-email";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const groupedNotifications = await detectInvalidatedAudits();
    
    let emailsSent = 0;
    
    // Process sending in parallel
    await Promise.all(
      groupedNotifications.map(async (notification) => {
        const sent = await sendReauditEmail(notification);
        if (sent) emailsSent++;
      })
    );

    const affectedAuditsCount = groupedNotifications.reduce(
      (acc, group) => acc + group.affectedAudits.length, 
      0
    );

    return NextResponse.json(
      {
        success: true,
        affectedUsersCount: groupedNotifications.length,
        affectedAuditsCount,
        emailsSent,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[Detect Changes Endpoint] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process detect changes trigger",
      },
      { status: 500 }
    );
  }
}
