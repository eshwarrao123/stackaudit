"use client";

import { cn } from "@/lib/utils";
import { TOOLS } from "@/lib/constants";
import type { ToolId } from "@/lib/engine/types";
import { Check } from "lucide-react";

const CATEGORY_CONFIG: Record<string, { label: string; order: number }> = {
  assistant: { label: "AI Assistants", order: 0 },
  code:      { label: "Code Tools",   order: 1 },
  writing:   { label: "Writing",      order: 2 },
  image:     { label: "Image & Video",order: 3 },
  search:    { label: "Research",     order: 4 },
};

const TOOL_ICONS: Record<ToolId, string> = {
  "chatgpt":       "🤖",
  "claude":        "🧠",
  "cursor":        "⚡",
  "copilot":       "🐙",
  "gemini":        "✨",
  "openai-api":    "🔌",
  "anthropic-api": "🔌",
  "midjourney":    "🎨",
  "perplexity":    "🔍",
  "notion-ai":     "📝",
  "grammarly":     "✍️",
  "jasper":        "🚀",
  "runway":        "🎬",
};

interface ToolSelectorProps {
  selected: ToolId[];
  onChange: (selected: ToolId[]) => void;
  error?: string;
}

export function ToolSelector({ selected, onChange, error }: ToolSelectorProps) {
  const toggle = (toolId: ToolId) => {
    onChange(
      selected.includes(toolId)
        ? selected.filter((id) => id !== toolId)
        : [...selected, toolId]
    );
  };

  const grouped = Object.values(TOOLS).reduce<Record<string, typeof TOOLS[ToolId][]>>(
    (acc, tool) => {
      if (!acc[tool.category]) acc[tool.category] = [];
      acc[tool.category].push(tool);
      return acc;
    },
    {}
  );

  const sortedCategories = Object.keys(CATEGORY_CONFIG).sort(
    (a, b) => CATEGORY_CONFIG[a].order - CATEGORY_CONFIG[b].order
  );

  return (
    <div className="space-y-7">
      {sortedCategories.map((category) => {
        const tools = grouped[category];
        if (!tools?.length) return null;

        return (
          <div key={category} className="space-y-2.5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-white/35">
              {CATEGORY_CONFIG[category].label}
            </p>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {tools.map((tool) => {
                const isSelected = selected.includes(tool.id);
                return (
                  <button
                    key={tool.id}
                    type="button"
                    id={`tool-${tool.id}`}
                    onClick={() => toggle(tool.id)}
                    aria-pressed={isSelected}
                    className={cn(
                      "group relative flex flex-col items-start gap-3 rounded-xl border p-4 text-left",
                      "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50",
                      isSelected
                        ? "border-indigo-500/40 bg-indigo-500/[0.06] shadow-[0_0_20px_rgba(99,102,241,0.08)] ring-1 ring-indigo-500/20"
                        : "border-white/[0.07] bg-[#1f1f27] hover:border-white/[0.14] hover:bg-white/[0.04]"
                    )}
                  >
                    <span
                      className={cn(
                        "absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full transition-all duration-200",
                        isSelected
                          ? "bg-indigo-500 text-white opacity-100 scale-100"
                          : "bg-white/[0.08] text-transparent opacity-0 scale-75"
                      )}
                    >
                      <Check className="h-2.5 w-2.5" strokeWidth={3} />
                    </span>

                    {/* Icon container */}
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg border text-xl transition-all duration-200",
                        isSelected
                          ? "border-indigo-500/25 bg-indigo-500/10"
                          : "border-white/[0.08] bg-white/[0.04] group-hover:border-white/[0.12] group-hover:bg-white/[0.06]"
                      )}
                    >
                      <span role="img" aria-hidden>{TOOL_ICONS[tool.id]}</span>
                    </div>

                    {/* Name + vendor */}
                    <div className="space-y-0.5 pr-5">
                      <p className={cn(
                        "text-sm font-semibold leading-none",
                        isSelected ? "text-white/95" : "text-white/75"
                      )}>
                        {tool.name}
                      </p>
                      <p className="text-[11px] text-white/35">{tool.vendor}</p>
                    </div>

                    {/* Price hint */}
                    {tool.typicalSeatCost > 0 && (
                      <p className="text-[10px] text-white/25">
                        ~${tool.typicalSeatCost}/seat
                      </p>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Validation error */}
      {error && (
        <p className="text-xs text-red-400">{error}</p>
      )}

      {/* Selection count */}
      {selected.length > 0 && (
        <p className="text-xs text-white/35">
          <span className="font-semibold text-white/70">{selected.length}</span>{" "}
          {selected.length === 1 ? "tool" : "tools"} selected
        </p>
      )}
    </div>
  );
}
