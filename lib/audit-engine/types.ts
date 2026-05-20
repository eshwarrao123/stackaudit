import { AuditInputSchema, ToolEntrySchema } from "../schemas/audit";

export type Severity = "low" | "medium" | "high" | "critical";

export interface AuditRecommendation {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  estimatedSavings: number;
  confidence: number; // 0-100
  action: string;
  category: string;
}

export interface OverlapInsight {
  tools: string[];
  overlapPercentage: number;
  wasteEstimate: number;
  description: string;
}

export interface AuditEngineResult {
  score: number; // 0-100
  monthlyWaste: number;
  totalRecoverableSavings: number;
  criticalIssueCount: number;
  recommendations: AuditRecommendation[];
  overlaps: OverlapInsight[];
  totalSpend: number;
  activeToolsCount: number;
}

import type { PricingSnapshot } from "../pricing/current-pricing";

export interface FullAuditReport extends AuditEngineResult {
  id: string;
  timestamp: string;
  input: AuditInputSchema;
  userEmail?: string;
  pricingSnapshot?: PricingSnapshot;
  pricingVersion?: string;
}

export interface RuleContext {
  input: AuditInputSchema;
  totalSpend: number;
  toolMap: Map<string, ToolEntrySchema>;
}

export type AuditRule = (context: RuleContext) => AuditRecommendation | OverlapInsight | null;
