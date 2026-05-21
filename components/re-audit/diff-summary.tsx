import type { RecommendationDiff } from "@/lib/re-audit/types";
import type { FullAuditReport } from "@/lib/audit-engine/types";
import { RecommendationDiffCard } from "./recommendation-diff-card";

interface Props {
  diffs: RecommendationDiff[];
  oldReport: FullAuditReport;
  newReport: FullAuditReport;
}

export function DiffSummary({ diffs, oldReport, newReport }: Props) {
  // Sort diffs: changed -> added -> removed -> unchanged for visual priority
  const sortedDiffs = [...diffs].sort((a, b) => {
    const order = { changed: 0, added: 1, removed: 2, unchanged: 3 };
    return order[a.type] - order[b.type];
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="text-xl font-semibold text-slate-100">
          Recommendation Changes
        </h3>
        <span className="text-sm font-medium text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full">
          {diffs.length} total recommendations
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {sortedDiffs.map((diff) => {
          const oldRec = oldReport.recommendations.find(
            (r) => r.id === diff.recommendationId
          );
          const newRec = newReport.recommendations.find(
            (r) => r.id === diff.recommendationId
          );
          return (
            <RecommendationDiffCard
              key={diff.recommendationId}
              diff={diff}
              oldRec={oldRec}
              newRec={newRec}
            />
          );
        })}

        {diffs.length === 0 && (
          <div className="p-8 text-center border border-slate-800 rounded-xl bg-slate-900/30">
            <p className="text-slate-400">
              No recommendations were triggered by this stack.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
