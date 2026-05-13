# StackAudit

StackAudit is a deterministic AI spend optimization platform designed for startups. It analyzes SaaS usage, detects redundant subscriptions, and identifies unused seats to calculate estimated monthly waste and provide actionable consolidation recommendations.

## Problem Statement
Startups frequently suffer from subscription sprawl, particularly with emerging AI tools. Teams often pay for overlapping services (e.g., ChatGPT Plus and Claude Pro) or maintain excess seats for tools with low utilization, leading to significant capital waste. 

## Key Features
- **Overlap Detection**: Identifies redundant tools with overlapping feature sets (e.g., Copilot vs. Cursor).
- **Seat Optimization**: Flags underutilized licenses and excess seat allocations compared to team size.
- **Deterministic Engine**: Evaluates usage patterns against a strict set of rule-based logic to guarantee consistent scoring.
- **AI Summary**: Generates personalized executive summaries of the audit using OpenAI, with built-in deterministic fallbacks.
- **Report Persistence**: Saves shareable audit reports via Supabase with client-side local storage fallback.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Database**: Supabase (PostgreSQL)
- **AI**: OpenAI API
- **Email**: Resend
- **Testing**: Vitest

## Architecture Overview
StackAudit operates on a hybrid architecture. The client captures inputs using React Hook Form and Zod validation. The core audit logic executes deterministically on the server via Next.js API routes to ensure calculation integrity. Data is persisted to Supabase, and external services (OpenAI, Resend) are integrated securely via server-side endpoints.

## Local Setup Instructions

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Configure Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
RESEND_API_KEY=your_resend_api_key
```

3. Supabase Setup
Create a `reports` table in your Supabase project with the following schema:
- `id` (uuid, primary key)
- `data` (jsonb)
- `created_at` (timestamp)

4. Running the Application
```bash
npm run dev
```

## Testing Commands
Execute the deterministic engine test suite:
```bash
npm test
```
Run type checking and linting:
```bash
npx tsc --noEmit
npm run lint
```

## Deployment Instructions
The application is optimized for Vercel. 
1. Connect the repository to a Vercel project.
2. Add the environment variables in the Vercel dashboard.
3. Deploy the `main` branch.

## Future Improvements
- Implement caching layers for AI-generated summaries to reduce OpenAI API costs.
- Expand the deterministic engine ruleset to cover infrastructure and cloud provider overlap.
- Add user authentication for historical report tracking.

## Demo Screen Recording Video 
- https://www.loom.com/share/7b1bca719881457b85ce6565b625884b
