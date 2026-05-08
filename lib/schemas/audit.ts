import { z } from "zod";

// ─────────────────────────────────────────────
// Zod Schemas — Form Validation & API Contracts
// ─────────────────────────────────────────────

export const toolIdSchema = z.enum([
  "chatgpt",
  "claude",
  "cursor",
  "copilot",
  "gemini",
  "openai-api",
  "anthropic-api",
  "midjourney",
  "perplexity",
  "notion-ai",
  "grammarly",
  "jasper",
  "runway",
]);

export const usageFrequencySchema = z.enum([
  "daily",
  "weekly",
  "occasional",
  "rare",
]);

export const useCaseSchema = z.enum([
  "code-gen",
  "debugging",
  "code-review",
  "documentation",
  "content-writing",
  "image-gen",
  "research",
  "customer-support",
  "data-analysis",
  "prototyping",
]);

export const companyStageSchema = z.enum([
  "pre-seed",
  "seed",
  "series-a",
  "series-b-plus",
]);

export const primaryUseCaseSchema = z.enum([
  "engineering",
  "product",
  "marketing",
  "support",
  "mixed",
]);

// ─── Tool Entry ───────────────────────────────

export const toolEntrySchema = z.object({
  toolId: toolIdSchema,
  monthlySpend: z
    .number({ error: "Monthly spend is required" })
    .min(0, "Spend cannot be negative")
    .max(100_000, "That spend seems unusually high — double check"),
  seats: z
    .number({ error: "Seat count is required" })
    .int("Seats must be a whole number")
    .min(1, "Must have at least 1 seat")
    .max(10_000, "Seat count seems unusually high"),
  usageFrequency: usageFrequencySchema,
  usedFor: z
    .array(useCaseSchema)
    .min(1, "Select at least one use case"),
});

// ─── Full Audit Input ─────────────────────────

export const auditInputSchema = z.object({
  tools: z
    .array(toolEntrySchema)
    .min(1, "Add at least one AI tool to audit")
    .max(20, "Too many tools — maximum 20"),
  teamSize: z
    .number({ error: "Team size is required" })
    .int()
    .min(1, "Team size must be at least 1")
    .max(10_000),
  companyStage: companyStageSchema,
  primaryUseCase: primaryUseCaseSchema,
});

// ─── Lead Capture ─────────────────────────────

export const leadCaptureSchema = z.object({
  email: z.email("Enter a valid email address"),
  name: z.string().min(1, "Name is required").max(100).optional(),
  company: z.string().max(100).optional(),
  auditId: z.string().min(1),
  source: z.string().optional(),
});

// ─── Inferred Types ───────────────────────────
// These mirror lib/engine/types.ts but derived from Zod for form use.
// Use the engine types for business logic; use these for form state.

export type AuditInputSchema = z.infer<typeof auditInputSchema>;
export type ToolEntrySchema = z.infer<typeof toolEntrySchema>;
export type LeadCaptureSchema = z.infer<typeof leadCaptureSchema>;
