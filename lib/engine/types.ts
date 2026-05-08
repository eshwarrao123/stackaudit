// ─────────────────────────────────────────────
// Audit Engine — Core Types
// ─────────────────────────────────────────────

export type ToolId =
  | "chatgpt"
  | "claude"
  | "cursor"
  | "copilot"
  | "gemini"
  | "openai-api"
  | "anthropic-api"
  | "midjourney"
  | "perplexity"
  | "notion-ai"
  | "grammarly"
  | "jasper"
  | "runway";

export type UsageFrequency = "daily" | "weekly" | "occasional" | "rare";

export type UseCase =
  | "code-gen"
  | "debugging"
  | "code-review"
  | "documentation"
  | "content-writing"
  | "image-gen"
  | "research"
  | "customer-support"
  | "data-analysis"
  | "prototyping";

export type CompanyStage =
  | "pre-seed"
  | "seed"
  | "series-a"
  | "series-b-plus";

export type PrimaryUseCase =
  | "engineering"
  | "product"
  | "marketing"
  | "support"
  | "mixed";

// ─── Audit Input ─────────────────────────────

export interface ToolEntry {
  toolId: ToolId;
  monthlySpend: number;       // USD/month
  seats: number;              // number of licensed seats
  usageFrequency: UsageFrequency;
  usedFor: UseCase[];
}

export interface AuditInput {
  tools: ToolEntry[];
  teamSize: number;
  companyStage: CompanyStage;
  primaryUseCase: PrimaryUseCase;
}

// ─── Audit Output ────────────────────────────

export type RecommendationType =
  | "eliminate"    // Stop paying for this entirely
  | "downgrade"    // Switch to a cheaper plan/tier
  | "consolidate"  // Merge two overlapping tools into one
  | "optimize"     // Reduce seats or renegotiate
  | "keep";        // Tool is well-utilized — no action needed

export type Severity = "critical" | "warning" | "info";

export interface Recommendation {
  id: string;
  ruleId: string;
  type: RecommendationType;
  severity: Severity;
  title: string;
  description: string;
  estimatedMonthlySaving: number;
  affectedToolIds: ToolId[];
  actionLabel: string;        // Short CTA, e.g. "Cancel subscription"
}

export interface ToolAnalysis {
  toolId: ToolId;
  monthlySpend: number;
  seats: number;
  utilizationScore: number;   // 0–100 (higher = better utilized)
  costPerSeat: number;
  verdict: RecommendationType;
}

export interface AuditReport {
  id: string;
  score: number;              // 0–100 (higher = more optimized)
  totalMonthlySpend: number;
  estimatedMonthlySavings: number;
  recommendations: Recommendation[];
  toolBreakdown: ToolAnalysis[];
  input: AuditInput;          // Stored for re-running or debugging
  createdAt: string;
}
