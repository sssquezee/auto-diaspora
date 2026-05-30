-- =============================================================
-- Auto Diaspora — homepage Hero aggregates
-- Run AFTER schema.sql. Safe to re-run.
--
-- One round-trip for the three live counters on the landing page.
-- SECURITY DEFINER so it reads past RLS and stays cheap (DB-side
-- COUNT DISTINCT instead of shipping rows to the app).
-- =============================================================

create or replace function public.hero_stats()
returns table (cars bigint, sellers bigint, countries bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    count(*)                                                            as cars,
    count(distinct user_id)                                            as sellers,
    count(distinct country) filter (where country is not null
                                       and country <> '')              as countries
  from public.listings
  where status = 'active';
$$;

grant execute on function public.hero_stats() to anon, authenticated;
