# Contract Clause Intelligence

Frontend (v0.1) for a legal contract review tool. Sample data only: no Supabase, no AI yet.

## Run
```bash
npm install
cp .env.example .env
npm run dev      # http://localhost:5173
npm test         # unit tests for filter logic
npm run build
```

## Structure
- `src/config`: constants (filters, nav, risk labels)
- `src/data`: sample data (replaced by Supabase later)
- `src/utils`: pure logic (`clauseFilters`, `metrics`, `logger`)
- `src/hooks`: stateful logic (`useClauseReview`)
- `src/components`: presentational UI
- `src/styles`: design tokens and layout

## Debugging
Logs are scoped (`[App]`, `[useClauseReview]`). Set the level via `VITE_LOG_LEVEL` or at runtime:
`localStorage.setItem('cci:logLevel', 'debug')`, then reload. Render errors are caught by `ErrorBoundary` and logged.

## Next
Supabase storage for contracts, upload flow, and AI clause analysis that returns the same shape as `sampleData.js`.

## Backend (v0.2)
```bash
cd server && npm install && cp .env.example .env   # add GEMINI_API_KEY (or set LLM_PROVIDER=anthropic)
npm run dev          # API on :8787
# in another terminal, from the repo root:
npm run dev
```
Flow: upload -> extract text -> chunk -> LLM (JSON) -> validate (drops quotes not found in the contract) -> UI.
Swap providers via `LLM_PROVIDER`. Add one in `server/src/providers/`. Keys live only in `server/.env`.

### Resilience
Gemini calls retry with backoff, then try `GEMINI_FALLBACK_MODELS`, then fall back to the built-in rule engine (`server/src/services/ruleEngine.js`). Set `LLM_PROVIDER=rules` to run without AI.

## v0.3: role-based review
Upload -> pick Buyer/Client or Service Provider/Vendor -> findings are judged relative to that role (favourable / unfavourable / neutral), scored 0-100, with negotiation priorities. The rule-engine fallback is role-aware too.
