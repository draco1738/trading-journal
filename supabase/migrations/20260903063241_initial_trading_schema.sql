-- Northstar initial domain model.
-- Raw broker/platform facts are kept separate from derived trade reconstruction.

create schema if not exists private;
revoke all on schema private from public, anon, authenticated;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
security invoker
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  timezone text not null default 'America/New_York',
  base_currency text not null default 'USD' check (base_currency ~ '^[A-Z]{3}$'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.trading_accounts (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  source_system text not null check (source_system in ('sierra_chart', 'ibkr', 'csv', 'manual')),
  external_account_id text not null,
  display_name text not null,
  base_currency text not null default 'USD' check (base_currency ~ '^[A-Z]{3}$'),
  is_active boolean not null default true,
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (owner_id, source_system, external_account_id)
);

create table public.instruments (
  id bigint generated always as identity primary key,
  asset_class text not null check (asset_class in ('future', 'stock', 'option')),
  canonical_symbol text not null,
  description text,
  exchange text,
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  expiry_date date,
  strike numeric,
  option_right text check (option_right in ('call', 'put') or option_right is null),
  underlying_instrument_id bigint references public.instruments(id),
  contract_multiplier numeric not null default 1 check (contract_multiplier > 0),
  tick_size numeric check (tick_size > 0),
  tick_value numeric check (tick_value > 0),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  unique nulls not distinct (
    asset_class,
    canonical_symbol,
    exchange,
    expiry_date,
    strike,
    option_right
  )
);

create table public.trade_plans (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  account_id bigint references public.trading_accounts(id),
  instrument_id bigint references public.instruments(id),
  title text not null,
  status text not null default 'draft' check (status in ('draft', 'locked', 'cancelled', 'completed')),
  direction text not null check (direction in ('long', 'short', 'neutral')),
  session_name text,
  planned_entry numeric,
  hard_stop numeric,
  primary_target numeric,
  planned_quantity numeric check (planned_quantity > 0),
  max_risk_amount numeric check (max_risk_amount >= 0),
  risk_currency text not null default 'USD' check (risk_currency ~ '^[A-Z]{3}$'),
  thesis text not null,
  planned_for timestamptz,
  locked_at timestamptz,
  current_version integer not null default 0 check (current_version >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check ((status = 'locked' and locked_at is not null) or status <> 'locked')
);

comment on table public.trade_plans is
  'Manual futures trade plans only. Executions and journal records may cover other asset classes.';

create table public.trade_plan_versions (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  plan_id bigint not null references public.trade_plans(id) on delete cascade,
  version_number integer not null check (version_number > 0),
  snapshot jsonb not null check (jsonb_typeof(snapshot) = 'object'),
  snapshot_hash text not null,
  created_at timestamptz not null default now(),
  unique (plan_id, version_number),
  unique (plan_id, snapshot_hash)
);

create table public.import_jobs (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  account_id bigint references public.trading_accounts(id),
  connector text not null check (connector in ('sierra_connector', 'ib_gateway', 'flex_query', 'csv', 'manual')),
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'partial', 'failed')),
  cursor_before text,
  cursor_after text,
  records_seen bigint not null default 0 check (records_seen >= 0),
  records_accepted bigint not null default 0 check (records_accepted >= 0),
  diagnostics jsonb not null default '{}'::jsonb check (jsonb_typeof(diagnostics) = 'object'),
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.source_records (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  import_job_id bigint references public.import_jobs(id),
  account_id bigint references public.trading_accounts(id),
  source_system text not null check (source_system in ('sierra_chart', 'ibkr', 'csv', 'manual')),
  record_kind text not null check (record_kind in ('order', 'execution', 'position', 'commission', 'account', 'instrument')),
  source_record_id text not null,
  source_observed_at timestamptz,
  payload jsonb not null,
  payload_hash text not null,
  ingested_at timestamptz not null default now(),
  check (jsonb_typeof(payload) = 'object'),
  unique (owner_id, source_system, record_kind, source_record_id, payload_hash)
);

create table public.orders (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  account_id bigint not null references public.trading_accounts(id),
  instrument_id bigint not null references public.instruments(id),
  source_record_id bigint references public.source_records(id),
  source_order_id text not null,
  parent_source_order_id text,
  side text not null check (side in ('buy', 'sell')),
  order_type text,
  time_in_force text,
  requested_quantity numeric not null check (requested_quantity > 0),
  limit_price numeric,
  stop_price numeric,
  submitted_at timestamptz,
  status text,
  updated_at timestamptz not null default now(),
  unique (account_id, source_order_id)
);

create table public.executions (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  account_id bigint not null references public.trading_accounts(id),
  instrument_id bigint not null references public.instruments(id),
  order_id bigint references public.orders(id),
  source_record_id bigint references public.source_records(id),
  source_execution_id text not null,
  side text not null check (side in ('buy', 'sell')),
  quantity numeric not null check (quantity > 0),
  price numeric not null check (price >= 0),
  commission numeric not null default 0,
  fees numeric not null default 0,
  currency text not null default 'USD' check (currency ~ '^[A-Z]{3}$'),
  executed_at timestamptz not null,
  liquidity text,
  created_at timestamptz not null default now(),
  unique (account_id, source_execution_id)
);

create table public.position_snapshots (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  account_id bigint not null references public.trading_accounts(id),
  instrument_id bigint not null references public.instruments(id),
  source_record_id bigint references public.source_records(id),
  quantity numeric not null,
  average_price numeric,
  market_price numeric,
  unrealized_pnl numeric,
  captured_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (account_id, instrument_id, captured_at)
);

create table public.reconstruction_runs (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  account_id bigint references public.trading_accounts(id),
  algorithm_version text not null,
  matching_method text not null default 'fifo' check (matching_method in ('fifo', 'lifo', 'average_cost', 'specific_lot')),
  input_start_at timestamptz,
  input_end_at timestamptz,
  status text not null default 'queued' check (status in ('queued', 'running', 'succeeded', 'failed')),
  diagnostics jsonb not null default '{}'::jsonb check (jsonb_typeof(diagnostics) = 'object'),
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now()
);

create table public.reconstructed_trades (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  reconstruction_run_id bigint not null references public.reconstruction_runs(id),
  account_id bigint not null references public.trading_accounts(id),
  instrument_id bigint not null references public.instruments(id),
  strategy_group_key text,
  direction text not null check (direction in ('long', 'short')),
  opened_at timestamptz not null,
  closed_at timestamptz,
  opened_quantity numeric not null check (opened_quantity > 0),
  closed_quantity numeric not null default 0 check (closed_quantity >= 0),
  average_entry numeric not null,
  average_exit numeric,
  gross_pnl numeric,
  commissions numeric not null default 0,
  fees numeric not null default 0,
  net_pnl numeric,
  mae numeric,
  mfe numeric,
  status text not null check (status in ('open', 'closed')),
  metadata jsonb not null default '{}'::jsonb check (jsonb_typeof(metadata) = 'object'),
  created_at timestamptz not null default now(),
  check ((status = 'closed' and closed_at is not null) or status = 'open')
);

create table public.trade_execution_allocations (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  trade_id bigint not null references public.reconstructed_trades(id) on delete cascade,
  execution_id bigint not null references public.executions(id),
  allocation_role text not null check (allocation_role in ('open', 'close')),
  allocated_quantity numeric not null check (allocated_quantity > 0),
  realized_pnl numeric,
  unique (trade_id, execution_id, allocation_role)
);

create table public.plan_trade_links (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  plan_id bigint not null references public.trade_plans(id) on delete cascade,
  trade_id bigint not null references public.reconstructed_trades(id) on delete cascade,
  link_method text not null check (link_method in ('manual', 'time_window', 'account_instrument', 'confirmed_suggestion')),
  confidence numeric check (confidence between 0 and 1),
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  unique (plan_id, trade_id)
);

create table public.trade_reviews (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  trade_id bigint not null references public.reconstructed_trades(id) on delete cascade,
  plan_id bigint references public.trade_plans(id),
  followed_plan boolean,
  execution_grade smallint check (execution_grade between 1 and 5),
  risk_grade smallint check (risk_grade between 1 and 5),
  discipline_grade smallint check (discipline_grade between 1 and 5),
  emotional_state text,
  lessons text,
  tags text[] not null default '{}',
  rule_violations jsonb not null default '[]'::jsonb check (jsonb_typeof(rule_violations) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (trade_id)
);

create table public.period_reviews (
  id bigint generated always as identity primary key,
  owner_id uuid not null references auth.users(id) on delete cascade,
  period_type text not null check (period_type in ('daily', 'weekly', 'monthly')),
  period_start date not null,
  period_end date not null,
  status text not null default 'draft' check (status in ('draft', 'published')),
  narrative text,
  metrics jsonb not null default '{}'::jsonb check (jsonb_typeof(metrics) = 'object'),
  strengths jsonb not null default '[]'::jsonb check (jsonb_typeof(strengths) = 'array'),
  weaknesses jsonb not null default '[]'::jsonb check (jsonb_typeof(weaknesses) = 'array'),
  commitments jsonb not null default '[]'::jsonb check (jsonb_typeof(commitments) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (period_end >= period_start),
  unique (owner_id, period_type, period_start, period_end)
);

create trigger profiles_set_updated_at before update on public.profiles
for each row execute function private.set_updated_at();
create trigger trading_accounts_set_updated_at before update on public.trading_accounts
for each row execute function private.set_updated_at();
create trigger trade_plans_set_updated_at before update on public.trade_plans
for each row execute function private.set_updated_at();
create trigger orders_set_updated_at before update on public.orders
for each row execute function private.set_updated_at();
create trigger trade_reviews_set_updated_at before update on public.trade_reviews
for each row execute function private.set_updated_at();
create trigger period_reviews_set_updated_at before update on public.period_reviews
for each row execute function private.set_updated_at();

-- Foreign-key, RLS, and primary query-path indexes.
create index trading_accounts_owner_id_idx on public.trading_accounts (owner_id);
create index instruments_underlying_id_idx on public.instruments (underlying_instrument_id);
create index trade_plans_owner_planned_for_idx on public.trade_plans (owner_id, planned_for desc);
create index trade_plans_account_id_idx on public.trade_plans (account_id);
create index trade_plans_instrument_id_idx on public.trade_plans (instrument_id);
create index trade_plan_versions_owner_id_idx on public.trade_plan_versions (owner_id);
create index trade_plan_versions_plan_id_idx on public.trade_plan_versions (plan_id);
create index import_jobs_owner_created_idx on public.import_jobs (owner_id, created_at desc);
create index import_jobs_account_id_idx on public.import_jobs (account_id);
create index source_records_owner_ingested_idx on public.source_records (owner_id, ingested_at desc);
create index source_records_import_job_id_idx on public.source_records (import_job_id);
create index source_records_account_id_idx on public.source_records (account_id);
create index orders_owner_submitted_idx on public.orders (owner_id, submitted_at desc);
create index orders_account_id_idx on public.orders (account_id);
create index orders_instrument_id_idx on public.orders (instrument_id);
create index orders_source_record_id_idx on public.orders (source_record_id);
create index executions_owner_time_idx on public.executions (owner_id, executed_at desc);
create index executions_account_time_idx on public.executions (account_id, executed_at desc);
create index executions_instrument_id_idx on public.executions (instrument_id);
create index executions_order_id_idx on public.executions (order_id);
create index executions_source_record_id_idx on public.executions (source_record_id);
create index position_snapshots_owner_time_idx on public.position_snapshots (owner_id, captured_at desc);
create index position_snapshots_instrument_id_idx on public.position_snapshots (instrument_id);
create index position_snapshots_source_record_id_idx on public.position_snapshots (source_record_id);
create index reconstruction_runs_owner_created_idx on public.reconstruction_runs (owner_id, created_at desc);
create index reconstruction_runs_account_id_idx on public.reconstruction_runs (account_id);
create index reconstructed_trades_owner_closed_idx on public.reconstructed_trades (owner_id, closed_at desc);
create index reconstructed_trades_run_id_idx on public.reconstructed_trades (reconstruction_run_id);
create index reconstructed_trades_account_id_idx on public.reconstructed_trades (account_id);
create index reconstructed_trades_instrument_id_idx on public.reconstructed_trades (instrument_id);
create index allocations_owner_id_idx on public.trade_execution_allocations (owner_id);
create index allocations_trade_id_idx on public.trade_execution_allocations (trade_id);
create index allocations_execution_id_idx on public.trade_execution_allocations (execution_id);
create index plan_trade_links_owner_id_idx on public.plan_trade_links (owner_id);
create index plan_trade_links_plan_id_idx on public.plan_trade_links (plan_id);
create index plan_trade_links_trade_id_idx on public.plan_trade_links (trade_id);
create index trade_reviews_owner_id_idx on public.trade_reviews (owner_id);
create index trade_reviews_plan_id_idx on public.trade_reviews (plan_id);
create index period_reviews_owner_period_idx on public.period_reviews (owner_id, period_start desc);

-- RLS: one owner today; database-enforced isolation for multiuser later.
alter table public.profiles enable row level security;
alter table public.trading_accounts enable row level security;
alter table public.instruments enable row level security;
alter table public.trade_plans enable row level security;
alter table public.trade_plan_versions enable row level security;
alter table public.import_jobs enable row level security;
alter table public.source_records enable row level security;
alter table public.orders enable row level security;
alter table public.executions enable row level security;
alter table public.position_snapshots enable row level security;
alter table public.reconstruction_runs enable row level security;
alter table public.reconstructed_trades enable row level security;
alter table public.trade_execution_allocations enable row level security;
alter table public.plan_trade_links enable row level security;
alter table public.trade_reviews enable row level security;
alter table public.period_reviews enable row level security;

create policy profiles_owner_all on public.profiles for all to authenticated
using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy accounts_owner_all on public.trading_accounts for all to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy instruments_authenticated_read on public.instruments for select to authenticated using (true);
create policy plans_owner_all on public.trade_plans for all to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy plan_versions_owner_read on public.trade_plan_versions for select to authenticated
using ((select auth.uid()) = owner_id);
create policy plan_versions_owner_insert on public.trade_plan_versions for insert to authenticated
with check ((select auth.uid()) = owner_id);
create policy import_jobs_owner_all on public.import_jobs for all to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy source_records_owner_read on public.source_records for select to authenticated
using ((select auth.uid()) = owner_id);
create policy source_records_owner_insert on public.source_records for insert to authenticated
with check ((select auth.uid()) = owner_id);
create policy orders_owner_all on public.orders for all to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy executions_owner_read on public.executions for select to authenticated
using ((select auth.uid()) = owner_id);
create policy executions_owner_insert on public.executions for insert to authenticated
with check ((select auth.uid()) = owner_id);
create policy position_snapshots_owner_read on public.position_snapshots for select to authenticated
using ((select auth.uid()) = owner_id);
create policy position_snapshots_owner_insert on public.position_snapshots for insert to authenticated
with check ((select auth.uid()) = owner_id);
create policy reconstruction_runs_owner_all on public.reconstruction_runs for all to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy reconstructed_trades_owner_all on public.reconstructed_trades for all to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy allocations_owner_all on public.trade_execution_allocations for all to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy plan_trade_links_owner_all on public.plan_trade_links for all to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy trade_reviews_owner_all on public.trade_reviews for all to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy period_reviews_owner_all on public.period_reviews for all to authenticated
using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);

revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;

grant select, insert, update, delete on
  public.profiles,
  public.trading_accounts,
  public.trade_plans,
  public.import_jobs,
  public.orders,
  public.reconstruction_runs,
  public.reconstructed_trades,
  public.trade_execution_allocations,
  public.plan_trade_links,
  public.trade_reviews,
  public.period_reviews
to authenticated;

grant select on public.instruments to authenticated;
grant select, insert on
  public.trade_plan_versions,
  public.source_records,
  public.executions,
  public.position_snapshots
to authenticated;

grant usage, select on all sequences in schema public to authenticated;
