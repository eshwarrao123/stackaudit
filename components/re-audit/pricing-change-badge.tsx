import { ArrowDownIcon, ArrowUpIcon, MinusIcon, RefreshCwIcon } from "lucide-react";

interface PricingChangeBadgeProps {
  type: "added" | "removed" | "changed" | "unchanged";
  savingsDelta: number;
}

export function PricingChangeBadge({ type, savingsDelta }: PricingChangeBadgeProps) {
  if (type === "unchanged") {
    return (
      <span className="px-2 py-1 bg-slate-800 text-slate-400 rounded text-xs border border-slate-700">
        Unchanged
      </span>
    );
  }
  
  if (type === "added") {
    return (
      <span className="px-2 py-1 bg-green-500/10 text-green-400 rounded text-xs border border-green-500/20 flex items-center gap-1 w-fit">
        <ArrowUpIcon className="w-3 h-3" /> New
      </span>
    );
  }
  
  if (type === "removed") {
    return (
      <span className="px-2 py-1 bg-red-500/10 text-red-400 rounded text-xs border border-red-500/20 flex items-center gap-1 w-fit">
        <MinusIcon className="w-3 h-3" /> Dropped
      </span>
    );
  }
  
  // changed
  const isPositive = savingsDelta > 0;
  const isNegative = savingsDelta < 0;
  
  return (
    <span
      className={`px-2 py-1 rounded text-xs border flex items-center gap-1 w-fit
      ${
        isPositive
          ? "bg-green-500/10 text-green-400 border-green-500/20"
          : isNegative
          ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
          : "bg-blue-500/10 text-blue-400 border-blue-500/20"
      }
    `}
    >
      {isPositive && <ArrowUpIcon className="w-3 h-3" />}
      {isNegative && <ArrowDownIcon className="w-3 h-3" />}
      {!isPositive && !isNegative && <RefreshCwIcon className="w-3 h-3" />}
      Updated
    </span>
  );
}
