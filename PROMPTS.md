# Prompt Engineering & AI Usage

This document outlines the usage of AI tools during the development of StackAudit and the process for ensuring code quality and deterministic reliability.

## Overview
AI was used as a high-velocity pair programmer to scaffold UI components and draft initial logic templates. However, all AI-generated output was manually reviewed, refined, and in many cases, heavily refactored to meet production standards.

## UI Generation Prompts
- **Prompt Structure**: "Generate a multi-step audit form using Tailwind CSS and Radix UI primitives. Use a premium dark B2B aesthetic with glassmorphism effects."
- **Iteration**: The initial output was visually impressive but lacked responsive scaling for mobile. I had to manually adjust the grid layouts and font sizing for the mobile view.
- **Failure Case**: AI repeatedly failed to include `DialogTitle` in Radix `DialogContent` components, leading to accessibility warnings. I manually corrected this by injecting `VisuallyHidden` components across the UI library.

## Audit Engine Prompts
- **Prompt Structure**: "Draft a TypeScript function to detect overlapping costs between ChatGPT and Claude subscriptions based on a specific input interface."
- **Why structured this way**: To provide clear boundaries for the logic and ensure the output matched the existing TypeScript types.
- **Failure Case**: AI often suggested probabilistic "fuzzy" matching for tool names. I rejected this and implemented a strict, deterministic ID-based matching system to prevent hallucinations in cost calculations.

## Documentation Prompts
- **Prompt Structure**: "Review the `ARCHITECTURE.md` and suggest sections to improve technical clarity for a DevOps audience."
- **Output Correction**: The AI tended to use "marketing fluff." I manually stripped out phrases like "revolutionary AI-driven insights" and replaced them with technical descriptions like "deterministic rule-based optimization."

## Debugging Prompts
- **Prompt Structure**: "Explain why this Supabase insert is returning a 404 in a Next.js App Router environment."
- **Manual Correction**: AI suggested the route was incorrect. The actual issue was a hardcoded string in my environment variable configuration that the AI couldn't see. This required manual network log analysis to solve.

## Deterministic Risk Mitigation
To avoid AI hallucinations:
1. **Scaffold only**: AI was never allowed to write the final math for scoring.
2. **Strict Types**: The entire engine is bound by TypeScript interfaces that AI cannot deviate from.
3. **Unit Test Verification**: Every logic block drafted by AI was immediately subjected to the Vitest suite; if the test failed, the AI code was discarded and rewritten manually.
