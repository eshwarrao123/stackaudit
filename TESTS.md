# Automated Test Suite

StackAudit uses **Vitest** for all automated testing, focusing primarily on the integrity of the deterministic audit engine.

## Test Coverage
The test suite ensures that every optimization rule correctly identifies waste and provides accurate savings estimates based on current SaaS pricing data.

### 1. `llm-overlap.test.ts`
- **Purpose**: Verifies detection of redundant LLM subscriptions (e.g., ChatGPT Plus and Claude Pro).
- **Cases**: Single tool (no overlap), double tool (overlap detected), waste calculation (cheapest tool is waste), recommendation logic.

### 2. `coding-overlap.test.ts`
- **Purpose**: Ensures coding assistants like Cursor and GitHub Copilot are flagged when used simultaneously.
- **Cases**: Copilot solo, Cursor solo, dual usage detection, confidence score validation.

### 3. `excess-seats.test.ts`
- **Purpose**: Validates the logic that compares tool seat counts against the reported team size.
- **Cases**: Seats = Team (ok), Seats < Team (ok), Seats > Team (flagged), waste calculation per excess seat.

### 4. `low-usage.test.ts`
- **Purpose**: Tests the sensitivity of usage-frequency flagging.
- **Cases**: Daily/Weekly usage (ok), Monthly usage (downgrade recommended), Rare usage (cancel recommended), high-spend threshold logic.

### 5. `scoring.test.ts`
- **Purpose**: Validates the global optimization score (0-100).
- **Cases**: Zero-waste stack (100 score), high-waste stack (low score), total spend aggregation, recommendation deduplication.

## Running Tests

### Local Execution
To run the full test suite once:
```bash
npm test
```

To run tests in watch mode during development:
```bash
npm run test:watch
```

## CI Integration
StackAudit is integrated with **GitHub Actions**. Every pull request and push to the `main` branch triggers a workflow that executes:
1. `npm install`
2. `npm run lint` (ESLint check)
3. `npx tsc --noEmit` (TypeScript validation)
4. `npm test` (Vitest engine tests)

Deployments to Vercel are automatically blocked if the CI pipeline fails, ensuring the production environment is always stable and deterministic.
