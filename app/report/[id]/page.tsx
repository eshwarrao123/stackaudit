"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Loader2, Sparkles, AlertTriangle, CheckCircle2,
  AlertCircle, Info, Copy, RotateCcw, TrendingDown,
} from "lucide-react";
import { REPORT_STORAGE_PREFIX } from "@/app/actions/audit";
import type { FullAuditReport, AuditRecommendation } from "@/lib/audit-engine/types";
import { TOOLS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ─── Tool icon map ────────────────────────────
const TOOL_ICONS: Record<string, string> = {
  "chatgpt": "🤖", "claude": "🧠", "cursor": "⚡", "copilot": "🐙",
  "gemini": "✨", "openai-api": "🔌", "anthropic-api": "🔌",
  "midjourney": "🎨", "perplexity": "🔍", "notion-ai": "📝",
  "grammarly": "✍️", "jasper": "🚀", "runway": "🎬",
};

// ─── Severity config ──────────────────────────
const SEV_CONFIG = {
  critical: {
    icon: <AlertCircle className="h-4 w-4 shrink-0" />,
    iconCls: "text-red-400",
    borderCls: "border-red-500/20",
    bgCls: "bg-red-500/[0.04]",
    accentCls: "bg-red-500",
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4 shrink-0" />,
    iconCls: "text-amber-400",
    borderCls: "border-amber-500/20",
    bgCls: "bg-amber-500/[0.04]",
    accentCls: "bg-amber-500",
  },
  info: {
    icon: <Info className="h-4 w-4 shrink-0" />,
    iconCls: "text-blue-400",
    borderCls: "border-blue-500/20",
    bgCls: "bg-blue-500/[0.04]",
    accentCls: "bg-blue-500",
  },
} as const;

const TYPE_LABEL: Record<string, { label: string; cls: string }> = {
  eliminate:   { label: "Eliminate",   cls: "bg-red-500/15 text-red-400 ring-red-500/20" },
  consolidate: { label: "Consolidate", cls: "bg-orange-500/15 text-orange-400 ring-orange-500/20" },
  downgrade:   { label: "Downgrade",   cls: "bg-yellow-500/15 text-yellow-400 ring-yellow-500/20" },
  optimize:    { label: "Optimize",    cls: "bg-blue-500/15 text-blue-400 ring-blue-500/20" },
  keep:        { label: "Keep",        cls: "bg-emerald-500/15 text-emerald-400 ring-emerald-500/20" },
};

// ─── Page ─────────────────────────────────────
export default function ReportPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<FullAuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!params.id) return;
    try {
      const raw = localStorage.getItem(`${REPORT_STORAGE_PREFIX}${params.id}`);
      if (!raw) { setError("Report not found or expired."); return; }
      setReport(JSON.parse(raw) as FullAuditReport);
    } catch { setError("Failed to load report."); }
  }, [params.id]);

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) return <ErrorState message={error} />;
  if (!report) return <LoadingState />;

  const criticals = report.recommendations.filter((r) => r.severity === "critical").length;
  const scoreColor =
    report.score >= 70 ? "text-emerald-400" :
    report.score >= 40 ? "text-amber-400" : "text-red-400";
  const scoreGlow =
    report.score >= 70 ? "shadow-[0_0_40px_rgba(16,185,129,0.12)]" :
    report.score >= 40 ? "shadow-[0_0_40px_rgba(245,158,11,0.12)]" :
    "shadow-[0_0_40px_rgba(239,68,68,0.12)]";

  return (
    <div className="min-h-screen bg-background">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#13131b]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-5 py-3.5">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm font-bold tracking-tight text-white/90 transition-opacity hover:opacity-70"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            StackAudit
          </button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 gap-1.5 text-xs text-white/50 hover:text-white/80"
            >
              <Copy className="h-3.5 w-3.5" />
              {copied ? "Copied!" : "Copy link"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/audit")}
              className="h-8 gap-1.5 text-xs border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white/90"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              New audit
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-5 py-12 space-y-10">

        {/* ── Score Hero ── */}
        <div className={cn(
          "relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#1f1f27] px-8 py-10 text-center",
          scoreGlow
        )}>
          {/* Subtle radial glow bg */}
          <div className={cn(
            "pointer-events-none absolute inset-0 opacity-20",
            report.score >= 70
              ? "bg-[radial-gradient(ellipse_at_50%_0%,rgba(16,185,129,0.3),transparent_70%)]"
              : report.score >= 40
              ? "bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,158,11,0.3),transparent_70%)]"
              : "bg-[radial-gradient(ellipse_at_50%_0%,rgba(239,68,68,0.3),transparent_70%)]"
          )} />

          <p className="label-caps mb-6">Optimization Score</p>
          <div className="flex items-baseline justify-center gap-2">
            <span className={cn("text-[80px] font-semibold leading-none tracking-tight tabular-nums", scoreColor)}>
              {report.score}
            </span>
            <span className="text-2xl font-normal text-white/20 mb-1">/100</span>
          </div>
          <p className="mt-4 text-sm text-white/50">
            {report.score >= 70
              ? "Your AI stack is reasonably well optimized."
              : report.score >= 40
              ? "There's meaningful room to reduce your AI spend."
              : "Significant savings are available right now."}
          </p>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Monthly Spend"
            value={`$${report.totalSpend.toLocaleString()}`}
          />
          <StatCard
            label="Est. Savings"
            value={`$${Math.round(report.monthlyWaste).toLocaleString()}`}
            sub="per month"
            emerald
          />
          <StatCard
            label="Critical Issues"
            value={String(criticals)}
            danger={criticals > 0}
          />
        </div>

        {/* ── Recommendations ── */}
        <section className="space-y-3">
          <SectionLabel icon={<TrendingDown className="h-3.5 w-3.5" />}>
            Recommendations{report.recommendations.length > 0 && ` (${report.recommendations.length})`}
          </SectionLabel>

          {report.recommendations.length === 0 ? (
            <EmptyRecommendations />
          ) : (
            report.recommendations.map((rec) => (
              <RecommendationCard key={rec.id} rec={rec} />
            ))
          )}
        </section>

        {/* ── Tool breakdown ── */}
        <section className="space-y-3">
          <SectionLabel>Tool Breakdown</SectionLabel>
          <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#1f1f27] divide-y divide-white/[0.05]">
            {report.input.tools.map((tool) => {
              const meta = TOOLS[tool.toolId];
              const icon = TOOL_ICONS[tool.toolId] ?? "🔧";
              const costPerSeat = tool.seats > 0 ? tool.monthlySpend / tool.seats : 0;
              return (
                <div
                  key={tool.toolId}
                  className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-white/[0.03]"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-base">
                      {icon}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/90 leading-none">{meta?.name ?? tool.toolId}</p>
                      <p className="mt-1 text-[11px] text-white/40">
                        {tool.seats} seat{tool.seats !== 1 ? "s" : ""} · ${costPerSeat.toFixed(0)}/seat
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-white/90 tabular-nums">
                      ${tool.monthlySpend.toLocaleString()}
                      <span className="text-[11px] font-normal text-white/30">/mo</span>
                    </p>
                    <p className="text-[11px] font-medium mt-1 text-white/50 capitalize">
                      {tool.usageFrequency} usage
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── CTA ── */}
        <div className="rounded-xl border border-white/[0.07] bg-[#1f1f27] p-6 text-center space-y-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 border border-indigo-500/20 mx-auto">
            <Sparkles className="h-5 w-5 text-indigo-400" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white/90">Want a savings implementation plan?</p>
            <p className="text-xs text-white/40">
              Enter your email below to receive step-by-step instructions for each recommendation.
            </p>
          </div>
          <div className="flex gap-2 max-w-sm mx-auto">
            <input
              type="email"
              placeholder="you@startup.com"
              className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white/80 placeholder:text-white/25 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30"
            />
            <Button className="bg-indigo-500 text-white hover:bg-indigo-400 shadow-[0_0_16px_rgba(99,102,241,0.3)]">
              Send report
            </Button>
          </div>
        </div>

      </main>
    </div>
  );
}

// ─── Sub-components ───────────────────────────

function SectionLabel({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {icon && <span className="text-white/30">{icon}</span>}
      <span className="label-caps">{children}</span>
    </div>
  );
}

function StatCard({
  label,
  value,
  sub,
  emerald,
  danger,
}: {
  label: string;
  value: string;
  sub?: string;
  emerald?: boolean;
  danger?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border px-4 py-5 text-center space-y-1.5",
        emerald
          ? "border-emerald-500/20 bg-emerald-500/[0.04] shadow-[0_0_20px_rgba(16,185,129,0.06)]"
          : danger
          ? "border-red-500/20 bg-[#1f1f27]"
          : "border-white/[0.07] bg-[#1f1f27]"
      )}
    >
      <p
        className={cn(
          "text-2xl font-semibold tabular-nums tracking-tight",
          emerald ? "text-emerald-400" : danger ? "text-red-400" : "text-white/90"
        )}
      >
        {value}
      </p>
      <div>
        <p className="label-caps">{label}</p>
        {sub && <p className="text-[10px] text-white/30 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function RecommendationCard({ rec }: { rec: AuditRecommendation }) {
  const sev = SEV_CONFIG[rec.severity as keyof typeof SEV_CONFIG] ?? SEV_CONFIG.info;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-5 space-y-4",
        sev.borderCls, sev.bgCls
      )}
    >
      {/* Left accent bar */}
      <div className={cn("absolute left-0 top-4 bottom-4 w-0.5 rounded-full", sev.accentCls)} />

      <div className="pl-3 flex items-start gap-3">
        <span className={cn("mt-0.5", sev.iconCls)}>{sev.icon}</span>
        <div className="flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-white/90 leading-none">{rec.title}</p>
            <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/50 ring-1 ring-white/10">
              {rec.category}
            </span>
          </div>
          <p className="text-xs text-white/50 leading-relaxed">{rec.description}</p>
        </div>
      </div>

      <div className="pl-3 flex items-center justify-between border-t border-white/[0.06] pt-3">
        <p className="text-xs text-white/40">
          Est. saving:{" "}
          <span className="font-semibold text-emerald-400">
            ${Math.round(rec.estimatedSavings).toLocaleString()}/mo
          </span>
        </p>
        <span className="text-[11px] font-medium text-white/50 bg-white/[0.06] rounded-md px-2.5 py-1">
          {rec.action}
        </span>
      </div>
    </div>
  );
}

function EmptyRecommendations() {
  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-8 text-center space-y-2">
      <CheckCircle2 className="h-8 w-8 text-emerald-400 mx-auto" />
      <p className="text-sm font-semibold text-white/90">Your stack looks clean!</p>
      <p className="text-xs text-white/40">
        No major overlaps or waste detected with the tools you selected.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-5 w-5 animate-spin text-white/20" />
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/[0.08]">
        <AlertTriangle className="h-6 w-6 text-red-400" />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-medium text-white/80">{message}</p>
        <p className="text-xs text-white/30">Your report may have been cleared from localStorage.</p>
      </div>
      <Button
        variant="outline"
        onClick={() => router.push("/audit")}
        className="border-white/10 text-white/70 hover:bg-white/[0.06]"
      >
        Start a new audit
      </Button>
    </div>
  );
}
