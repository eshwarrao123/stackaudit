import type { ToolId } from "../engine/types";

export const pricingVersion = "2026-05-20-v1";

export type ToolPricing = {
  /** Typical per-seat cost at the most common paid tier (USD/month) */
  typicalSeatCost: number;
};

export type PricingSnapshot = {
  version: string;
  prices: Record<ToolId, ToolPricing>;
};

export const CURRENT_PRICING: Record<ToolId, ToolPricing> = {
  "chatgpt": { typicalSeatCost: 20 },
  "claude": { typicalSeatCost: 20 },
  "cursor": { typicalSeatCost: 20 },
  "copilot": { typicalSeatCost: 19 },
  "gemini": { typicalSeatCost: 20 },
  "openai-api": { typicalSeatCost: 0 },
  "anthropic-api": { typicalSeatCost: 0 },
  "midjourney": { typicalSeatCost: 30 },
  "perplexity": { typicalSeatCost: 20 },
  "notion-ai": { typicalSeatCost: 10 },
  "grammarly": { typicalSeatCost: 25 },
  "jasper": { typicalSeatCost: 49 },
  "runway": { typicalSeatCost: 35 },
};

export const createPricingSnapshot = (): PricingSnapshot => ({
  version: pricingVersion,
  prices: { ...CURRENT_PRICING },
});
