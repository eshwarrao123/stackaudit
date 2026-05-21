import { ArrowDownRightIcon, ArrowUpRightIcon, MinusIcon } from "lucide-react";

interface Props {
  oldSavings: number;
  newSavings: number;
  oldScore: number;
  newScore: number;
}

export function AuditComparisonHeader({
  oldSavings,
  newSavings,
  oldScore,
  newScore,
}: Props) {
  const savingsDelta = newSavings - oldSavings;
  const scoreDelta = newScore - oldScore;

  const isSavingsPositive = savingsDelta > 0;

  const isScorePositive = scoreDelta > 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      {/* Savings Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center">
        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">
          Total Savings Impact
        </h3>
        <div className="flex items-end gap-3">
          <span className="text-4xl font-bold text-slate-100">
            ${newSavings}
            <span className="text-2xl text-slate-500">/mo</span>
          </span>
          {savingsDelta !== 0 && (
            <span
              className={`flex items-center gap-1 text-sm font-medium mb-1 px-2 py-0.5 rounded-full ${
                isSavingsPositive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {isSavingsPositive ? (
                <ArrowUpRightIcon className="w-4 h-4" />
              ) : (
                <ArrowDownRightIcon className="w-4 h-4" />
              )}
              ${Math.abs(savingsDelta)}
            </span>
          )}
          {savingsDelta === 0 && (
            <span className="flex items-center gap-1 text-sm font-medium mb-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              <MinusIcon className="w-4 h-4" /> No change
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 mt-2">
          Previously ${oldSavings}/mo before pricing changes.
        </p>
      </div>

      {/* Score Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center">
        <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">
          Optimization Score
        </h3>
        <div className="flex items-end gap-3">
          <span className="text-4xl font-bold text-slate-100">{newScore}</span>
          <span className="text-2xl text-slate-500">/ 100</span>
          {scoreDelta !== 0 && (
            <span
              className={`flex items-center gap-1 text-sm font-medium mb-1 px-2 py-0.5 rounded-full ${
                isScorePositive
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-red-500/10 text-red-400"
              }`}
            >
              {isScorePositive ? (
                <ArrowUpRightIcon className="w-4 h-4" />
              ) : (
                <ArrowDownRightIcon className="w-4 h-4" />
              )}
              {Math.abs(scoreDelta)} pts
            </span>
          )}
          {scoreDelta === 0 && (
            <span className="flex items-center gap-1 text-sm font-medium mb-1 px-2 py-0.5 rounded-full bg-slate-800 text-slate-400">
              <MinusIcon className="w-4 h-4" /> No change
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 mt-2">
          Previously scored {oldScore} before pricing changes.
        </p>
      </div>
    </div>
  );
}
