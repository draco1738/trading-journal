# Northstar

Northstar is a private trading operating system for manual futures planning, automated execution journaling, trade reconstruction, and evidence-based performance review.

## What works now

- Manual, modular futures plan editor
- Live point-risk, reward/risk, completeness, and actual P&L readouts
- Windows-local Sierra account detection with exact single-account activity-log scoping
- Local draft persistence
- Immutable plan locking with SHA-256 version snapshots
- Supabase authentication and cloud persistence
- Owner-scoped PostgreSQL schema with row-level security
- Raw source records separated from normalized orders, executions, positions, and reconstructed trades
- Data model for plan-to-trade links, reviews, and daily/weekly/monthly analysis

## Local development

1. Copy `.env.example` to `.env.local` and enter the Supabase project URL and publishable key.
2. Install dependencies with `pnpm install`.
3. Run `pnpm dev`.
4. Open `http://localhost:3000`.

Use `pnpm lint` and `pnpm build` before pushing changes.

## Database

Versioned SQL migrations live in `supabase/migrations`. Platform and broker source records are append-only through authenticated application permissions; derived trades can be rebuilt without rewriting raw history.

## Connectors

The app will use two independent ingestion paths:

- Sierra Chart: a Windows-local connector that observes local trade activity and syncs normalized records.
- Interactive Brokers: IB Gateway/TWS for live ingestion plus Flex Query/CSV for reconciliation and backfill.

Connector credentials and broker sessions must never be stored in the browser.

Northstar never treats the Sierra `TradeActivityLogs` directory as one account. The local scope endpoint resolves exactly one current trade account (or the explicit `SIERRA_ACCOUNT_ID` override), accepts only filenames ending in `.[current-account].data`, and rejects `None`, simulated, and every other account file before ingestion.
