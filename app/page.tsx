import Link from "next/link";
import type { Metadata } from "next";
import {
  Sparkles,
  ArrowRight,
  Users,
  BarChart3,
  Share2,
  ShieldCheck,
  TrendingDown,
  CheckCircle,
  ChevronRight,
  AlertCircle,
  TerminalSquare
} from "lucide-react";

export const metadata: Metadata = {
  title: "StackAudit — AI Spend Optimization for Startups",
  description:
    "Find and eliminate wasted AI tool spending. StackAudit audits your subscriptions, detects overlapping tools, and surfaces concrete savings in minutes — free.",
};

// ─── Shared primitives ────────────────────────────────────────────────────────

function Container({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-white/30">
      {children}
    </p>
  );
}

// ─── 1. Navbar ────────────────────────────────────────────────────────────────

function Navbar() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#13131b]/80 backdrop-blur-xl">
      <Container>
        <div className="flex h-14 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-white/90 transition-opacity hover:opacity-70">
            <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]">
              <Sparkles className="h-3.5 w-3.5" />
            </div>
            StackAudit
          </Link>

          {/* CTA */}
          <Link
            href="/audit"
            className="flex items-center gap-1.5 rounded-lg bg-indigo-500 px-3.5 py-2 text-sm font-medium text-white shadow-[0_0_16px_rgba(99,102,241,0.3)] transition-all hover:bg-indigo-400 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)]"
          >
            Run Free Audit
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </Container>
    </header>
  );
}

// ─── 2. Hero & Product Preview ────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative pt-28 pb-20 overflow-hidden">
      {/* Background glow */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 flex items-center justify-center">
        <div className="h-[500px] w-[800px] rounded-full bg-indigo-600/[0.06] blur-[100px]" />
      </div>

      <Container className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        {/* Left: Copy */}
        <div className="flex flex-col items-start gap-6 text-left">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/[0.08] px-3 py-1">
            <span className="text-indigo-400 text-[10px] tracking-wider uppercase font-semibold">Free for teams under 10</span>
          </div>

          <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.03em] text-white/95 sm:text-5xl lg:text-6xl">
            Stop paying for <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-white/50">
              redundant AI tools.
            </span>
          </h1>

          <p className="max-w-md text-lg text-white/45 leading-relaxed">
            StackAudit scans your tool stack, detects overlapping capabilities, and surfaces concrete monthly savings in minutes.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/audit"
              className="flex items-center gap-2 rounded-lg bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all hover:bg-indigo-400 hover:shadow-[0_0_28px_rgba(99,102,241,0.4)]"
            >
              Start scanning
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#how-it-works"
              className="flex items-center gap-2 rounded-lg border border-white/[0.12] bg-white/[0.02] px-6 py-3 text-sm font-medium text-white/60 transition-all hover:bg-white/[0.05] hover:text-white/80"
            >
              See how it works
            </Link>
          </div>
          <p className="text-xs text-white/25 mt-2">
            ★ Trusted by operations teams at 200+ startups
          </p>
        </div>

        {/* Right: Premium Product Mockup */}
        <div className="relative w-full max-w-lg mx-auto lg:mx-0 lg:ml-auto">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-b from-indigo-500/20 to-transparent blur-xl opacity-50" />
          <div className="relative rounded-2xl border border-white/[0.08] bg-[#1a1a24] p-5 shadow-2xl flex flex-col gap-4">
            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/[0.06] pb-4">
              <div>
                <p className="text-[10px] font-semibold text-white/30 uppercase tracking-widest">Audit Result</p>
                <p className="text-white/90 font-medium mt-0.5">Engineering Team Stack</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] font-semibold text-emerald-400/70 uppercase tracking-widest">Score</p>
                <p className="text-2xl font-bold text-emerald-400 tabular-nums leading-none mt-0.5">42<span className="text-sm text-emerald-400/50 font-normal">/100</span></p>
              </div>
            </div>

            {/* Savings Callout */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.04] p-4 flex justify-between items-center">
              <div>
                <p className="text-emerald-400 font-semibold tabular-nums text-xl">$680</p>
                <p className="text-[10px] text-white/40 uppercase tracking-wide mt-0.5">Est. Monthly Savings</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <TrendingDown className="h-4 w-4" />
              </div>
            </div>

            {/* Rec Card */}
            <div className="relative overflow-hidden rounded-xl border border-red-500/20 bg-red-500/[0.04] p-4 pl-5">
              <div className="absolute left-0 top-3 bottom-3 w-0.5 rounded-full bg-red-500" />
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <p className="text-sm font-semibold text-white/90">ChatGPT & Claude Overlap</p>
                </div>
                <span className="rounded-md bg-red-500/15 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-red-400 ring-1 ring-red-500/20">
                  Consolidate
                </span>
              </div>
              <p className="text-[11px] text-white/40 leading-relaxed mb-3">
                Both tools are licensed for the same 12 users, resulting in duplicate capabilities.
              </p>
              <div className="flex items-center justify-between border-t border-white/[0.06] pt-3">
                <p className="text-[11px] text-white/40">Waste: <span className="text-red-400 font-semibold">$216/mo</span></p>
                <span className="text-[10px] font-medium text-white/50 bg-white/[0.06] rounded px-2 py-1">Cancel Claude Pro</span>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ─── 3. Overlap Visualization ─────────────────────────────────────────────────

function OverlapVisualization() {
  return (
    <section className="border-y border-white/[0.06] bg-[#0f0f17] py-24">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Context */}
          <div className="space-y-6 order-2 lg:order-1">
            <SectionLabel>Deep Scan Analysis</SectionLabel>
            <h2 className="text-3xl font-semibold tracking-[-0.02em] text-white/95 leading-tight sm:text-4xl">
              We find the overlaps hiding in your stack.
            </h2>
            <p className="text-white/45 text-sm leading-relaxed max-w-md">
              Most teams pay for the same AI capabilities 2-3 times over. Our deterministic engine maps feature sets across tools to highlight exactly where your budget is going to waste.
            </p>
            <ul className="space-y-3 pt-2">
              {[
                "LLM capability mapping (GPT-4 vs Claude 3.5)",
                "Coding assistant overlap (Cursor vs Copilot)",
                "Underutilized seats and abandoned trials"
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-white/60">
                  <span className="mt-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500/10 text-indigo-400 text-[10px]">
                    <CheckCircle className="h-3 w-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Dashboard Mockup */}
          <div className="order-1 lg:order-2">
            <div className="rounded-xl border border-white/[0.08] bg-[#1a1a24] shadow-lg overflow-hidden">
              <div className="bg-[#13131b] border-b border-white/[0.06] px-5 py-3 flex items-center justify-between">
                <p className="text-xs font-medium text-white/60 flex items-center gap-2">
                  <BarChart3 className="h-3.5 w-3.5" /> Overlap Detection
                </p>
                <div className="flex items-center gap-1.5">
                  <div className="h-2 w-2 rounded-full bg-red-400 animate-pulse" />
                  <span className="text-[10px] text-red-400 uppercase tracking-widest font-semibold">Issues Found</span>
                </div>
              </div>

              <div className="p-5 space-y-5">
                {/* Overlap Item 1 */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                      <span className="text-base">🤖</span>
                      <p className="text-sm font-medium text-white/80">ChatGPT</p>
                      <span className="text-white/30 text-xs">vs</span>
                      <span className="text-base">🧠</span>
                      <p className="text-sm font-medium text-white/80">Claude</p>
                    </div>
                    <p className="text-xs font-semibold text-red-400">85% Overlap</p>
                  </div>
                  {/* Custom progress bar */}
                  <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden flex">
                    <div className="h-full bg-red-400/80 w-[85%] rounded-r-full" />
                    <div className="h-full bg-white/[0.1] w-[15%]" />
                  </div>
                </div>

                {/* Overlap Item 2 */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-end">
                    <div className="flex items-center gap-2">
                      <span className="text-base">⚡</span>
                      <p className="text-sm font-medium text-white/80">Cursor</p>
                      <span className="text-white/30 text-xs">vs</span>
                      <span className="text-base">🐙</span>
                      <p className="text-sm font-medium text-white/80">Copilot</p>
                    </div>
                    <p className="text-xs font-semibold text-red-400">92% Overlap</p>
                  </div>
                  <div className="h-2 w-full bg-white/[0.04] rounded-full overflow-hidden flex">
                    <div className="h-full bg-red-400/80 w-[92%] rounded-r-full" />
                    <div className="h-full bg-white/[0.1] w-[8%]" />
                  </div>
                </div>

                <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3 flex justify-between items-center mt-2">
                  <p className="text-xs text-white/50">Projected Waste</p>
                  <p className="text-sm font-mono text-red-400 font-semibold">$596.00/mo</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ─── 4. Bento Feature Grid ────────────────────────────────────────────────────

function FeatureBento() {
  return (
    <section className="py-28 bg-[#13131b]">
      <Container>
        <div className="mb-12 flex flex-col items-center gap-3 text-center">
          <SectionLabel>Why StackAudit</SectionLabel>
          <h2 className="text-3xl font-semibold tracking-[-0.02em] text-white/95 sm:text-4xl">
            Intelligence built for operations.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[minmax(200px,auto)]">
          {/* Card 1: Large */}
          <div className="md:col-span-2 rounded-2xl border border-white/[0.07] bg-[#1f1f27] p-8 flex flex-col justify-between overflow-hidden relative group">
            <div className="relative z-10 space-y-2 max-w-sm">
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 mb-4">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white/90">Rule-based audit engine</h3>
              <p className="text-sm text-white/40 leading-relaxed">
                We don&apos;t use generic AI to guess. Our deterministic engine applies 11 strict logic rules to find exact inefficiencies based on real-world SaaS pricing.
              </p>
            </div>
            {/* Decorative background element */}
            <div className="absolute right-0 bottom-0 opacity-10 translate-x-1/4 translate-y-1/4 transition-transform duration-500 group-hover:scale-110">
              <TerminalSquare className="h-64 w-64 text-indigo-500" />
            </div>
          </div>

          {/* Card 2: Small */}
          <div className="rounded-2xl border border-white/[0.07] bg-[#1f1f27] p-8 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
                <Users className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white/90">Seat rightsizing</h3>
              <p className="text-sm text-white/40 leading-relaxed">
                Compare licensed seats vs actual team size to instantly flag costly overprovisioning.
              </p>
            </div>
          </div>

          {/* Card 3: Small */}
          <div className="rounded-2xl border border-white/[0.07] bg-[#1f1f27] p-8 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                <TrendingDown className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white/90">Stage-aware</h3>
              <p className="text-sm text-white/40 leading-relaxed">
                Recommendations adapt based on whether you&apos;re a 5-person Seed team or a 50-person Series B.
              </p>
            </div>
          </div>

          {/* Card 4: Large */}
          <div className="md:col-span-2 rounded-2xl border border-white/[0.07] bg-[#1f1f27] p-8 flex flex-col justify-between relative overflow-hidden">
            <div className="relative z-10 space-y-2 max-w-sm">
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
                <Share2 className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-white/90">Shareable public reports</h3>
              <p className="text-sm text-white/40 leading-relaxed">
                Generate a unique, read-only link for your audit. Perfect for sending to finance teams, investors, or department heads to justify consolidation.
              </p>
            </div>
            {/* Visual snippet */}
            <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:block w-48 rounded-lg border border-white/[0.08] bg-[#13131b] p-3 shadow-xl">
              <p className="text-[10px] text-white/30 uppercase tracking-widest mb-2">Share Link</p>
              <div className="flex bg-white/[0.04] rounded border border-white/[0.06] p-1.5 items-center gap-2">
                <div className="w-full h-1.5 bg-white/20 rounded-full" />
                <div className="w-4 h-4 bg-indigo-500 rounded text-[8px] flex items-center justify-center text-white">✓</div>
              </div>
            </div>
          </div>

        </div>
      </Container>
    </section>
  );
}

// ─── 5. How it works (Vertical) ───────────────────────────────────────────────

function HowItWorks() {
  return (
    <section id="how-it-works" className="border-t border-white/[0.06] py-28 bg-[#0f0f17]">
      <Container>
        <div className="mb-16 text-center">
          <SectionLabel>Process</SectionLabel>
          <h2 className="text-3xl font-semibold tracking-[-0.02em] text-white/95 sm:text-4xl mt-3">
            Audit your stack in 3 steps.
          </h2>
        </div>

        <div className="max-w-3xl mx-auto space-y-12">
          {/* Step 1 */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
            <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-400 font-bold tabular-nums text-sm shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              1
            </div>
            <div className="flex-1 space-y-4 pt-1">
              <div>
                <h3 className="text-xl font-semibold text-white/90">Select your active tools</h3>
                <p className="text-sm text-white/45 mt-1">Pick every AI subscription your team is currently paying for from our database.</p>
              </div>
              <div className="flex gap-2 flex-wrap">
                {["ChatGPT", "Cursor", "Midjourney", "Notion AI"].map(t => (
                  <span key={t} className="rounded-md border border-indigo-500/30 bg-indigo-500/[0.08] px-2.5 py-1 text-xs text-indigo-200">✓ {t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
            <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full border border-white/[0.1] bg-white/[0.03] text-white/40 font-bold tabular-nums text-sm">
              2
            </div>
            <div className="flex-1 space-y-4 pt-1">
              <div>
                <h3 className="text-xl font-semibold text-white/90">Input spend & usage</h3>
                <p className="text-sm text-white/45 mt-1">Enter your actual seat counts and monthly costs. We pre-fill typical SaaS pricing.</p>
              </div>
              <div className="rounded-lg border border-white/[0.08] bg-[#1f1f27] p-3 max-w-sm flex justify-between items-center">
                <span className="text-sm text-white/70">Seats</span>
                <span className="text-sm font-mono text-white bg-[#13131b] border border-white/[0.1] px-3 py-1 rounded">12</span>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
            <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-full border border-white/[0.1] bg-white/[0.03] text-white/40 font-bold tabular-nums text-sm">
              3
            </div>
            <div className="flex-1 space-y-4 pt-1">
              <div>
                <h3 className="text-xl font-semibold text-white/90">Get optimization report</h3>
                <p className="text-sm text-white/45 mt-1">Receive a scored dashboard with specific, actionable recommendations to cut costs.</p>
              </div>
              <Link href="/audit" className="inline-flex items-center gap-1.5 text-sm font-medium text-indigo-400 hover:text-indigo-300 group">
                View sample report <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}


// ─── 7. CTA Banner ────────────────────────────────────────────────────────────

function CTABanner() {
  return (
    <section className="border-t border-white/[0.06] py-24 bg-[#13131b]">
      <Container>
        <div className="relative overflow-hidden rounded-2xl border border-indigo-500/20 bg-[#1f1f27] px-8 py-16 text-center shadow-[0_0_60px_rgba(99,102,241,0.07)]">
          {/* Subtle radial */}
          <div className="pointer-events-none absolute inset-0 flex justify-center">
            <div className="h-full w-full max-w-2xl rounded-full bg-indigo-600/[0.05] blur-[80px]" />
          </div>

          <div className="relative z-10 flex flex-col items-center gap-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-indigo-500/20 bg-indigo-500/10">
              <Sparkles className="h-5 w-5 text-indigo-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-3xl font-semibold tracking-[-0.02em] text-white/95 sm:text-4xl">
                Ready to trim your AI stack?
              </h2>
              <p className="text-base text-white/40">
                Takes 3 minutes. No credit card. No account required.
              </p>
            </div>

            <Link
              href="/audit"
              className="mt-2 flex items-center gap-2 rounded-lg bg-indigo-500 px-8 py-3.5 text-sm font-semibold text-white shadow-[0_0_20px_rgba(99,102,241,0.3)] transition-all hover:bg-indigo-400 hover:shadow-[0_0_28px_rgba(99,102,241,0.45)]"
            >
              Run Free Audit
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}

// ─── 8. Footer ────────────────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] py-8 bg-[#0f0f17]">
      <Container>
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-sm font-bold text-white/50 transition-colors hover:text-white/70">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-indigo-500/80">
              <Sparkles className="h-3 w-3 text-white" />
            </div>
            StackAudit
          </Link>

          {/* Tagline */}
          <p className="text-[11px] text-white/20 tracking-wider uppercase font-semibold">Intelligence for operations</p>

          {/* Links */}
          <div className="flex items-center gap-5">
            <Link href="/audit" className="text-xs text-white/30 transition-colors hover:text-white/60">
              Audit
            </Link>
            <Link href="#" className="text-xs text-white/30 transition-colors hover:text-white/60">
              Privacy
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}

// ─── Page assembly ────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#13131b] selection:bg-indigo-500/30">
      <Navbar />
      <Hero />
      <OverlapVisualization />
      <FeatureBento />
      <HowItWorks />
      <CTABanner />
      <Footer />
    </div>
  );
}
