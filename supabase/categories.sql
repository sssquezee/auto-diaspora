-- =============================================================
-- Auto Diaspora — vehicle category (cars / moto / commercial / trailers / parts)
-- Run AFTER schema.sql in Supabase Dashboard → SQL Editor.
-- Safe to re-run (idempotent).
--
-- Adds a top-level "what kind of listing" dimension so the nav tabs
-- (МОТО / КОММЕРЧЕСКИЕ / ПРИЦЕПЫ / ЗАПЧАСТИ) become real filters. Existing
-- rows default to 'car', so the current car listings are unaffected.
--
-- 'parts' is NOT a vehicle: it has no year / mileage / fuel / transmission,
-- so those four columns are relaxed to NULL-able (they stay required at the
-- app level for the vehicle categories).
-- =============================================================

-- 1. Category column (default 'car' so existing rows stay valid).
alter table public.listings
  add column if not exists category text not null default 'car';

-- (Re)apply the allowed-values check so 'parts' is included even if an
-- earlier version of this migration created a narrower constraint.
alter table public.listings drop constraint if exists listings_category_check;
alter table public.listings
  add constraint listings_category_check
  check (category in ('car', 'moto', 'commercial', 'trailer', 'parts'));

-- 2. Vehicle-only fields become optional so 'parts' rows can omit them.
alter table public.listings alter column year drop not null;
alter table public.listings alter column mileage drop not null;
alter table public.listings alter column fuel_type drop not null;
alter table public.listings alter column transmission drop not null;

-- 3. Index for the category + status filter used by the catalog.
create index if not exists idx_listings_category
  on public.listings (category, status);
