-- =============================================================
-- Auto Diaspora — funnel analytics for the "Подать объявление" flow
-- Run AFTER schema.sql in Supabase Dashboard → SQL Editor.
-- Safe to re-run.
--
-- Goal: understand WHY few people publish. We record a tiny event at
-- each step of /new so the drop-off is measurable instead of guessed:
--   new_view          — someone opened /new (authed flag tells us if
--                        they were logged in)
--   new_publish_click — they filled the form and pressed "Опубликовать"
--   new_created       — a listing row was actually inserted (success)
--   new_submit_error  — submit was rejected (reason in meta->>'reason')
--
-- `session_id` is an anonymous, client-generated id (sessionStorage) that
-- links a single visit's events together, so we can compute a real funnel
-- (views → clicks → created) without any personal data.
-- =============================================================

create table if not exists public.funnel_events (
  id uuid default gen_random_uuid() primary key,

  event text not null check (event in (
    'new_view',
    'new_publish_click',
    'new_created',
    'new_submit_error'
  )),

  -- Anonymous per-visit id (not a user id). Groups one visitor's steps.
  session_id text,
  -- Was the visitor logged in at the moment of the event?
  authed boolean,
  locale text,
  -- Only set for new_created.
  listing_id uuid references public.listings(id) on delete set null,
  -- Free-form extra context, e.g. {"reason":"missing_fields"}.
  meta jsonb not null default '{}'::jsonb,

  created_at timestamptz default now()
);

create index if not exists idx_funnel_events_event   on public.funnel_events (event, created_at desc);
create index if not exists idx_funnel_events_session on public.funnel_events (session_id);
create index if not exists idx_funnel_events_created  on public.funnel_events (created_at desc);

-- =============================================================
-- RLS
-- =============================================================
alter table public.funnel_events enable row level security;

-- Insert: anyone (including logged-out visitors) may record an event.
-- The CHECK constraint above limits `event` to the known set, so this
-- can't be used to store arbitrary data. No row ownership to enforce —
-- these are anonymous funnel pings.
drop policy if exists "Anyone can record a funnel event" on public.funnel_events;
create policy "Anyone can record a funnel event"
  on public.funnel_events for insert
  with check (true);

-- No SELECT/UPDATE/DELETE policy on purpose: only the service role
-- (SQL Editor, server admin client) can read or manage the data.
