## What this PR does

This PR adds a complete live re-audit workflow to StackAudit. Audits are now persisted with pricing snapshots, monitored for pricing drift, and automatically re-evaluated when tool pricing changes. Affected users receive a consolidated email notification with a one-click re-audit link that opens a visual diff between the old and updated audit.

The feature turns StackAudit from a one-time calculator into a continuously updated audit system.

---

## Why

AI tooling pricing changes frequently, especially across products like Cursor, Claude, ChatGPT, and Copilot. A static audit becomes stale quickly and can produce outdated recommendations or inaccurate savings estimates.

This feature assumes users care less about a snapshot score and more about staying continuously optimized as the tooling market evolves.

---

## How it works

### Persistent Storage
Each generated audit now stores:
- audit id
- user email
- input stack JSON
- audit result JSON
- pricing snapshot JSON
- pricing version
- timestamp

These are persisted in Supabase and linked to the public report URL.

### Pricing Change Detection
A deterministic backend engine compares historic pricing snapshots against the current pricing source of truth.

When pricing changes:
- the original audit is re-run
- recommendations are diffed
- score delta + savings delta are calculated
- unchanged audits are ignored to prevent spam

### Notification Flow
Affected audits are grouped by user email.

One consolidated email per user is sent through Resend containing:
- what pricing changed
- affected recommendations
- updated savings impact
- a direct re-audit link

### Re-Audit Diff View
The `/re-audit/[id]` route dynamically compares:
- original audit
- newly generated audit

The UI highlights:
- added recommendations
- removed recommendations
- changed savings
- score delta
- total savings delta

---

## What I cut

- I did not add unsubscribe links because the value/effort ratio under the 36h constraint favored shipping the complete diff workflow first.
- I skipped scheduled cron automation and used a manual trigger endpoint (`/api/detect-changes`) because it was faster to verify end-to-end reliably during development.
- I did not build a full admin dashboard for pricing-change analytics or email metrics.
- I skipped persistent storage of re-audit versions to avoid duplicating large audit payloads unnecessarily during the time window.
- I did not add CSV import support for audit inputs because the assignment emphasized the pricing-change lifecycle more than ingestion UX.

---

## How to test it manually

1. Run the application locally or open the deployed URL.
2. Generate a new audit report.
3. Submit an email using the lead capture form.
4. Verify the audit row is persisted in Supabase with:
   - pricing snapshot
   - audit result
   - user email
5. Modify a value in:
   `lib/pricing/current-pricing.ts`
6. Trigger:
   `POST /api/detect-changes`
7. Verify:
   - affected audit count increases
   - email is received
8. Click the re-audit link from the email.
9. Verify the diff page displays:
   - old vs new recommendations
   - score delta
   - savings delta
   - pricing changes

---

## What's tested

Automated tests included:
- pricing snapshot diff detection
- recommendation diff generation
- grouped notification batching
- re-audit generation logic
- detect-invalidated-audits orchestration
- detect-changes API endpoint
- resend email workflow

All tests pass successfully along with:
- `npm run lint`
- `npm test`
- `npx tsc --noEmit`

---

## Open questions / risks

- Pricing data is currently maintained manually in a centralized pricing file. A production system would likely require automated vendor scraping or admin tooling.
- Large-scale re-audits could create spikes in email volume without batching/rate-limiting infrastructure.
- The diff engine currently assumes recommendation IDs remain stable across audit-engine versions.