import type { AuditRecommendation } from "@/lib/audit-engine/types";
import type { RecommendationDiff } from "@/lib/re-audit/types";
import { PricingChangeBadge } from "./pricing-change-badge";
import { ChevronRightIcon } from "lucide-react";

interface Props {
  diff: RecommendationDiff;
  oldRec?: AuditRecommendation;
  newRec?: AuditRecommendation;
}

export function RecommendationDiffCard({ diff, oldRec, newRec }: Props) {
  const isUnchanged = diff.type === "unchanged";
  const rec = newRec || oldRec; 

  if (!rec) return null;

  return (
    <div
      className={`p-4 border rounded-xl flex flex-col gap-3 transition-colors ${
        isUnchanged
          ? "border-slate-800 bg-slate-900/30 opacity-75"
          : "border-slate-700 bg-slate-800/50"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h4 className="font-medium text-slate-200 leading-tight">
            {rec.title}
          </h4>
          <p className="text-sm text-slate-400 mt-1.5 leading-relaxed">
            {rec.description}
          </p>
        </div>
        <PricingChangeBadge type={diff.type} savingsDelta={diff.savingsDelta} />
      </div>

      {!isUnchanged && oldRec && newRec && diff.type === "changed" && (
        <div className="flex items-center gap-3 mt-2 text-sm bg-slate-900/80 p-3 rounded-lg border border-slate-800 w-fit">
          <div className="text-slate-500">
            Old savings: <span className="line-through">${oldRec.estimatedSavings}/mo</span>
          </div>
          <ChevronRightIcon className="w-4 h-4 text-slate-600" />
          <div className="text-emerald-400 font-medium">
            New savings: ${newRec.estimatedSavings}/mo
          </div>
        </div>
      )}

      {!isUnchanged && diff.type === "added" && newRec && (
        <div className="mt-2 text-sm text-emerald-400 font-medium">
          Identified new savings: +${newRec.estimatedSavings}/mo
        </div>
      )}

      {!isUnchanged && diff.type === "removed" && oldRec && (
        <div className="mt-2 text-sm text-red-400/80 font-medium">
          Lost savings: <span className="line-through">-${oldRec.estimatedSavings}/mo</span>
        </div>
      )}
    </div>
  );
}
