-- =============================================================
-- Auto Diaspora — initial schema
-- Run this in Supabase Dashboard → SQL Editor → New Query
-- after creating the project. Safe to re-run (uses IF NOT EXISTS).
-- =============================================================

-- Useful extensions
create extension if not exists "uuid-ossp";

-- =============================================================
-- profiles — extends auth.users
-- =============================================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text not null,
  username text unique,
  full_name text,
  phone text,
  telegram_id bigint unique,
  telegram_username text,
  avatar_url text,
  country text,
  city text,
  language text default 'uk' check (language in ('uk', 'ru', 'en')),
  is_verified boolean default false,
  is_dealer boolean default false,
  free_listings_used int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Auto-create a profile row when a new auth.users row appears
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, language)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'language', 'uk')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =============================================================
-- listings
-- =============================================================
create table if not exists public.listings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,

  -- Basic
  title text not null,
  description text,

  -- Technical
  brand text not null,
  model text not null,
  year int not null check (year between 1950 and extract(year from now())::int + 1),
  mileage int not null check (mileage >= 0),
  fuel_type text not null check (fuel_type in ('diesel', 'petrol', 'hybrid', 'electric')),
  transmission text not null check (transmission in ('auto', 'manual')),
  body_type text check (body_type in ('sedan', 'suv', 'wagon', 'hatchback', 'coupe')),
  drive_type text check (drive_type in ('fwd', 'rwd', 'awd')),
  engine_volume numeric(3, 1),
  power_hp int,
  color text,
  vin text,

  -- Location
  country text not null,
  city text not null,

  -- Price
  price numeric(10, 2) not null check (price >= 0),
  currency text default 'EUR',
  price_negotiable boolean default false,

  -- Condition
  condition text default 'used' check (condition in ('new', 'used', 'damaged')),
  damaged_description text,
  customs_cleared boolean default false,

  -- Contact (snapshot from profile at creation time)
  contact_name text,
  contact_phone text,

  -- Status
  status text default 'active' check (status in ('active', 'paused', 'sold', 'expired', 'pending_review')),
  is_premium boolean default false,
  premium_until timestamptz,
  is_top boolean default false,
  top_until timestamptz,
  is_urgent boolean default false,
  is_verified boolean default false,

  -- Metrics
  views_count int default 0,
  favorites_count int default 0,

  -- Dates
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '60 days'),
  bumped_at timestamptz default now()
);

create index if not exists idx_listings_status on public.listings (status);
create index if not exists idx_listings_brand_model on public.listings (brand, model);
create index if not exists idx_listings_price on public.listings (price);
create index if not exists idx_listings_country on public.listings (country);
create index if not exists idx_listings_premium on public.listings (is_premium, premium_until);
create index if not exists idx_listings_bumped on public.listings (bumped_at desc);

-- =============================================================
-- listing_photos
-- =============================================================
create table if not exists public.listing_photos (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  storage_path text not null,
  position int not null default 0,
  is_primary boolean default false,
  width int,
  height int,
  created_at timestamptz default now()
);
create index if not exists idx_listing_photos_listing on public.listing_photos (listing_id, position);

-- =============================================================
-- favorites
-- =============================================================
create table if not exists public.favorites (
  user_id uuid references public.profiles(id) on delete cascade not null,
  listing_id uuid references public.listings(id) on delete cascade not null,
  created_at timestamptz default now(),
  primary key (user_id, listing_id)
);

-- =============================================================
-- chats + messages (Supabase Realtime)
-- =============================================================
create table if not exists public.chats (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  buyer_id uuid references public.profiles(id) on delete cascade not null,
  seller_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamptz default now(),
  last_message_at timestamptz default now(),
  unique (listing_id, buyer_id, seller_id)
);
create index if not exists idx_chats_buyer on public.chats (buyer_id, last_message_at desc);
create index if not exists idx_chats_seller on public.chats (seller_id, last_message_at desc);

create table if not exists public.messages (
  id uuid default gen_random_uuid() primary key,
  chat_id uuid references public.chats(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz default now()
);
create index if not exists idx_messages_chat on public.messages (chat_id, created_at);

-- Bump chats.last_message_at when a new message is inserted
create or replace function public.bump_chat_on_message()
returns trigger
language plpgsql
as $$
begin
  update public.chats set last_message_at = new.created_at where id = new.chat_id;
  return new;
end;
$$;

drop trigger if exists on_message_insert on public.messages;
create trigger on_message_insert
  after insert on public.messages
  for each row execute function public.bump_chat_on_message();

-- =============================================================
-- saved_searches
-- =============================================================
create table if not exists public.saved_searches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  query text not null,
  summary text,
  notify_telegram boolean default false,
  notify_email boolean default false,
  last_notified_at timestamptz,
  created_at timestamptz default now()
);
create index if not exists idx_saved_searches_user on public.saved_searches (user_id, created_at desc);

-- =============================================================
-- payments (Mollie)
-- =============================================================
create table if not exists public.payments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  listing_id uuid references public.listings(id) on delete cascade,
  mollie_payment_id text unique,
  amount numeric(10, 2) not null,
  currency text default 'EUR',
  status text default 'pending' check (status in ('pending', 'paid', 'failed', 'canceled', 'expired')),
  service_type text not null check (service_type in ('bump', 'premium_14', 'premium_30', 'extra_listing', 'verified_seller')),
  paid_at timestamptz,
  created_at timestamptz default now()
);
create index if not exists idx_payments_user on public.payments (user_id, created_at desc);
create index if not exists idx_payments_mollie on public.payments (mollie_payment_id);

-- =============================================================
-- reports
-- =============================================================
create table if not exists public.reports (
  id uuid default gen_random_uuid() primary key,
  listing_id uuid references public.listings(id) on delete cascade not null,
  reporter_id uuid references public.profiles(id) on delete set null,
  reason text not null check (reason in ('spam', 'scam', 'wrong_info', 'stolen', 'duplicate', 'other')),
  details text,
  status text default 'open' check (status in ('open', 'reviewed', 'dismissed', 'actioned')),
  created_at timestamptz default now()
);
create index if not exists idx_reports_status on public.reports (status, created_at desc);

-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

-- profiles
alter table public.profiles enable row level security;

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

-- listings
alter table public.listings enable row level security;

drop policy if exists "Active listings are viewable by everyone" on public.listings;
create policy "Active listings are viewable by everyone"
  on public.listings for select using (status = 'active' or auth.uid() = user_id);

drop policy if exists "Users can insert own listings" on public.listings;
create policy "Users can insert own listings"
  on public.listings for insert with check (auth.uid() = user_id);

drop policy if exists "Users can update own listings" on public.listings;
create policy "Users can update own listings"
  on public.listings for update using (auth.uid() = user_id);

drop policy if exists "Users can delete own listings" on public.listings;
create policy "Users can delete own listings"
  on public.listings for delete using (auth.uid() = user_id);

-- listing_photos
alter table public.listing_photos enable row level security;

drop policy if exists "Listing photos viewable when listing viewable" on public.listing_photos;
create policy "Listing photos viewable when listing viewable"
  on public.listing_photos for select using (
    exists (
      select 1 from public.listings l
      where l.id = listing_id and (l.status = 'active' or l.user_id = auth.uid())
    )
  );

drop policy if exists "Users manage own listing photos" on public.listing_photos;
create policy "Users manage own listing photos"
  on public.listing_photos for all using (
    exists (select 1 from public.listings l where l.id = listing_id and l.user_id = auth.uid())
  );

-- favorites (user can only see and modify own)
alter table public.favorites enable row level security;

drop policy if exists "Users see own favorites" on public.favorites;
create policy "Users see own favorites"
  on public.favorites for select using (auth.uid() = user_id);

drop policy if exists "Users add own favorites" on public.favorites;
create policy "Users add own favorites"
  on public.favorites for insert with check (auth.uid() = user_id);

drop policy if exists "Users remove own favorites" on public.favorites;
create policy "Users remove own favorites"
  on public.favorites for delete using (auth.uid() = user_id);

-- chats (only participants can see)
alter table public.chats enable row level security;

drop policy if exists "Participants see chats" on public.chats;
create policy "Participants see chats"
  on public.chats for select using (auth.uid() in (buyer_id, seller_id));

drop policy if exists "Buyer creates chat" on public.chats;
create policy "Buyer creates chat"
  on public.chats for insert with check (auth.uid() = buyer_id);

-- messages (only chat participants)
alter table public.messages enable row level security;

drop policy if exists "Participants see messages" on public.messages;
create policy "Participants see messages"
  on public.messages for select using (
    exists (
      select 1 from public.chats c
      where c.id = chat_id and auth.uid() in (c.buyer_id, c.seller_id)
    )
  );

drop policy if exists "Participants send messages" on public.messages;
create policy "Participants send messages"
  on public.messages for insert with check (
    auth.uid() = sender_id and exists (
      select 1 from public.chats c
      where c.id = chat_id and auth.uid() in (c.buyer_id, c.seller_id)
    )
  );

-- saved_searches (private)
alter table public.saved_searches enable row level security;

drop policy if exists "Users manage own saved searches" on public.saved_searches;
create policy "Users manage own saved searches"
  on public.saved_searches for all using (auth.uid() = user_id);

-- payments (private)
alter table public.payments enable row level security;

drop policy if exists "Users see own payments" on public.payments;
create policy "Users see own payments"
  on public.payments for select using (auth.uid() = user_id);

-- (writes to payments go through service_role from API routes — no insert policy needed)

-- reports (open for any authenticated reporter)
alter table public.reports enable row level security;

drop policy if exists "Anyone can report" on public.reports;
create policy "Anyone can report"
  on public.reports for insert with check (auth.uid() is not null);

drop policy if exists "Reporters see own reports" on public.reports;
create policy "Reporters see own reports"
  on public.reports for select using (auth.uid() = reporter_id);

-- =============================================================
-- STORAGE — listing photos
-- =============================================================
-- Storage buckets must be created in the Dashboard:
--   Storage → New bucket → name: "listings"
--   Public: yes (so card images are public)
-- Then run the policy below to allow authenticated users to upload
-- only into folders named after their user_id (auth.uid()).

-- After creating the bucket, run this:
--
-- create policy "Anyone can view listing photos"
--   on storage.objects for select
--   using (bucket_id = 'listings');
--
-- create policy "Users upload to own folder"
--   on storage.objects for insert
--   with check (
--     bucket_id = 'listings'
--     and (storage.foldername(name))[1] = auth.uid()::text
--   );
--
-- create policy "Users update own photos"
--   on storage.objects for update
--   using (
--     bucket_id = 'listings'
--     and (storage.foldername(name))[1] = auth.uid()::text
--   );
--
-- create policy "Users delete own photos"
--   on storage.objects for delete
--   using (
--     bucket_id = 'listings'
--     and (storage.foldername(name))[1] = auth.uid()::text
--   );
