import { describe, it, expect } from "vitest";
import { detectPricingChanges } from "../../lib/re-audit/detect-pricing-changes";
import { CURRENT_PRICING, createPricingSnapshot } from "../../lib/pricing/current-pricing";
import type { ToolId } from "../../lib/engine/types";

describe("detectPricingChanges", () => {
  it("detects no changes when snapshot matches current pricing", () => {
    const snapshot = createPricingSnapshot();
    const changes = detectPricingChanges(snapshot);
    expect(changes).toHaveLength(0);
  });

  it("detects a changed price", () => {
    const snapshot = createPricingSnapshot();
    // Alter the snapshot to simulate a historic price that was cheaper
    snapshot.prices["chatgpt"].typicalSeatCost = 10;
    
    const changes = detectPricingChanges(snapshot);
    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({
      toolId: "chatgpt",
      oldPrice: 10,
      newPrice: CURRENT_PRICING["chatgpt"].typicalSeatCost,
      type: "changed"
    });
  });

  it("detects a removed tool", () => {
    const snapshot = createPricingSnapshot();
    // Add a fake tool to the snapshot that doesn't exist in CURRENT_PRICING
    snapshot.prices["fake-tool" as ToolId] = { typicalSeatCost: 50 };
    
    const changes = detectPricingChanges(snapshot);
    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({
      toolId: "fake-tool",
      oldPrice: 50,
      newPrice: 0,
      type: "removed"
    });
  });

  it("detects an added tool", () => {
    const snapshot = createPricingSnapshot();
    // Remove a tool from the snapshot to simulate it being added to CURRENT_PRICING recently
    delete (snapshot.prices as any)["claude"];
    
    const changes = detectPricingChanges(snapshot);
    expect(changes).toHaveLength(1);
    expect(changes[0]).toMatchObject({
      toolId: "claude",
      oldPrice: 0,
      newPrice: CURRENT_PRICING["claude"].typicalSeatCost,
      type: "added"
    });
  });
});
