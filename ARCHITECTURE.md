# Architecture

## System Overview
StackAudit follows a serverless architecture utilizing Next.js App Router. It separates presentation logic from business rules, ensuring that the audit engine remains isolated, testable, and strictly deterministic.

## Frontend Architecture
- **Framework**: React via Next.js App Router.
- **State Management**: React state and Context API, with local storage fallback.
- **Component Library**: Shadcn UI built on Radix primitives for accessibility.
- **Forms**: React Hook Form with Zod schema validation ensures strict type safety before data reaches the engine.

## Backend/API Architecture
- Next.js API routes (`app/api/*`) handle all external integrations to protect API keys.
- Endpoints are stateless and designed for edge compatibility where possible.

## Audit Engine Design
Located in `/lib/engine`, the engine is the core of the application.
- Uses a pipeline pattern: the input data passes through a series of isolated rule functions (e.g., `checkLLMOverlap`, `checkExcessSeats`).
- Each rule independently returns a recommendation or `null`.
- Recommendations are aggregated and deduplicated before final scoring.

## Rule-Based Scoring System
The scoring system calculates a health score from 0-100 based on the ratio of estimated monthly waste to total monthly spend. A score of 100 indicates perfect optimization (zero waste), while lower scores reflect higher redundancy and underutilization.

## Supabase Persistence Flow
1. The client submits audit data to the server.
2. The server inserts a new record into the Supabase `reports` table using the official `@supabase/supabase-js` SDK.
3. If the Supabase insertion fails (e.g., network timeout), the application gracefully degrades, storing the report in `localStorage` to ensure the user journey is not interrupted.

## AI Summary Flow
1. The frontend requests a summary from `/api/summary`.
2. The endpoint constructs a prompt based on the deterministic engine's output and queries the OpenAI API.
3. If OpenAI returns an error (e.g., `429 Too Many Requests`), the `catch` block intercepts the failure and instantly returns a pre-computed deterministic string, preventing UI failure.

## Email Workflow
- Lead capture is managed via `/api/leads`.
- Integrates with the Resend API for transactional email delivery.
- Implements a hidden honeypot field in the frontend form; if the honeypot is filled, the API silently rejects the request with a `200 OK` to prevent bot spam without requiring CAPTCHA.

## Testing Architecture
- **Vitest** is used for unit and integration testing.
- Tests are heavily concentrated on `/lib/engine` to guarantee that the deterministic rules correctly calculate waste and assign scores under all edge cases.

## Security Considerations
- All secrets (`OPENAI_API_KEY`, `RESEND_API_KEY`) are restricted to server-side execution.
- Strict Zod parsing on API routes prevents injection of malformed JSON payloads.
- Honeypot fields mitigate automated lead-capture abuse.

## Scalability Considerations
- The stateless Next.js API design scales horizontally automatically via Vercel.
- The deterministic engine is purely computational (no external I/O), allowing for extremely fast execution and high concurrency.
