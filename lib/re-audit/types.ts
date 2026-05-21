import type { ToolId } from "../engine/types";
import type { FullAuditReport, AuditRecommendation } from "../audit-engine/types";

export interface PricingChange {
  toolId: ToolId;
  oldPrice: number;
  newPrice: number;
  type: "changed" | "added" | "removed";
}

export interface RecommendationDiff {
  type: "added" | "removed" | "changed" | "unchanged";
  recommendationId: string;
  oldRecommendation?: AuditRecommendation;
  newRecommendation?: AuditRecommendation;
  savingsDelta: number;
}

export interface AuditDiff {
  reportId: string;
  oldReport: FullAuditReport;
  newReport: FullAuditReport;
  recommendationDiffs: RecommendationDiff[];
  scoreDelta: number;
  savingsDelta: number;
}

export interface AffectedAudit {
  auditDiff: AuditDiff;
  pricingChanges: PricingChange[];
}

export interface GroupedUserNotifications {
  userEmail: string;
  affectedAudits: AffectedAudit[];
}
