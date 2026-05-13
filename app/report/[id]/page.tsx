"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  Copy,
  Info,
  Loader2,
  Mail,
  RotateCcw,
  Sparkles,
  TrendingDown,
  Users,
  Zap,
} from "lucide-react";
import { fetchReport } from "@/lib/supabase/db";
import type { FullAuditReport, AuditRecommendation } from "@/lib/audit-engine/types";
import { TOOLS } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ─── Tool icon map ────────────────────────────
const TOOL_ICONS: Record<string, string> = {
  chatgpt: "🤖",
  claude: "🧠",
  cursor: "⚡",
  copilot: "🐙",
  gemini: "✨",
  "openai-api": "🔌",
  "anthropic-api": "🔌",
  midjourney: "🎨",
  perplexity: "🔍",
  "notion-ai": "📝",
  grammarly: "✍️",
  jasper: "🚀",
  runway: "🎬",
};

// ─── Severity config ──────────────────────────
const SEV_CONFIG = {
  critical: {
    icon: <AlertCircle className="h-4 w-4 shrink-0" />,
    iconCls: "text-red-400",
    borderCls: "border-red-500/20",
    bgCls: "bg-red-500/[0.04]",
    accentCls: "bg-red-500",
    label: "Critical",
  },
  high: {
    icon: <AlertTriangle className="h-4 w-4 shrink-0" />,
    iconCls: "text-amber-400",
    borderCls: "border-amber-500/20",
    bgCls: "bg-amber-500/[0.04]",
    accentCls: "bg-amber-500",
    label: "High",
  },
  medium: {
    icon: <Info className="h-4 w-4 shrink-0" />,
    iconCls: "text-blue-400",
    borderCls: "border-blue-500/20",
    bgCls: "bg-blue-500/[0.04]",
    accentCls: "bg-blue-500",
    label: "Medium",
  },
  low: {
    icon: <Info className="h-4 w-4 shrink-0" />,
    iconCls: "text-white/40",
    borderCls: "border-white/[0.08]",
    bgCls: "bg-white/[0.02]",
    accentCls: "bg-white/20",
    label: "Low",
  },
} as const;

// ─── Helpers ──────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Page ─────────────────────────────────────

export default function ReportPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [report, setReport] = useState<FullAuditReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    if (!params.id) return;
    fetchReport(params.id)
      .then((r) => {
        if (!r) setError("Report not found or has expired.");
        else {
          setReport(r);
          // Animate score counter
          const target = r.score;
          let current = 0;
          const step = Math.ceil(target / 30);
          const timer = setInterval(() => {
            current = Math.min(current + step, target);
            setDisplayScore(current);
            if (current >= target) clearInterval(timer);
          }, 30);
          // Fetch AI summary server-side
          setSummaryLoading(true);
          fetch("/api/summary", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(r),
          })
            .then((res) => res.json())
            .then((data: { summary?: string }) => {
              if (data.summary) setAiSummary(data.summary);
            })
            .catch(() => null)
            .finally(() => setSummaryLoading(false));
        }
      })
      .catch(() => setError("Failed to load report. Please try again."));
  }, [params.id]);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (error) return <ErrorState message={error} />;
  if (!report) return <LoadingState />;

  const criticals = report.recommendations.filter(
    (r) => r.severity === "critical" || r.severity === "high"
  ).length;

  const scoreColor =
    report.score >= 70
      ? "text-emerald-400"
      : report.score >= 40
      ? "text-amber-400"
      : "text-red-400";

  const scoreGlow =
    report.score >= 70
      ? "shadow-[0_0_40px_rgba(16,185,129,0.12)]"
      : report.score >= 40
      ? "shadow-[0_0_40px_rgba(245,158,11,0.12)]"
      : "shadow-[0_0_40px_rgba(239,68,68,0.12)]";

  const scoreRadial =
    report.score >= 70
      ? "bg-[radial-gradient(ellipse_at_50%_0%,rgba(16,185,129,0.3),transparent_70%)]"
      : report.score >= 40
      ? "bg-[radial-gradient(ellipse_at_50%_0%,rgba(245,158,11,0.3),transparent_70%)]"
      : "bg-[radial-gradient(ellipse_at_50%_0%,rgba(239,68,68,0.3),transparent_70%)]";

  return (
    <div className="min-h-screen bg-background">
      {/* ── Nav ── */}
      <header className="sticky top-0 z-20 border-b border-white/[0.06] bg-[#13131b]/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 sm:px-5 py-3.5">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-sm font-bold tracking-tight text-white/90 transition-opacity hover:opacity-70"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.4)]">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            <span className="hidden sm:inline">StackAudit</span>
          </button>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="h-8 gap-1.5 text-xs text-white/50 hover:text-white/80"
            >
              <Copy className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{copied ? "Copied!" : "Share report"}</span>
              <span className="sm:hidden">{copied ? "✓" : "Share"}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/audit")}
              className="h-8 gap-1.5 text-xs border-white/10 bg-white/[0.04] text-white/70 hover:bg-white/[0.08] hover:text-white/90"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New audit</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-4 sm:px-5 py-8 sm:py-12 space-y-6 sm:space-y-10">

        {/* ── Report Metadata ── */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-white/30">
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
            Report generated {formatDate(report.timestamp)}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="h-3 w-3" />
            {report.input.teamSize} team member{report.input.teamSize !== 1 ? "s" : ""}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="capitalize">{report.input.companyStage.replace("-", " ")}</span>
            <span>·</span>
            <span className="capitalize">{report.input.primaryUseCase}</span>
          </span>
        </div>

        {/* ── Score Hero ── */}
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl border border-white/[0.07] bg-[#1f1f27] px-6 sm:px-8 py-8 sm:py-10 text-center",
            scoreGlow
          )}
        >
          <div
            className={cn(
              "pointer-events-none absolute inset-0 opacity-20",
              scoreRadial
            )}
          />
          <p className="label-caps mb-5 sm:mb-6">Optimization Score</p>
          <div className="flex items-baseline justify-center gap-2">
            <span
              className={cn(
                "text-[64px] sm:text-[80px] font-semibold leading-none tracking-tight tabular-nums transition-all",
                scoreColor
              )}
            >
              {displayScore}
            </span>
            <span className="text-xl sm:text-2xl font-normal text-white/20 mb-1">
              /100
            </span>
          </div>
          <p className="mt-3 sm:mt-4 text-sm text-white/50 max-w-xs mx-auto">
            {report.score >= 70
              ? "Your AI stack is reasonably well optimized."
              : report.score >= 40
              ? "There's meaningful room to reduce your AI spend."
              : "Significant savings are available right now."}
          </p>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
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
            label="Issues Found"
            value={String(criticals)}
            danger={criticals > 0}
          />
        </div>

        {/* ── AI Summary ── */}
        {(summaryLoading || aiSummary) && (
          <section>
            <div className="rounded-xl border border-indigo-500/15 bg-indigo-500/[0.03] px-5 py-4 space-y-2">
              <div className="flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-indigo-400" />
                <span className="label-caps">AI Audit Summary</span>
                {summaryLoading && <Loader2 className="h-3 w-3 animate-spin text-white/30 ml-auto" />}
              </div>
              {summaryLoading && !aiSummary ? (
                <div className="space-y-2 pt-1">
                  <div className="h-3 w-full rounded bg-white/[0.06] animate-pulse" />
                  <div className="h-3 w-5/6 rounded bg-white/[0.06] animate-pulse" />
                  <div className="h-3 w-4/6 rounded bg-white/[0.06] animate-pulse" />
                </div>
              ) : (
                <p className="text-sm text-white/60 leading-relaxed">{aiSummary}</p>
              )}
            </div>
          </section>
        )}

        {/* ── Recommendations ── */}
        <section className="space-y-3">
          <SectionLabel icon={<TrendingDown className="h-3.5 w-3.5" />}>
            Recommendations
            {report.recommendations.length > 0 &&
              ` (${report.recommendations.length})`}
          </SectionLabel>

          {report.recommendations.length === 0 ? (
            <EmptyRecommendations />
          ) : (
            <div className="space-y-3">
              {report.recommendations.map((rec) => (
                <RecommendationCard key={rec.id} rec={rec} />
              ))}
            </div>
          )}
        </section>

        {/* ── Overlap Insights ── */}
        {report.overlaps.length > 0 && (
          <section className="space-y-3">
            <SectionLabel icon={<ArrowUpRight className="h-3.5 w-3.5" />}>
              Overlap Insights ({report.overlaps.length})
            </SectionLabel>
            <div className="space-y-2">
              {report.overlaps.map((overlap, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 rounded-xl border border-amber-500/15 bg-amber-500/[0.03] px-4 py-3.5"
                >
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-white/80">
                      {overlap.tools.map((t) => TOOLS[t as keyof typeof TOOLS]?.name ?? t).join(" ↔ ")}
                    </p>
                    <p className="text-[11px] text-white/40">{overlap.description}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p className="text-xs font-semibold text-amber-400">
                        {overlap.overlapPercentage}% overlap
                      </p>
                      <p className="text-[11px] text-white/30">
                        ~${overlap.wasteEstimate}/mo wasted
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── Lead Capture ── */}
        <LeadCaptureCard reportId={report.id} report={report} />

        {/* ── Tool Breakdown ── */}
        <section className="space-y-3">
          <SectionLabel>Tool Breakdown</SectionLabel>
          <div className="overflow-hidden rounded-xl border border-white/[0.07] bg-[#1f1f27] divide-y divide-white/[0.05]">
            {report.input.tools.map((tool) => {
              const meta = TOOLS[tool.toolId as keyof typeof TOOLS];
              const icon = TOOL_ICONS[tool.toolId] ?? "🔧";
              const costPerSeat =
                tool.seats > 0 ? tool.monthlySpend / tool.seats : 0;
              return (
                <div
                  key={tool.toolId}
                  className="flex items-center justify-between px-4 sm:px-5 py-3.5 transition-colors hover:bg-white/[0.03]"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-base">
                      {icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-white/90 leading-none truncate">
                        {meta?.name ?? tool.toolId}
                      </p>
                      <p className="mt-1 text-[11px] text-white/40">
                        {tool.seats} seat{tool.seats !== 1 ? "s" : ""} ·{" "}
                        ${costPerSeat.toFixed(0)}/seat
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-semibold text-white/90 tabular-nums">
                      ${tool.monthlySpend.toLocaleString()}
                      <span className="text-[11px] font-normal text-white/30">
                        /mo
                      </span>
                    </p>
                    <p className="text-[11px] font-medium mt-1 text-white/50 capitalize">
                      {tool.usageFrequency}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Footer CTA ── */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-xl border border-white/[0.07] bg-[#1f1f27] px-5 py-4">
          <p className="text-xs text-white/40 text-center sm:text-left">
            Share this report with your team or finance lead.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-2 border-white/10 text-white/70 hover:bg-white/[0.06] shrink-0"
          >
            <Copy className="h-3.5 w-3.5" />
            {copied ? "Link copied!" : "Copy share link"}
          </Button>
        </div>

      </main>
    </div>
  );
}

// ─── Lead Capture Card ────────────────────────

function LeadCaptureCard({ reportId, report }: { reportId: string; report: FullAuditReport }) {
  const [email, setEmail] = useState("");
  const [honeypot, setHoneypot] = useState(""); // bot trap — should stay empty
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setErrorMsg("Please enter a valid email.");
      return;
    }
    setStatus("loading");
    setErrorMsg("");

    try {
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          reportId,
          reportUrl: `${appUrl}/report/${reportId}`,
          estimatedSavings: report.monthlyWaste,
          totalSpend: report.totalSpend,
          score: report.score,
          source: "report_cta",
          website: honeypot, // honeypot — bots fill this; humans don't
        }),
      });
      const data = (await res.json()) as { success: boolean };
      if (data.success) setStatus("success");
      else { setStatus("error"); setErrorMsg("Something went wrong. Please try again."); }
    } catch {
      setStatus("error");
      setErrorMsg("Something went wrong. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-6 text-center space-y-2">
        <CheckCircle2 className="h-7 w-7 text-emerald-400 mx-auto" />
        <p className="text-sm font-semibold text-white/90">You&apos;re on the list!</p>
        <p className="text-xs text-white/40">
          We&apos;ll send your optimization summary and alert you to new savings opportunities.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/[0.03] p-5 sm:p-6 space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20">
          <Sparkles className="h-4 w-4 text-indigo-400" />
        </div>
        <div className="space-y-0.5">
          <p className="text-sm font-semibold text-white/90">Get your implementation plan</p>
          <p className="text-xs text-white/40">We&apos;ll email you a step-by-step guide for each recommendation.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {[
          { icon: <Mail className="h-3 w-3" />, text: "Export-ready PDF report" },
          { icon: <Bell className="h-3 w-3" />, text: "Spend change alerts" },
          { icon: <TrendingDown className="h-3 w-3" />, text: "Monthly savings digest" },
        ].map(({ icon, text }) => (
          <div key={text} className="flex items-center gap-2 rounded-lg bg-white/[0.03] border border-white/[0.06] px-3 py-2">
            <span className="text-indigo-400">{icon}</span>
            <span className="text-[11px] text-white/50">{text}</span>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        {/* Honeypot: hidden from real users via CSS, bots fill it automatically */}
        <input
          type="text"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          tabIndex={-1}
          aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", opacity: 0, pointerEvents: "none" }}
          autoComplete="off"
        />
        <input
          ref={inputRef}
          type="email"
          value={email}
          onChange={(e) => { setEmail(e.target.value); setErrorMsg(""); }}
          placeholder="you@company.com"
          className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-white/80 placeholder:text-white/25 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/30 transition-colors"
          disabled={status === "loading"}
        />
        <Button
          type="submit"
          disabled={status === "loading"}
          className="bg-indigo-500 text-white hover:bg-indigo-400 shadow-[0_0_16px_rgba(99,102,241,0.3)] shrink-0 gap-2"
        >
          {status === "loading" ? (
            <><Loader2 className="h-3.5 w-3.5 animate-spin" />Sending…</>
          ) : "Send plan"}
        </Button>
      </form>
      {errorMsg && <p className="text-[11px] text-red-400">{errorMsg}</p>}
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
        "rounded-xl border px-3 sm:px-4 py-4 sm:py-5 text-center space-y-1.5",
        emerald
          ? "border-emerald-500/20 bg-emerald-500/[0.04] shadow-[0_0_20px_rgba(16,185,129,0.06)]"
          : danger
          ? "border-red-500/20 bg-[#1f1f27]"
          : "border-white/[0.07] bg-[#1f1f27]"
      )}
    >
      <p
        className={cn(
          "text-xl sm:text-2xl font-semibold tabular-nums tracking-tight",
          emerald
            ? "text-emerald-400"
            : danger
            ? "text-red-400"
            : "text-white/90"
        )}
      >
        {value}
      </p>
      <div>
        <p className="label-caps text-[9px] sm:text-[10px]">{label}</p>
        {sub && <p className="text-[9px] sm:text-[10px] text-white/30 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function RecommendationCard({ rec }: { rec: AuditRecommendation }) {
  const sev =
    SEV_CONFIG[rec.severity as keyof typeof SEV_CONFIG] ?? SEV_CONFIG.low;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-4 sm:p-5 space-y-3 sm:space-y-4",
        sev.borderCls,
        sev.bgCls
      )}
    >
      {/* Left accent bar */}
      <div
        className={cn(
          "absolute left-0 top-4 bottom-4 w-0.5 rounded-full",
          sev.accentCls
        )}
      />

      <div className="pl-3 flex items-start gap-3">
        <span className={cn("mt-0.5 shrink-0", sev.iconCls)}>{sev.icon}</span>
        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-white/90 leading-none">
              {rec.title}
            </p>
            <span className="inline-flex items-center rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/50 ring-1 ring-white/10">
              {rec.category}
            </span>
          </div>
          <p className="text-xs text-white/50 leading-relaxed">{rec.description}</p>
        </div>
      </div>

      <div className="pl-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-t border-white/[0.06] pt-3">
        <div className="flex items-center gap-3">
          <p className="text-xs text-white/40">
            Est. saving:{" "}
            <span className="font-semibold text-emerald-400">
              ${Math.round(rec.estimatedSavings).toLocaleString()}/mo
            </span>
          </p>
          <p className="text-xs text-white/30">
            {rec.confidence}% confidence
          </p>
        </div>
        <span className="text-[11px] font-medium text-white/50 bg-white/[0.06] rounded-md px-2.5 py-1 self-start sm:self-auto">
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
        No major overlaps or waste detected. Your team is spending efficiently.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3">
      <Loader2 className="h-5 w-5 animate-spin text-white/20" />
      <p className="text-xs text-white/30">Loading your report…</p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  const router = useRouter();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-4 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/[0.08]">
        <AlertTriangle className="h-6 w-6 text-red-400" />
      </div>
      <div className="space-y-1.5 max-w-xs">
        <p className="text-sm font-medium text-white/80">{message}</p>
        <p className="text-xs text-white/30">
          Reports are private to your browser by default. Share the link to
          make them public.
        </p>
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
