-- =============================================================
-- Auto Diaspora — reviews (buyer rates seller after a transaction)
-- Run AFTER schema.sql in Supabase Dashboard → SQL Editor.
-- Safe to re-run.
-- =============================================================

create table if not exists public.reviews (
  id uuid default gen_random_uuid() primary key,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  buyer_id  uuid references public.profiles(id) on delete cascade not null,
  -- listing the deal was about. SET NULL keeps reviews visible even if
  -- the seller deletes the original listing later.
  listing_id uuid references public.listings(id) on delete set null,

  rating smallint not null check (rating between 1 and 5),
  comment text,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),

  -- One review per (buyer, listing). Forces an actual transactional
  -- context (a buyer with 10 chats on 10 listings can leave 10
  -- reviews, but each tied to a specific deal).
  constraint reviews_unique_per_listing unique (buyer_id, listing_id),
  constraint reviews_no_self check (seller_id <> buyer_id)
);

create index if not exists idx_reviews_seller on public.reviews (seller_id, created_at desc);
create index if not exists idx_reviews_buyer  on public.reviews (buyer_id,  created_at desc);

-- Keep updated_at fresh on edits
create or replace function public.touch_review_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists on_review_update on public.reviews;
create trigger on_review_update
  before update on public.reviews
  for each row execute function public.touch_review_updated_at();

-- =============================================================
-- RLS
-- =============================================================
alter table public.reviews enable row level security;

drop policy if exists "Reviews are viewable by everyone" on public.reviews;
create policy "Reviews are viewable by everyone"
  on public.reviews for select using (true);

-- Insert: buyer must (a) be the authed user, (b) have chatted with
-- seller about this listing, (c) the listing must be marked sold.
-- "Marked sold" is the best proxy we have for "transaction happened" —
-- the actual money/car exchange is offline.
drop policy if exists "Buyer can insert review for sold listing they chatted on" on public.reviews;
create policy "Buyer can insert review for sold listing they chatted on"
  on public.reviews for insert
  with check (
    auth.uid() = buyer_id
    and exists (
      select 1 from public.chats c
      where c.listing_id = reviews.listing_id
        and c.buyer_id   = auth.uid()
        and c.seller_id  = reviews.seller_id
    )
    and exists (
      select 1 from public.listings l
      where l.id = reviews.listing_id
        and l.user_id = reviews.seller_id
        and l.status  = 'sold'
    )
  );

-- Update / delete: only the author. Limited window enforced in app
-- code (server action) — DB lets the author edit indefinitely so the
-- user can fix typos.
drop policy if exists "Buyer can update own review" on public.reviews;
create policy "Buyer can update own review"
  on public.reviews for update
  using (auth.uid() = buyer_id)
  with check (auth.uid() = buyer_id);

drop policy if exists "Buyer can delete own review" on public.reviews;
create policy "Buyer can delete own review"
  on public.reviews for delete
  using (auth.uid() = buyer_id);
