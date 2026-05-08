# StackAudit Architecture

## Overview

StackAudit is a SaaS platform that analyzes startup AI-tool spending and generates optimization recommendations based on usage patterns, pricing plans, and overlapping subscriptions.

The architecture is designed for:
- Fast MVP development
- Clean separation of concerns
- Deterministic audit logic
- Scalability for future iterations

---

# Tech Stack

## Frontend
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui

## Backend
- Next.js API Routes

## Database
- Supabase (PostgreSQL)

## Validation
- Zod

## Forms
- React Hook Form

## Charts & UI
- Recharts
- Framer Motion

---

# Core Architecture

## Audit Engine

The audit engine is fully deterministic and rule-based.

Input:

Audit Input :
```txt
Input → Validation → Rules Engine → Scoring → Audit Report
```

Output:
```txt
AuditReport
```
