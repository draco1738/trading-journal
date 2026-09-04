# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Northstar is initially for one active trader, Zane, operating from a Windows desktop. The data and authorization model must not prevent a secure multiuser version later.

## Product Purpose

Northstar is a private trading operating system for manually planning futures trades, automatically importing trading activity, reconstructing complete trades, linking outcomes to their original plans, and surfacing repeatable strengths, weaknesses, discipline failures, and performance patterns.

Success means the trader can see the evidence that changes the next decision, create and lock a useful futures plan quickly, and review actual execution and P&L without maintaining the journal by hand.

## Positioning

Northstar connects a pre-trade plan to broker-sourced execution evidence and turns the combined record into specific behavioral coaching. Planning stays deliberate and manual; ingestion, reconstruction, measurement, and pattern detection do the automation.

## Operating Context

- Futures are traded through Sierra Chart on Windows, potentially using Rithmic connectivity.
- Stocks and options may later be ingested from Interactive Brokers, but the trade planner is futures-only.
- Sierra ingestion is scoped to the current Lucid account only; activity from other Lucid accounts must never enter its imports or analysis.
- The product must handle partial fills, scaling in and out, multiple accounts, overnight positions, futures contract changes, and eventually multi-leg options strategies.
- A direct connector is preferred where reliable, with CSV/manual fallback for reconciliation and unavailable integrations.
- PostgreSQL/Supabase is the system of record. Notion may expose selected journal information but is not the source of truth.

## Capabilities and Constraints

- Manual, modular futures trade-plan template with optional context modules.
- Plans can be locked before entry and revised through explicit versioning.
- Imported orders, executions, positions, commissions, and account data remain distinct from derived reconstructed trades.
- Reviews cover execution quality, risk management, discipline, and actual P&L.
- Daily, weekly, and monthly analysis prioritizes weaknesses, repeatable edges, and rule violations over generic greetings or vanity metrics.
- The primary desktop surface must remain usable at 110% browser zoom and avoid vertical sprawl.
- Contract selectors include both mini and micro futures.
- Do not present estimated cash risk as performance; show actual P&L when execution data exists.

## Brand Commitments

The product name is Northstar. The interface is dark, direct, dense, and analytical. Copy should sound like a trading desk, not a motivational productivity app.

## Evidence on Hand

- Working Next.js application and Supabase schema in this repository.
- Sierra current-account scope endpoint and tests.
- Synthetic starter-plan content for interaction design only; no imported performance claims should be fabricated.

## Product Principles

1. Evidence before narrative.
2. One current trading account means one isolated analytical scope.
3. Manual intention, automatic truth.
4. Compact enough for the live trading desk.
5. Raw broker records remain auditable and derived analysis remains rebuildable.

## Accessibility & Inclusion

Preserve keyboard access, visible focus, semantic labels, reduced-motion support, and sufficient contrast in the dense dark interface.
