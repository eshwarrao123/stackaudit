import { AuditInputSchema } from "./schemas/audit";

export const demoDatasets: Record<string, AuditInputSchema> = {
  startupEngineering: {
    teamSize: 12,
    companyStage: "seed",
    primaryUseCase: "engineering",
    tools: [
      { toolId: "chatgpt", monthlySpend: 240, seats: 12, usageFrequency: "daily", usedFor: ["code-gen", "debugging"] },
      { toolId: "claude", monthlySpend: 240, seats: 12, usageFrequency: "occasional", usedFor: ["code-gen", "research"] },
      { toolId: "cursor", monthlySpend: 240, seats: 12, usageFrequency: "daily", usedFor: ["code-gen"] },
      { toolId: "copilot", monthlySpend: 228, seats: 12, usageFrequency: "rare", usedFor: ["code-gen"] },
      { toolId: "midjourney", monthlySpend: 60, seats: 2, usageFrequency: "occasional", usedFor: ["image-gen"] }
    ]
  },
  aiHeavyStartup: {
    teamSize: 5,
    companyStage: "pre-seed",
    primaryUseCase: "product",
    tools: [
      { toolId: "chatgpt", monthlySpend: 100, seats: 5, usageFrequency: "daily", usedFor: ["code-gen", "content-writing"] },
      { toolId: "claude", monthlySpend: 100, seats: 5, usageFrequency: "daily", usedFor: ["code-review", "documentation"] },
      { toolId: "openai-api", monthlySpend: 500, seats: 1, usageFrequency: "daily", usedFor: ["prototyping"] },
      { toolId: "anthropic-api", monthlySpend: 50, seats: 1, usageFrequency: "rare", usedFor: ["prototyping"] }
    ]
  },
  marketingAgency: {
    teamSize: 20,
    companyStage: "series-a",
    primaryUseCase: "marketing",
    tools: [
      { toolId: "chatgpt", monthlySpend: 400, seats: 20, usageFrequency: "daily", usedFor: ["content-writing", "research"] },
      { toolId: "jasper", monthlySpend: 800, seats: 10, usageFrequency: "occasional", usedFor: ["content-writing"] },
      { toolId: "midjourney", monthlySpend: 300, seats: 10, usageFrequency: "daily", usedFor: ["image-gen"] },
      { toolId: "runway", monthlySpend: 150, seats: 5, usageFrequency: "occasional", usedFor: ["image-gen"] }
    ]
  }
};
