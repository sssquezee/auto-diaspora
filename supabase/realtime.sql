-- =============================================================
-- Auto Diaspora — Realtime publication
-- Run this in Supabase Dashboard → SQL Editor AFTER schema.sql
-- so that the chat UI receives live message inserts.
-- =============================================================

-- Add `messages` table to the realtime publication so client
-- subscriptions on `postgres_changes` (event: INSERT) fire.
alter publication supabase_realtime add table public.messages;

-- (Optional) Add chats so `last_message_at` bumps also push live.
-- Useful if you want the inbox to re-sort without a refresh.
alter publication supabase_realtime add table public.chats;
