import { AuditRecommendation, OverlapInsight, RuleContext } from "./types";

export function checkLLMOverlap(context: RuleContext): { rec: AuditRecommendation | null, overlap: OverlapInsight | null } {
  const hasChatGPT = context.toolMap.has("chatgpt");
  const hasClaude = context.toolMap.has("claude");
  
  if (hasChatGPT && hasClaude) {
    const chatgpt = context.toolMap.get("chatgpt")!;
    const claude = context.toolMap.get("claude")!;
    
    const waste = Math.min(chatgpt.monthlySpend, claude.monthlySpend);
    
    return {
      rec: {
        id: "overlap-llm",
        severity: "high",
        title: "Redundant General LLMs",
        description: "Both ChatGPT and Claude are being licensed, causing overlapping capabilities.",
        estimatedSavings: waste,
        confidence: 90,
        action: chatgpt.monthlySpend > claude.monthlySpend ? "Consolidate to ChatGPT" : "Consolidate to Claude",
        category: "Redundancy"
      },
      overlap: {
        tools: ["chatgpt", "claude"],
        overlapPercentage: 85,
        wasteEstimate: waste,
        description: "High capability overlap between leading general-purpose LLMs."
      }
    };
  }
  return { rec: null, overlap: null };
}

export function checkCodingAssistantOverlap(context: RuleContext): { rec: AuditRecommendation | null, overlap: OverlapInsight | null } {
  const hasCursor = context.toolMap.has("cursor");
  const hasCopilot = context.toolMap.has("copilot");
  
  if (hasCursor && hasCopilot) {
    const cursor = context.toolMap.get("cursor")!;
    const copilot = context.toolMap.get("copilot")!;
    
    const waste = Math.min(cursor.monthlySpend, copilot.monthlySpend);
    
    return {
      rec: {
        id: "overlap-coding",
        severity: "critical",
        title: "Duplicate Coding Assistants",
        description: "Paying for both Cursor and GitHub Copilot for the same developers.",
        estimatedSavings: waste,
        confidence: 95,
        action: "Standardize on Cursor",
        category: "Redundancy"
      },
      overlap: {
        tools: ["cursor", "copilot"],
        overlapPercentage: 92,
        wasteEstimate: waste,
        description: "Nearly identical code completion and generation capabilities."
      }
    };
  }
  return { rec: null, overlap: null };
}

export function checkImageGenOverlap(context: RuleContext): { rec: AuditRecommendation | null, overlap: OverlapInsight | null } {
  const hasMidjourney = context.toolMap.has("midjourney");
  const hasRunway = context.toolMap.has("runway");
  
  if (hasMidjourney && hasRunway) {
    const mj = context.toolMap.get("midjourney")!;
    const runway = context.toolMap.get("runway")!;
    
    const waste = Math.min(mj.monthlySpend, runway.monthlySpend);
    
    return {
      rec: {
        id: "overlap-image",
        severity: "medium",
        title: "Duplicate Creative AI",
        description: "Multiple specialized media generation tools found.",
        estimatedSavings: waste,
        confidence: 75,
        action: "Consolidate to a single creative suite",
        category: "Redundancy"
      },
      overlap: {
        tools: ["midjourney", "runway"],
        overlapPercentage: 60,
        wasteEstimate: waste,
        description: "Overlapping visual generation use-cases."
      }
    };
  }
  return { rec: null, overlap: null };
}

export function checkExcessSeats(context: RuleContext): AuditRecommendation[] {
  const recs: AuditRecommendation[] = [];
  
  context.input.tools.forEach(tool => {
    if (tool.seats > context.input.teamSize) {
      const excessSeats = tool.seats - context.input.teamSize;
      const costPerSeat = tool.monthlySpend / tool.seats;
      const waste = excessSeats * costPerSeat;
      
      recs.push({
        id: `excess-seats-${tool.toolId}`,
        severity: "critical",
        title: `Excess Seats for ${tool.toolId}`,
        description: `You are paying for ${tool.seats} seats but your team size is only ${context.input.teamSize}.`,
        estimatedSavings: Math.round(waste),
        confidence: 100,
        action: `Remove ${excessSeats} inactive seats`,
        category: "Underutilization"
      });
    }
  });
  
  return recs;
}

export function checkLowUsage(context: RuleContext): AuditRecommendation[] {
  const recs: AuditRecommendation[] = [];
  
  context.input.tools.forEach(tool => {
    if (tool.usageFrequency === "rare" || tool.usageFrequency === "occasional") {
      const isRare = tool.usageFrequency === "rare";
      const severity = isRare && tool.monthlySpend > 50 ? "high" : "medium";
      const savings = isRare ? tool.monthlySpend : tool.monthlySpend * 0.5;
      
      recs.push({
        id: `low-usage-${tool.toolId}`,
        severity,
        title: `Underutilized: ${tool.toolId}`,
        description: `Tool is reported as ${tool.usageFrequency}ly used but costs $${tool.monthlySpend}/mo.`,
        estimatedSavings: Math.round(savings),
        confidence: isRare ? 90 : 70,
        action: isRare ? "Cancel Subscription" : "Downgrade to cheaper tier",
        category: "Underutilization"
      });
    }
  });
  
  return recs;
}
