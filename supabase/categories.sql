-- =============================================================
-- Auto Diaspora — vehicle category (cars / moto / commercial / trailers)
-- Run AFTER schema.sql in Supabase Dashboard → SQL Editor.
-- Safe to re-run.
--
-- Adds a top-level "what kind of vehicle" dimension so the nav tabs
-- (МОТОЦИКЛЫ / КОММЕРЧЕСКИЕ / ПРИЦЕПЫ) become real filters. Existing rows
-- default to 'car', so the current 50 car listings are unaffected.
-- 'parts' is intentionally NOT a category yet (it needs a different form).
-- =============================================================

alter table public.listings
  add column if not exists category text not null default 'car'
  check (category in ('car', 'moto', 'commercial', 'trailer'));

create index if not exists idx_listings_category
  on public.listings (category, status);
