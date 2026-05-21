# ROUND2_REFLECTION

## 1. What was the most uncomfortable trade-off you made because of the time pressure?

The biggest trade-off was intentionally avoiding a fully automated scheduled cron system and using a manually triggerable detection endpoint instead. I originally explored Vercel Cron, but I realized quickly that spending several hours debugging deployment-specific scheduling issues would risk the core feature stability.

I prioritized deterministic re-audit correctness over infrastructure polish. The important thing for this assignment was making sure the actual workflow worked reliably end-to-end:
stored audit → pricing invalidation → email notification → visual diff.

That meant accepting a simpler trigger mechanism while protecting the quality of the detection engine and diff generation logic. If this were production software with more time, I would absolutely automate scheduling and add retry/monitoring infrastructure around email delivery and detection jobs.

## 2. If we extended the deadline by another 24 hours right now, what's the first thing you'd do?

The first thing I would do is redesign the pricing configuration system into a proper versioned pricing registry with change history tracking.

Right now, pricing snapshots are deterministic and reliable, but the current setup still assumes a relatively small static pricing dataset. With another 24 hours, I would create:
- structured pricing version records
- historical change logs
- admin tooling for updating prices safely
- audit replay tooling against any historical pricing version

That would make the re-audit system much more maintainable long-term and reduce the risk of accidental pricing mutations affecting historical comparisons.

I deliberately postponed this because the assignment reward was clearly weighted toward execution quality and complete workflow delivery rather than infrastructure sophistication.

## 3. Looking back at your Round 1 codebase as a now-experienced user of it: what's one thing your Round 1 self made harder for your Round 2 self?

My Round 1 self scattered pricing assumptions across multiple parts of the application instead of centralizing them behind a single pricing abstraction.

That became painful in Round 2 because the re-audit system depends entirely on deterministic historical pricing snapshots. I had to refactor several places where pricing values were effectively duplicated or indirectly embedded inside recommendation logic.

The biggest lesson for me was that systems become significantly harder to evolve when configuration and business logic are tightly coupled. Round 1 was optimized for shipping quickly. Round 2 forced me to think much more carefully about reproducibility, auditability, and long-term maintainability.

If I rebuilt Round 1 today, pricing would have been isolated behind a dedicated versioned pricing module from the beginning.