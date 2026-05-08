import type { AuditInput, Recommendation, ToolEntry } from "./types";
import { FREQUENCY_WEIGHT, TOOLS } from "../constants";

// ─────────────────────────────────────────────
// Rule Engine
//
// Each Rule is a pure function: (AuditInput) → Recommendation | null
// Rules are composable, independently testable, and easy to add.
// ─────────────────────────────────────────────

export interface Rule {
  id: string;
  check: (input: AuditInput) => Recommendation | null;
}

// ─── Helpers ─────────────────────────────────

function findTool(input: AuditInput, toolId: string): ToolEntry | undefined {
  return input.tools.find((t) => t.toolId === toolId);
}

function utilizationScore(entry: ToolEntry): number {
  const freqWeight = FREQUENCY_WEIGHT[entry.usageFrequency] ?? 0.1;
  const useCaseCoverage = Math.min(entry.usedFor.length / 3, 1); // 3 use cases = full coverage
  return Math.round((freqWeight * 0.7 + useCaseCoverage * 0.3) * 100);
}

function lowerUtilization(a: ToolEntry, b: ToolEntry): ToolEntry {
  return utilizationScore(a) <= utilizationScore(b) ? a : b;
}

// ─── Rules ───────────────────────────────────

const RULES: Rule[] = [
  // ── R01: ChatGPT + Claude overlap ────────────
  {
    id: "R01_chatgpt_claude_overlap",
    check: (input) => {
      const chatgpt = findTool(input, "chatgpt");
      const claude = findTool(input, "claude");
      if (!chatgpt || !claude) return null;

      const weaker = lowerUtilization(chatgpt, claude);
      const saving = weaker.monthlySpend * 0.9; // can eliminate ~90% cost

      return {
        id: crypto.randomUUID(),
        ruleId: "R01_chatgpt_claude_overlap",
        type: "consolidate",
        severity: "critical",
        title: "ChatGPT & Claude Overlap",
        description:
          `You're paying for two general-purpose AI assistants with nearly identical capabilities. ` +
          `Pick the one your team prefers and cancel the other. This is the most common waste we see.`,
        estimatedMonthlySaving: saving,
        affectedToolIds: ["chatgpt", "claude"],
        actionLabel: `Cancel ${TOOLS[weaker.toolId].name}`,
      };
    },
  },

  // ── R02: Cursor + Copilot overlap ────────────
  {
    id: "R02_cursor_copilot_overlap",
    check: (input) => {
      const cursor = findTool(input, "cursor");
      const copilot = findTool(input, "copilot");
      if (!cursor || !copilot) return null;

      const weaker = lowerUtilization(cursor, copilot);
      const saving = weaker.monthlySpend;

      return {
        id: crypto.randomUUID(),
        ruleId: "R02_cursor_copilot_overlap",
        type: "consolidate",
        severity: "critical",
        title: "Cursor & GitHub Copilot Overlap",
        description:
          "Both are AI code editors targeting the same workflow. Cursor includes a Copilot-like chat " +
          "and inline completions. Running both is redundant and expensive for engineering teams.",
        estimatedMonthlySaving: saving,
        affectedToolIds: ["cursor", "copilot"],
        actionLabel: `Cancel ${TOOLS[weaker.toolId].name}`,
      };
    },
  },

  // ── R03: Rare usage — any tool ────────────────
  {
    id: "R03_rare_usage_waste",
    check: (input) => {
      const rareTools = input.tools.filter(
        (t) => t.usageFrequency === "rare" && t.monthlySpend > 20
      );
      if (rareTools.length === 0) return null;

      const totalSaving = rareTools.reduce((sum, t) => sum + t.monthlySpend, 0);
      const names = rareTools.map((t) => TOOLS[t.toolId].name).join(", ");

      return {
        id: crypto.randomUUID(),
        ruleId: "R03_rare_usage_waste",
        type: "eliminate",
        severity: "critical",
        title: "Paying for Rarely Used Tools",
        description:
          `${names} ${rareTools.length === 1 ? "is" : "are"} used rarely but still incurring monthly costs. ` +
          `Cancel and switch to free tiers or pay-as-you-go alternatives.`,
        estimatedMonthlySaving: totalSaving * 0.85,
        affectedToolIds: rareTools.map((t) => t.toolId),
        actionLabel: "Cancel unused subscriptions",
      };
    },
  },

  // ── R04: Seat count vs. team size ────────────
  {
    id: "R04_excess_seats",
    check: (input) => {
      const overprovisionedTools = input.tools.filter(
        (t) => t.seats > input.teamSize * 1.2 // more than 20% over team size
      );
      if (overprovisionedTools.length === 0) return null;

      const totalSaving = overprovisionedTools.reduce((sum, t) => {
        const excessSeats = t.seats - input.teamSize;
        const costPerSeat = t.monthlySpend / t.seats;
        return sum + excessSeats * costPerSeat;
      }, 0);

      const names = overprovisionedTools.map((t) => TOOLS[t.toolId].name).join(", ");

      return {
        id: crypto.randomUUID(),
        ruleId: "R04_excess_seats",
        type: "optimize",
        severity: "warning",
        title: "Over-Provisioned Seats",
        description:
          `${names} ${overprovisionedTools.length === 1 ? "has" : "have"} more licensed seats than your team size of ${input.teamSize}. ` +
          `Reduce to active users to eliminate wasted spend.`,
        estimatedMonthlySaving: totalSaving,
        affectedToolIds: overprovisionedTools.map((t) => t.toolId),
        actionLabel: "Reduce seat count",
      };
    },
  },

  // ── R05: Jasper + ChatGPT/Claude overlap ─────
  {
    id: "R05_jasper_llm_overlap",
    check: (input) => {
      const jasper = findTool(input, "jasper");
      const hasGeneralLLM =
        findTool(input, "chatgpt") || findTool(input, "claude") || findTool(input, "gemini");
      if (!jasper || !hasGeneralLLM) return null;

      return {
        id: crypto.randomUUID(),
        ruleId: "R05_jasper_llm_overlap",
        type: "eliminate",
        severity: "critical",
        title: "Jasper Redundant with Your LLM Subscriptions",
        description:
          "Jasper charges a premium for marketing copy generation, but ChatGPT, Claude, and Gemini " +
          "can do the same with a good prompt. With a general LLM subscription, Jasper is unnecessary overhead.",
        estimatedMonthlySaving: jasper.monthlySpend * 0.9,
        affectedToolIds: ["jasper"],
        actionLabel: "Cancel Jasper",
      };
    },
  },

  // ── R06: OpenAI API + ChatGPT for same use case
  {
    id: "R06_openai_api_plus_chatgpt",
    check: (input) => {
      const api = findTool(input, "openai-api");
      const chatgpt = findTool(input, "chatgpt");
      if (!api || !chatgpt) return null;

      // Only flag if ChatGPT is used for research/writing (not code) — API covers that
      const chatgptUsedForNonCode = chatgpt.usedFor.some((u) =>
        ["research", "content-writing", "data-analysis"].includes(u)
      );
      if (!chatgptUsedForNonCode) return null;

      return {
        id: crypto.randomUUID(),
        ruleId: "R06_openai_api_plus_chatgpt",
        type: "consolidate",
        severity: "warning",
        title: "OpenAI API & ChatGPT Overlap",
        description:
          "If you already have OpenAI API access for your app, your team can use it directly " +
          "via a lightweight wrapper (like ChatGPT-in-Slack bots or internal tools) instead of " +
          "paying extra ChatGPT Plus seats.",
        estimatedMonthlySaving: chatgpt.monthlySpend * 0.6,
        affectedToolIds: ["chatgpt", "openai-api"],
        actionLabel: "Consolidate to API access",
      };
    },
  },

  // ── R07: Grammarly + Notion AI + LLM overlap ─
  {
    id: "R07_writing_tool_overlap",
    check: (input) => {
      const grammarly = findTool(input, "grammarly");
      const notionAi = findTool(input, "notion-ai");
      if (!grammarly || !notionAi) return null;

      const weaker = lowerUtilization(grammarly, notionAi);
      return {
        id: crypto.randomUUID(),
        ruleId: "R07_writing_tool_overlap",
        type: "consolidate",
        severity: "warning",
        title: "Grammarly & Notion AI Overlap",
        description:
          "Both tools offer AI writing assistance. Notion AI handles docs and writing improvement " +
          "within your workspace. Grammarly Business on top adds limited extra value for most teams.",
        estimatedMonthlySaving: weaker.monthlySpend * 0.85,
        affectedToolIds: ["grammarly", "notion-ai"],
        actionLabel: `Downgrade or cancel ${TOOLS[weaker.toolId].name}`,
      };
    },
  },

  // ── R08: Low utilization across all tools ────
  {
    id: "R08_low_utilization",
    check: (input) => {
      const lowUtilTools = input.tools.filter(
        (t) =>
          utilizationScore(t) < 30 &&
          t.usageFrequency === "occasional" &&
          t.monthlySpend > 30
      );
      if (lowUtilTools.length === 0) return null;

      const totalSaving = lowUtilTools.reduce((sum, t) => sum + t.monthlySpend * 0.7, 0);
      const names = lowUtilTools.map((t) => TOOLS[t.toolId].name).join(", ");

      return {
        id: crypto.randomUUID(),
        ruleId: "R08_low_utilization",
        type: "downgrade",
        severity: "warning",
        title: "Low-Utilization Tools",
        description:
          `${names} ${lowUtilTools.length === 1 ? "is" : "are"} used only occasionally. ` +
          "Consider downgrading to a free or lower-tier plan, or switch to pay-as-you-go API access.",
        estimatedMonthlySaving: totalSaving,
        affectedToolIds: lowUtilTools.map((t) => t.toolId),
        actionLabel: "Downgrade to free tier",
      };
    },
  },

  // ── R09: Midjourney + Runway overlap ─────────
  {
    id: "R09_image_tool_overlap",
    check: (input) => {
      const midjourney = findTool(input, "midjourney");
      const runway = findTool(input, "runway");
      if (!midjourney || !runway) return null;

      const weaker = lowerUtilization(midjourney, runway);
      return {
        id: crypto.randomUUID(),
        ruleId: "R09_image_tool_overlap",
        type: "consolidate",
        severity: "warning",
        title: "Midjourney & Runway Overlap",
        description:
          "Both cover AI image generation. Unless your team specifically needs Runway's video features, " +
          "Midjourney alone typically covers image generation needs at a lower cost.",
        estimatedMonthlySaving: weaker.monthlySpend * 0.85,
        affectedToolIds: ["midjourney", "runway"],
        actionLabel: `Cancel ${TOOLS[weaker.toolId].name}`,
      };
    },
  },

  // ── R10: Pre-seed spending >$500/mo on AI tools
  {
    id: "R10_stage_spend_mismatch",
    check: (input) => {
      if (input.companyStage !== "pre-seed") return null;
      const total = input.tools.reduce((sum, t) => sum + t.monthlySpend, 0);
      if (total < 500) return null;

      return {
        id: crypto.randomUUID(),
        ruleId: "R10_stage_spend_mismatch",
        type: "optimize",
        severity: "warning",
        title: "High AI Spend for Pre-Seed Stage",
        description:
          `At pre-seed with $${total.toFixed(0)}/mo in AI spend, you're likely over-tooled. ` +
          "Free tiers and one consolidated subscription is usually sufficient until product-market fit.",
        estimatedMonthlySaving: total * 0.4,
        affectedToolIds: input.tools.map((t) => t.toolId),
        actionLabel: "Audit each subscription",
      };
    },
  },

  // ── R11: Perplexity redundant with existing LLM
  {
    id: "R11_perplexity_redundant",
    check: (input) => {
      const perplexity = findTool(input, "perplexity");
      const hasLLM =
        findTool(input, "chatgpt") || findTool(input, "claude") || findTool(input, "gemini");
      if (!perplexity || !hasLLM) return null;

      return {
        id: crypto.randomUUID(),
        ruleId: "R11_perplexity_redundant",
        type: "eliminate",
        severity: "info",
        title: "Perplexity Pro May Be Redundant",
        description:
          "With ChatGPT, Claude, or Gemini already subscribed, Perplexity's web-search capabilities " +
          "are largely covered (ChatGPT Browse, Gemini with Search). The Pro plan is likely unnecessary.",
        estimatedMonthlySaving: perplexity.monthlySpend * 0.9,
        affectedToolIds: ["perplexity"],
        actionLabel: "Downgrade to Perplexity free",
      };
    },
  },
];

export default RULES;
