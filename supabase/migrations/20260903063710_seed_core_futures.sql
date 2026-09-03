insert into public.instruments (
  asset_class,
  canonical_symbol,
  description,
  exchange,
  contract_multiplier,
  tick_size,
  tick_value
)
values
  ('future', 'NQ', 'E-mini Nasdaq-100 Futures', 'CME', 20, 0.25, 5),
  ('future', 'ES', 'E-mini S&P 500 Futures', 'CME', 50, 0.25, 12.50),
  ('future', 'CL', 'Crude Oil Futures', 'NYMEX', 1000, 0.01, 10),
  ('future', 'GC', 'Gold Futures', 'COMEX', 100, 0.10, 10)
on conflict do nothing;
