import type { ToolId } from "../engine/types";
import type { PricingSnapshot } from "../pricing/current-pricing";
import { CURRENT_PRICING } from "../pricing/current-pricing";
import type { PricingChange } from "./types";

/**
 * Compares a stored pricing snapshot against the CURRENT_PRICING source of truth
 * and returns an array of structural pricing changes.
 */
export function detectPricingChanges(storedSnapshot: PricingSnapshot): PricingChange[] {
  const changes: PricingChange[] = [];
  const storedPrices = storedSnapshot.prices;

  // Detect changed or removed tools
  for (const toolId of Object.keys(storedPrices) as ToolId[]) {
    const oldPrice = storedPrices[toolId].typicalSeatCost;
    const currentToolInfo = CURRENT_PRICING[toolId];

    if (!currentToolInfo) {
      changes.push({
        toolId,
        oldPrice,
        newPrice: 0,
        type: "removed",
      });
      continue;
    }

    const newPrice = currentToolInfo.typicalSeatCost;
    if (oldPrice !== newPrice) {
      changes.push({
        toolId,
        oldPrice,
        newPrice,
        type: "changed",
      });
    }
  }

  // Detect added tools
  for (const toolId of Object.keys(CURRENT_PRICING) as ToolId[]) {
    if (!storedPrices[toolId]) {
      changes.push({
        toolId,
        oldPrice: 0,
        newPrice: CURRENT_PRICING[toolId].typicalSeatCost,
        type: "added",
      });
    }
  }

  return changes;
}
