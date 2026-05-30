-- =============================================================
-- Auto Diaspora — "Boost to top" (€5) support
-- Safe to re-run.
-- =============================================================

-- When the boost was last paid for. Drives catalog ranking:
--   ORDER BY topped_at DESC NULLS LAST, created_at DESC
-- i.e. paid listings sit above all others, most recently paid first.
alter table public.listings
  add column if not exists topped_at timestamptz;

create index if not exists idx_listings_topped
  on public.listings (topped_at desc nulls last);

-- Allow the single paid service_type 'top' on payments. Old values are kept
-- so historical rows (if any) stay valid.
alter table public.payments
  drop constraint if exists payments_service_type_check;

alter table public.payments
  add constraint payments_service_type_check
  check (service_type in (
    'top', 'bump', 'premium_14', 'premium_30', 'extra_listing', 'verified_seller'
  ));
