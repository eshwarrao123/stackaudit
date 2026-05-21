import type { ToolId, UseCase } from "./engine/types";
import { CURRENT_PRICING } from "./pricing/current-pricing";

// ─────────────────────────────────────────────
// Tool Metadata & Reference Pricing
// ─────────────────────────────────────────────

export interface ToolMeta {
  id: ToolId;
  name: string;
  category: "assistant" | "code" | "image" | "writing" | "search";
  /** Typical per-seat cost at the most common paid tier (USD/month) */
  typicalSeatCost: number;
  /** Primary functional capabilities */
  capabilities: UseCase[];
  /** URL slug for logo in /public/tools/{slug}.svg */
  logoSlug: string;
  vendor: string;
}

export const TOOLS: Record<ToolId, ToolMeta> = {
  "chatgpt": {
    id: "chatgpt",
    name: "ChatGPT Plus",
    category: "assistant",
    typicalSeatCost: CURRENT_PRICING["chatgpt"].typicalSeatCost,
    capabilities: ["content-writing", "research", "documentation", "data-analysis", "code-gen"],
    logoSlug: "chatgpt",
    vendor: "OpenAI",
  },
  "claude": {
    id: "claude",
    name: "Claude Pro",
    category: "assistant",
    typicalSeatCost: CURRENT_PRICING["claude"].typicalSeatCost,
    capabilities: ["content-writing", "research", "documentation", "code-gen", "data-analysis"],
    logoSlug: "claude",
    vendor: "Anthropic",
  },
  "cursor": {
    id: "cursor",
    name: "Cursor",
    category: "code",
    typicalSeatCost: CURRENT_PRICING["cursor"].typicalSeatCost,
    capabilities: ["code-gen", "debugging", "code-review", "documentation"],
    logoSlug: "cursor",
    vendor: "Anysphere",
  },
  "copilot": {
    id: "copilot",
    name: "GitHub Copilot",
    category: "code",
    typicalSeatCost: CURRENT_PRICING["copilot"].typicalSeatCost,
    capabilities: ["code-gen", "debugging", "code-review"],
    logoSlug: "copilot",
    vendor: "GitHub",
  },
  "gemini": {
    id: "gemini",
    name: "Gemini Advanced",
    category: "assistant",
    typicalSeatCost: CURRENT_PRICING["gemini"].typicalSeatCost,
    capabilities: ["content-writing", "research", "data-analysis", "code-gen"],
    logoSlug: "gemini",
    vendor: "Google",
  },
  "openai-api": {
    id: "openai-api",
    name: "OpenAI API",
    category: "assistant",
    typicalSeatCost: CURRENT_PRICING["openai-api"].typicalSeatCost, // pay-as-you-go; spend entered directly
    capabilities: ["code-gen", "data-analysis", "prototyping", "customer-support"],
    logoSlug: "openai",
    vendor: "OpenAI",
  },
  "anthropic-api": {
    id: "anthropic-api",
    name: "Anthropic API",
    category: "assistant",
    typicalSeatCost: CURRENT_PRICING["anthropic-api"].typicalSeatCost,
    capabilities: ["code-gen", "data-analysis", "prototyping", "customer-support"],
    logoSlug: "anthropic",
    vendor: "Anthropic",
  },
  "midjourney": {
    id: "midjourney",
    name: "Midjourney",
    category: "image",
    typicalSeatCost: CURRENT_PRICING["midjourney"].typicalSeatCost,
    capabilities: ["image-gen", "prototyping"],
    logoSlug: "midjourney",
    vendor: "Midjourney",
  },
  "perplexity": {
    id: "perplexity",
    name: "Perplexity Pro",
    category: "search",
    typicalSeatCost: CURRENT_PRICING["perplexity"].typicalSeatCost,
    capabilities: ["research"],
    logoSlug: "perplexity",
    vendor: "Perplexity AI",
  },
  "notion-ai": {
    id: "notion-ai",
    name: "Notion AI",
    category: "writing",
    typicalSeatCost: CURRENT_PRICING["notion-ai"].typicalSeatCost,
    capabilities: ["documentation", "content-writing"],
    logoSlug: "notion",
    vendor: "Notion",
  },
  "grammarly": {
    id: "grammarly",
    name: "Grammarly Business",
    category: "writing",
    typicalSeatCost: CURRENT_PRICING["grammarly"].typicalSeatCost,
    capabilities: ["content-writing", "documentation"],
    logoSlug: "grammarly",
    vendor: "Grammarly",
  },
  "jasper": {
    id: "jasper",
    name: "Jasper",
    category: "writing",
    typicalSeatCost: CURRENT_PRICING["jasper"].typicalSeatCost,
    capabilities: ["content-writing"],
    logoSlug: "jasper",
    vendor: "Jasper AI",
  },
  "runway": {
    id: "runway",
    name: "Runway",
    category: "image",
    typicalSeatCost: CURRENT_PRICING["runway"].typicalSeatCost,
    capabilities: ["image-gen", "prototyping"],
    logoSlug: "runway",
    vendor: "Runway",
  },
};

// ─── Usage Frequency Weights ──────────────────
// Used to calculate utilization score

export const FREQUENCY_WEIGHT: Record<string, number> = {
  daily: 1.0,
  weekly: 0.6,
  occasional: 0.3,
  rare: 0.1,
};

// ─── Utilization thresholds ───────────────────

/** Below this score → tool is under-utilized */
export const LOW_UTILIZATION_THRESHOLD = 40;
/** Monthly spend above this warrants closer scrutiny */
export const HIGH_SPEND_THRESHOLD = 200;
/** Spend-per-seat above this is considered expensive */
export const HIGH_COST_PER_SEAT_THRESHOLD = 30;
