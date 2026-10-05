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
