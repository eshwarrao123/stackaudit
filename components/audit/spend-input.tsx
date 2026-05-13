"use client";

import { useEffect } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { TOOLS } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import type { AuditInputSchema } from "@/lib/schemas/audit";
import type { ToolId, UseCase, UsageFrequency } from "@/lib/engine/types";
import { cn } from "@/lib/utils";



const FREQUENCY_OPTIONS: { value: UsageFrequency; label: string; description: string }[] = [
  { value: "daily",      label: "Daily",      description: "Used every day" },
  { value: "weekly",     label: "Weekly",     description: "A few times a week" },
  { value: "occasional", label: "Occasional", description: "A few times a month" },
  { value: "rare",       label: "Rare",       description: "Almost never" },
];

const USE_CASE_OPTIONS: { value: UseCase; label: string }[] = [
  { value: "code-gen",        label: "Code generation" },
  { value: "debugging",       label: "Debugging" },
  { value: "code-review",     label: "Code review" },
  { value: "documentation",   label: "Documentation" },
  { value: "content-writing", label: "Content writing" },
  { value: "image-gen",       label: "Image generation" },
  { value: "research",        label: "Research" },
  { value: "customer-support",label: "Customer support" },
  { value: "data-analysis",   label: "Data analysis" },
  { value: "prototyping",     label: "Prototyping" },
];

const TOOL_ICONS: Record<ToolId, string> = {
  "chatgpt": "🤖", "claude": "🧠", "cursor": "⚡", "copilot": "🐙",
  "gemini": "✨", "openai-api": "🔌", "anthropic-api": "🔌",
  "midjourney": "🎨", "perplexity": "🔍", "notion-ai": "📝",
  "grammarly": "✍️", "jasper": "🚀", "runway": "🎬",
};

interface SpendInputProps {
  selectedToolIds: ToolId[];
}

export function SpendInput({ selectedToolIds }: SpendInputProps) {
  const {
    register,
    control,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<AuditInputSchema>();

  const { fields, append, remove } = useFieldArray({ control, name: "tools" });

  // Sync field array with selected tool IDs whenever they change
  useEffect(() => {
    const currentIds = fields.map((f) => f.toolId as ToolId);

    // Add newly selected tools
    for (const toolId of selectedToolIds) {
      if (!currentIds.includes(toolId)) {
        const meta = TOOLS[toolId];
        append({
          toolId,
          monthlySpend: meta.typicalSeatCost > 0 ? meta.typicalSeatCost : 50,
          seats: 1,
          usageFrequency: "weekly",
          usedFor: meta.capabilities.slice(0, 2) as UseCase[],
        });
      }
    }

    fields.forEach((field, index) => {
      if (!selectedToolIds.includes(field.toolId as ToolId)) {
        remove(index);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedToolIds]);

  if (fields.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        No tools selected. Go back and pick at least one.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {fields.map((field, index) => {
        const toolId = field.toolId as ToolId;
        const meta = TOOLS[toolId];
        const toolErrors = errors.tools?.[index];
        const currentUsedFor = watch(`tools.${index}.usedFor`) ?? [];
        const currentFrequency = watch(`tools.${index}.usageFrequency`);

        return (
          <div
            key={field.id}
            className="group relative rounded-2xl border border-border/60 bg-card/50 p-5 space-y-6 shadow-sm transition-all hover:border-border hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-border/50 bg-muted/40 shadow-sm">
                <span className="text-xl leading-none" role="img" aria-hidden>
                  {TOOL_ICONS[toolId]}
                </span>
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-sm leading-none">{meta.name}</p>
                <p className="text-xs text-muted-foreground">{meta.vendor}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor={`tools.${index}.monthlySpend`}
                  className="text-xs font-medium text-foreground"
                >
                  Monthly spend (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    $
                  </span>
                  <Input
                    id={`tools.${index}.monthlySpend`}
                    type="number"
                    min={0}
                    className="pl-7"
                    {...register(`tools.${index}.monthlySpend`, { valueAsNumber: true })}
                  />
                </div>
                {toolErrors?.monthlySpend && (
                  <p className="text-xs text-destructive">
                    {toolErrors.monthlySpend.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor={`tools.${index}.seats`}
                  className="text-xs font-medium text-foreground"
                >
                  Seats / licenses
                </label>
                <Input
                  id={`tools.${index}.seats`}
                  type="number"
                  min={1}
                  {...register(`tools.${index}.seats`, { valueAsNumber: true })}
                />
                {toolErrors?.seats && (
                  <p className="text-xs text-destructive">
                    {toolErrors.seats.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground">Usage frequency</p>
              <div className="flex flex-wrap gap-2">
                {FREQUENCY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    id={`tools.${index}.freq.${opt.value}`}
                    onClick={() =>
                      setValue(`tools.${index}.usageFrequency`, opt.value, {
                        shouldValidate: true,
                      })
                    }
                    className={cn(
                      "rounded-lg border px-4 py-2 text-xs font-medium transition-all duration-200",
                      currentFrequency === opt.value
                        ? "border-primary bg-primary text-primary-foreground shadow-sm"
                        : "border-border/60 bg-background/50 text-muted-foreground hover:border-border hover:bg-muted/30 hover:text-foreground"
                    )}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-medium text-foreground">Used for</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
                {USE_CASE_OPTIONS.map((opt) => {
                  const isChecked = currentUsedFor.includes(opt.value);
                  return (
                    <label
                      key={opt.value}
                      htmlFor={`tools.${index}.usedFor.${opt.value}`}
                      className="flex cursor-pointer items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <input
                        id={`tools.${index}.usedFor.${opt.value}`}
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {
                          const next = isChecked
                            ? currentUsedFor.filter((v) => v !== opt.value)
                            : [...currentUsedFor, opt.value];
                          setValue(`tools.${index}.usedFor`, next as UseCase[], {
                            shouldValidate: true,
                          });
                        }}
                        className="accent-primary h-3.5 w-3.5 rounded"
                      />
                      {opt.label}
                    </label>
                  );
                })}
              </div>
              {toolErrors?.usedFor && (
                <p className="text-xs text-destructive">
                  {typeof toolErrors.usedFor === "object" && "message" in toolErrors.usedFor
                    ? (toolErrors.usedFor as { message: string }).message
                    : "Select at least one use case"}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
