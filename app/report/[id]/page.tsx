"use client";

// ─────────────────────────────────────────────
// Report Page — Temporary Client-Side Version
//
// Reads the AuditReport from localStorage using the ID
// in the URL. This will be replaced with a server
// component (fetching from Supabase) on Day 4.
// ─────────────────────────────────────────────

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, Sparkles, ArrowLeft, AlertTriangle, TrendingDown, CheckCircle2, AlertCircle, Info } from "lucide-react";
import { REPORT_STORAGE_PREFIX } from "@/app/actions/audit";
import type { AuditReport, Recommendation } from "@/lib/engine/types";
import { TOOLS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export default function ReportPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<AuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!params.id) return;
    try {
      const raw = localStorage.getItem(`${REPORT_STORAGE_PREFIX}${params.id}`);
      if (!raw) {
        setError("Report not found. It may have expired or the link is invalid.");
        return;
      }
      setReport(JSON.parse(raw) as AuditReport);
    } catch {
      setError("Failed to load report.");
    }
  }, [params.id]);

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <p className="text-sm text-muted-foreground text-center">{error}</p>
        <Button variant="outline" onClick={() => router.push("/audit")}>
          Start a new audit
        </Button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const criticalCount = report.recommendations.filter((r) => r.severity === "critical").length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-xl items-center justify-between px-5 py-4">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm font-bold tracking-tight text-foreground transition-opacity hover:opacity-80"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            StackAudit
          </button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
            }}
            className="text-xs"
          >
            Copy link
          </Button>
        </div>
      </header>

      <main className="mx-auto w-full max-w-xl px-5 py-10 space-y-8">
        {/* Score hero */}
        <div className="rounded-2xl border border-border/50 bg-gradient-to-b from-card to-muted/20 p-8 text-center space-y-4 shadow-sm">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
            Optimization Score
          </p>
          <div className="flex items-end justify-center gap-2">
            <span
              className={cn(
                "text-7xl font-bold tabular-nums tracking-tighter",
                report.score >= 70
                  ? "text-foreground"
                  : report.score >= 40
                  ? "text-amber-500"
                  : "text-destructive"
              )}
            >
              {report.score}
            </span>
            <span className="text-2xl text-muted-foreground mb-2">/100</span>
          </div>
          <p className="text-sm text-muted-foreground">
            {report.score >= 70
              ? "Your AI stack is reasonably optimized."
              : report.score >= 40
              ? "There's meaningful room to reduce spend."
              : "Significant savings are available right now."}
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Monthly spend"
            value={`$${report.totalMonthlySpend.toLocaleString()}`}
          />
          <StatCard
            label="Est. savings"
            value={`$${Math.round(report.estimatedMonthlySavings).toLocaleString()}`}
            highlight
          />
          <StatCard
            label="Issues found"
            value={String(criticalCount)}
            sub="critical"
          />
        </div>

        {/* Recommendations */}
        {report.recommendations.length > 0 ? (
          <div className="space-y-3">
            <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              Recommendations ({report.recommendations.length})
            </h2>
            {report.recommendations.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-border/50 bg-card p-6 text-center space-y-2">
            <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto" />
            <p className="text-sm font-medium">Your stack looks clean!</p>
            <p className="text-xs text-muted-foreground">
              No major overlaps or waste detected with the tools you selected.
            </p>
          </div>
        )}

        {/* Tool breakdown */}
        <div className="space-y-3">
          <h2 className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
            Tool breakdown
          </h2>
          <div className="divide-y divide-border/50 rounded-xl border border-border/50 bg-card overflow-hidden">
            {report.toolBreakdown.map((tool) => (
              <div
                key={tool.toolId}
                className="flex items-center justify-between px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{TOOL_ICONS[tool.toolId]}</span>
                  <div>
                    <p className="text-sm font-medium leading-none">
                      {TOOLS[tool.toolId].name}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {tool.seats} seat{tool.seats !== 1 ? "s" : ""} · $
                      {tool.costPerSeat.toFixed(0)}/seat
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">
                    ${tool.monthlySpend.toLocaleString()}
                    <span className="text-[11px] text-muted-foreground font-normal">/mo</span>
                  </p>
                  <UtilBadge score={tool.utilizationScore} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="rounded-xl border border-border/50 bg-card p-5 text-center space-y-3">
          <p className="text-sm font-medium">Want a detailed implementation plan?</p>
          <p className="text-xs text-muted-foreground">
            Enter your email to receive a full breakdown with step-by-step instructions.
          </p>
          <Button
            className="w-full"
            onClick={() => router.push("/audit")}
          >
            Run another audit
          </Button>
        </div>
      </main>
    </div>
  );
}

// ─── Sub-components ───────────────────────────

const TOOL_ICONS: Record<string, string> = {
  "chatgpt": "🤖", "claude": "🧠", "cursor": "⚡", "copilot": "🐙",
  "gemini": "✨", "openai-api": "🔌", "anthropic-api": "🔌",
  "midjourney": "🎨", "perplexity": "🔍", "notion-ai": "📝",
  "grammarly": "✍️", "jasper": "🚀", "runway": "🎬",
};

const SEVERITY_ICON: Record<string, React.ReactNode> = {
  critical: <AlertCircle className="h-4 w-4 text-destructive shrink-0" />,
  warning:  <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />,
  info:     <Info className="h-4 w-4 text-blue-500 shrink-0" />,
};

const SEVERITY_BORDER: Record<string, string> = {
  critical: "border-destructive/20 bg-destructive/[0.03]",
  warning:  "border-amber-500/20 bg-amber-500/[0.03]",
  info:     "border-blue-500/20 bg-blue-500/[0.03]",
};

const TYPE_BADGE: Record<string, string> = {
  eliminate:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
  consolidate: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  downgrade:   "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  optimize:    "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  keep:        "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
};

function StatCard({
  label,
  value,
  sub,
  highlight,
}: {
  label: string;
  value: string;
  sub?: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 text-center space-y-1",
        highlight
          ? "border-green-500/20 bg-green-500/[0.04]"
          : "border-border/50 bg-card"
      )}
    >
      <p
        className={cn(
          "text-xl font-semibold tabular-nums",
          highlight && "text-green-600 dark:text-green-400"
        )}
      >
        {value}
      </p>
      <p className="text-[11px] text-muted-foreground leading-tight">
        {label}
        {sub && <span className="block font-medium text-destructive">{sub}</span>}
      </p>
    </div>
  );
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 space-y-3",
        SEVERITY_BORDER[rec.severity]
      )}
    >
      <div className="flex items-start gap-2.5">
        {SEVERITY_ICON[rec.severity]}
        <div className="flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold leading-none">{rec.title}</p>
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                TYPE_BADGE[rec.type]
              )}
            >
              {rec.type}
            </span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {rec.description}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-border/30 pt-3">
        <p className="text-xs text-muted-foreground">
          Est. saving:{" "}
          <span className="font-semibold text-foreground">
            ${Math.round(rec.estimatedMonthlySaving).toLocaleString()}/mo
          </span>
        </p>
        <span className="text-xs font-medium text-foreground/70 bg-muted/50 rounded-lg px-2.5 py-1">
          {rec.actionLabel}
        </span>
      </div>
    </div>
  );
}

function UtilBadge({ score }: { score: number }) {
  const color =
    score >= 60
      ? "text-green-600 dark:text-green-400"
      : score >= 30
      ? "text-amber-600 dark:text-amber-400"
      : "text-destructive";
  return (
    <p className={cn("text-[11px] font-semibold mt-0.5", color)}>
      {score}% utilized
    </p>
  );
}
