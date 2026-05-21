import type { AffectedAudit, GroupedUserNotifications } from "./types";

/**
 * Consolidates multiple affected audits into a single structured payload per user email.
 * Ignores any audits that do not have an associated user email.
 */
export function groupNotifications(affectedAudits: AffectedAudit[]): GroupedUserNotifications[] {
  const groups = new Map<string, AffectedAudit[]>();

  for (const affected of affectedAudits) {
    const email = affected.auditDiff.oldReport.userEmail;
    
    // Ignore audits without a user email attached
    if (!email) continue;

    if (!groups.has(email)) {
      groups.set(email, []);
    }
    groups.get(email)!.push(affected);
  }

  const result: GroupedUserNotifications[] = [];
  for (const [userEmail, audits] of groups.entries()) {
    result.push({
      userEmail,
      affectedAudits: audits,
    });
  }

  return result;
}
