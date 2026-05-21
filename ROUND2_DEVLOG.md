# ROUND2_DEVLOG

## 2026-05-20 10:15 — Started Round 2
Read the assignment PDF fully before touching code. Sketched the full flow on paper first because the requirements touched storage, scheduling, email delivery, and UI diff rendering together.

## 2026-05-20 10:45 — Decided on architecture
Chose to extend the existing Supabase-backed report flow instead of introducing a separate audit service. Wanted to keep the Round 2 feature integrated directly into the Round 1 data model.

## 2026-05-20 11:20 — Persistent snapshot implementation
Added pricing snapshot persistence to reports. Stored:
- input stack
- audit result
- pricing snapshot
- pricing version
- user email

Used deterministic pricing snapshots so historical audits remain reproducible.

## 2026-05-20 12:30 — First blocker
Hit Supabase migration issues because some RLS policies already existed from Round 1. Accidentally reran schema creation instead of isolated ALTER TABLE commands. Switched to incremental migrations instead.

## 2026-05-20 13:15 — Re-audit engine planning
Spent time deciding whether to store regenerated audits as new rows or generate them dynamically. Chose dynamic regeneration to avoid duplicated audit records and stale secondary snapshots.

## 2026-05-20 14:20 — Pricing diff engine
Built pricing comparison logic between stored snapshots and current pricing data. Added support for:
- price changes
- added tools
- removed tools

## 2026-05-20 15:40 — Recommendation diff system
Implemented structural recommendation diffing so the UI can show:
- added recommendations
- removed recommendations
- changed recommendations
- unchanged recommendations

Wanted the diff to feel understandable instead of just dumping JSON changes.

## 2026-05-20 17:10 — Testing re-audit orchestration
Built orchestration flow:
stored audits → pricing detection → re-run audit → diff generation → grouped notifications

Initially triggered too many unnecessary re-audits because score-only checks were insufficient. Added recommendation-level validation before sending notifications.

## 2026-05-20 18:30 — Grouped notification logic
Implemented user-level grouping to avoid sending multiple emails to the same user when several audits were affected by one pricing change.

## 2026-05-20 20:00 — Wrote automated tests
Added tests for:
- pricing change detection
- recommendation diffs
- grouped notifications
- API routes
- email flow

Focused more on deterministic backend logic than UI snapshot testing due to time constraints.

## 2026-05-20 23:15 — Slept
Slept approximately 23:15 → 07:00. Did not want to continue debugging exhausted because the assignment heavily depends on reasoning quality.

## 2026-05-21 08:40 — Email integration
Integrated Resend for transactional emails. Initially hit domain verification issues because the sender domain was not verified.

## 2026-05-21 09:20 — Email delivery fix
Switched sender temporarily to onboarding@resend.dev for reliable testing within the time constraint. Verified delivery successfully.

## 2026-05-21 10:30 — Re-audit UI implementation
Built side-by-side comparison UI for old vs new audit results. Added:
- savings delta
- score delta
- recommendation badges
- muted unchanged sections

## 2026-05-21 11:10 — Temporary debug route
Added a temporary debug API route to manually trigger invalidation detection locally while testing pricing changes.

## 2026-05-21 11:20 — CI failures
GitHub Actions failed due to stricter lint/typecheck rules than local environment. Fixed:
- unescaped entities
- explicit any usages
- unused variables

## 2026-05-21 12:00 — Removed debug route
Deleted temporary debug endpoint after verifying the full workflow worked end-to-end.

## 2026-05-21 12:40 — Production verification
Verified production flow manually:
1. Generate audit
2. Store report in Supabase
3. Submit email
4. Trigger pricing detection
5. Receive notification email
6. Open re-audit diff page

## 2026-05-21 13:00 — Final cleanup
Reviewed commit history, PR structure, and deployment stability. Avoided adding additional features after the core workflow stabilized.