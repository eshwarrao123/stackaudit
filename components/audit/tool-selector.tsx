"use client";

import { cn } from "@/lib/utils";
import { TOOLS } from "@/lib/constants";
import type { ToolId } from "@/lib/engine/types";
import { Check } from "lucide-react";

// ─────────────────────────────────────────────
// ToolSelector
//
// Grid of AI tool cards. Selected tools are
// highlighted. Toggling a card adds/removes
// the toolId from the selection array.
// ─────────────────────────────────────────────

// Category display labels
const CATEGORY_LABELS: Record<string, string> = {
  assistant: "AI Assistants",
  code: "Code Tools",
  writing: "Writing",
  image: "Image & Video",
  search: "Research",
};

// Tool emoji icons (no external image dependency at this stage)
const TOOL_ICONS: Record<ToolId, string> = {
  "chatgpt": "🤖",
  "claude": "🧠",
  "cursor": "⚡",
  "copilot": "🐙",
  "gemini": "✨",
  "openai-api": "🔌",
  "anthropic-api": "🔌",
  "midjourney": "🎨",
  "perplexity": "🔍",
  "notion-ai": "📝",
  "grammarly": "✍️",
  "jasper": "🚀",
  "runway": "🎬",
};

interface ToolSelectorProps {
  selected: ToolId[];
  onChange: (selected: ToolId[]) => void;
  error?: string;
}

export function ToolSelector({ selected, onChange, error }: ToolSelectorProps) {
  const toggle = (toolId: ToolId) => {
    if (selected.includes(toolId)) {
      onChange(selected.filter((id) => id !== toolId));
    } else {
      onChange([...selected, toolId]);
    }
  };

  // Group tools by category
  const grouped = Object.values(TOOLS).reduce<Record<string, typeof TOOLS[ToolId][]>>(
    (acc, tool) => {
      if (!acc[tool.category]) acc[tool.category] = [];
      acc[tool.category].push(tool);
      return acc;
    },
    {}
  );

  const categoryOrder = ["assistant", "code", "writing", "image", "search"];

  return (
    <div className="space-y-6">
      {categoryOrder.map((category) => {
        const tools = grouped[category];
        if (!tools?.length) return null;

        return (
          <div key={category} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              {CATEGORY_LABELS[category]}
            </p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
              {tools.map((tool) => {
                const isSelected = selected.includes(tool.id);
                return (
                  <button
                    key={tool.id}
                    type="button"
                    id={`tool-${tool.id}`}
                    onClick={() => toggle(tool.id)}
                    className={cn(
                      "group relative flex flex-col items-start gap-3 rounded-xl border p-4 text-left",
                      "transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                      isSelected
                        ? "border-primary bg-primary/[0.03] shadow-sm ring-1 ring-primary/20"
                        : "border-border/60 bg-card hover:border-primary/30 hover:bg-muted/20 hover:shadow-sm"
                    )}
                    aria-pressed={isSelected}
                  >
                    {/* Check badge */}
                    {isSelected && (
                      <span className="absolute right-3 top-3 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-sm">
                        <Check className="h-2.5 w-2.5" strokeWidth={3} />
                      </span>
                    )}

                    {/* Icon */}
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-lg border transition-colors",
                        isSelected
                          ? "border-primary/20 bg-primary/10"
                          : "border-border/50 bg-muted/30 group-hover:bg-muted/50"
                      )}
                    >
                      <span className="text-xl leading-none" role="img" aria-hidden>
                        {TOOL_ICONS[tool.id]}
                      </span>
                    </div>

                    {/* Name + vendor */}
                    <div className="space-y-0.5">
                      <p
                        className={cn(
                          "text-sm font-semibold leading-none",
                          isSelected ? "text-foreground" : "text-foreground/80"
                        )}
                      >
                        {tool.name}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {tool.vendor}
                      </p>
                    </div>

                    {/* Typical cost badge */}
                    {tool.typicalSeatCost > 0 && (
                      <span className="text-[10px] font-medium text-muted-foreground">
                        ~${tool.typicalSeatCost}/seat
                      </span>
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
        <p className="text-sm text-destructive">{error}</p>
      )}

      {/* Selection summary */}
      {selected.length > 0 && (
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{selected.length}</span>{" "}
          {selected.length === 1 ? "tool" : "tools"} selected
        </p>
      )}
    </div>
  );
}
