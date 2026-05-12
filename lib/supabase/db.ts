// ─────────────────────────────────────────────
// Database Layer — Report Persistence
//
// Strategy:
//   1. Always write to localStorage (instant, offline-safe)
//   2. If Supabase is configured → also write to DB (shareable)
//   3. On read: try DB first, fall back to localStorage
// ─────────────────────────────────────────────

import { supabase, isSupabaseConfigured } from "./client";
import type { FullAuditReport } from "@/lib/audit-engine/types";

export const REPORT_STORAGE_PREFIX = "stackaudit:report:";

// ─── Persist ──────────────────────────────────

export async function persistReport(report: FullAuditReport): Promise<void> {
  // 1. Always write to localStorage for instant local access
  try {
    localStorage.setItem(
      `${REPORT_STORAGE_PREFIX}${report.id}`,
      JSON.stringify(report)
    );
    // Maintain a recent-audits index (max 10)
    const recentRaw = localStorage.getItem("stackaudit:recent") ?? "[]";
    const recent: string[] = JSON.parse(recentRaw);
    const updated = [report.id, ...recent.filter((id) => id !== report.id)].slice(0, 10);
    localStorage.setItem("stackaudit:recent", JSON.stringify(updated));
  } catch {
    // Storage quota exceeded — non-fatal
  }

  // 2. If Supabase is configured, also persist to DB
  if (!isSupabaseConfigured || !supabase) return;

  try {
    await supabase.from("reports").upsert({
      id: report.id,
      score: report.score,
      total_spend: report.totalSpend,
      monthly_waste: report.monthlyWaste,
      total_savings: report.totalRecoverableSavings,
      critical_count: report.criticalIssueCount,
      team_size: report.input.teamSize,
      active_tools: report.activeToolsCount,
      payload: report as unknown as Record<string, unknown>,
    });
  } catch (err) {
    // Non-fatal: DB write failed, localStorage still has data
    console.warn("[StackAudit] DB persist failed:", err);
  }
}

// ─── Fetch ────────────────────────────────────

export async function fetchReport(id: string): Promise<FullAuditReport | null> {
  // 1. Try DB first if Supabase is configured
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("payload")
        .eq("id", id)
        .single();

      if (!error && data?.payload) {
        return data.payload as FullAuditReport;
      }
    } catch {
      // Fall through to localStorage
    }
  }

  // 2. Fall back to localStorage
  try {
    const raw = localStorage.getItem(`${REPORT_STORAGE_PREFIX}${id}`);
    if (raw) return JSON.parse(raw) as FullAuditReport;
  } catch {
    return null;
  }

  return null;
}

// ─── Lead Capture ─────────────────────────────

export type LeadSource = "report_cta" | "report_export";

export async function submitLead(
  email: string,
  reportId: string,
  source: LeadSource = "report_cta"
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    // Supabase not configured — simulate success in dev
    console.log("[StackAudit] Lead captured (no DB):", { email, reportId, source });
    return { success: true };
  }

  try {
    const { error } = await supabase.from("leads").insert({
      email,
      report_id: reportId,
      source,
    });

    if (error) {
      // Duplicate email is fine — don't surface error to user
      if (error.code === "23505") return { success: true };
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}
