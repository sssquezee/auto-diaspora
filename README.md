# Auto Diaspora

Car marketplace MVP for Ukrainian/Russian-speaking diaspora in the EU.
Next.js 16 (App Router) + Supabase + Tailwind v4. Three locales:
`uk` / `ru` / `en`. Brutalist editorial design (monochrome + cobalt).

→ **Product scope:** [PROJECT_SPEC.md](PROJECT_SPEC.md)
→ **Production deploy:** [DEPLOY.md](DEPLOY.md)

## Stack

- **Next.js 16** App Router (RSC, Server Actions, Route Handlers) + Turbopack
- **React 19**, **TypeScript**, **Tailwind v4**
- **next-intl 4.x** — `localePrefix: "always"`, all messages in `messages/*.json`
- **Supabase** — Postgres + Auth + Storage + Realtime, EU-Central region
- **Mollie** — payments (currently mock; see `lib/mollie.ts`)
- **Sentry** — no-op without `NEXT_PUBLIC_SENTRY_DSN`
- **Telegram Bot API** — pending-listing notifications + inline approve/reject

## Local setup

```bash
git clone https://github.com/sssquezee/auto-diaspora.git
cd auto-diaspora
npm install
cp .env.example .env.local      # fill values — see "Env vars" below
npm run dev                     # http://localhost:3000
```

You also need access to the Supabase project (ask the owner for a
team invite at Supabase Dashboard → Settings → Team). All schema
lives in `supabase/`:

- `schema.sql` — tables + RLS + triggers. Run once on a fresh project.
- `realtime.sql` — enables Realtime on `messages` + `chats`.
- `reviews.sql` — reviews table + RLS (run after `schema.sql`).

### Env vars

Fill these in `.env.local` (never commit). Get the real values from the
project owner via a one-time-link tool (Bitwarden Send / 1Password
Share). **Don't** paste secrets in Slack/Telegram/email.

```ini
NEXT_PUBLIC_SUPABASE_URL=https://<ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=sb_secret_...           # server-only, never expose
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME="Auto Diaspora"
ADMIN_USER_IDS=<your-profile-uuid>                # comma-separated
```

Optional (features no-op without them): `MOLLIE_API_KEY`,
`TELEGRAM_BOT_TOKEN`, `TELEGRAM_ADMIN_CHAT_ID`,
`TELEGRAM_WEBHOOK_SECRET`, `NEXT_PUBLIC_SENTRY_DSN`.

## Where things live

```
app/[locale]/                   # all user-facing pages (next-intl)
  page.tsx                      # catalog (home)
  search/                       # /search with free-text + filters
  listing/[id]/                 # listing detail
  new/                          # create listing wizard
  account/                      # signed-in area (6 pages)
    listings/                   # my listings + edit
    messages/                   # chat (Supabase Realtime)
    favorites/ saved-searches/ settings/
  u/[id]/                       # public seller profile + reviews
  admin/                        # /admin/queue, /admin/reports — env-gated
  auth/                         # login / register / forgot / reset
  terms/ privacy/ impressum/    # legal

app/api/                        # Route Handlers
  mollie/create/  mollie/webhook/
  telegram/webhook/             # admin approve/reject from chat
  account/export/               # GDPR Article 15

lib/                            # data access + helpers
  supabase/                     # client.ts / server.ts / admin.ts / middleware.ts
  listings.ts                   # catalog + SQL filtering
  reviews.ts  favorites-server.ts  saved-searches-server.ts  chats-server.ts
  mollie.ts  telegram.ts  moderation.ts  admin.ts  tiers.ts

components/                     # shared UI (~30 components)
i18n/                           # next-intl routing + request config
messages/                       # uk.json / ru.json / en.json
supabase/                       # *.sql migrations
```

## Common tasks

| Task | How |
|---|---|
| Add a new translatable string | edit `messages/{en,uk,ru}.json` then `t("Namespace.key")` |
| Add a new server action | `"use server"` at top, return `redirect()` for navigation |
| Query Supabase server-side | `await createClient()` from `lib/supabase/server.ts` |
| Bypass RLS for admin work | `createAdminClient()` from `lib/supabase/admin.ts` — server-only |
| Add a new admin route | put under `/admin/*`, gate via `await getAdminUserId()` → `notFound()` |
| Trigger Realtime locally | run `supabase/realtime.sql` once, then `supabase.channel(...)` |

## Conventions

- **Server Components** by default; `"use client"` only when you need
  state, effects, or DOM event handlers.
- **No mock data in new code** — read/write Supabase directly.
- **next-intl** — all visible text via `t("...")`. No hard-coded
  English/Ukrainian strings in JSX.
- **RLS-first** — never disable RLS to "make it work"; write a policy.
- **Brutalist styling** — borders, no gradients, no rounded corners on
  most elements, Archivo + IBM Plex Mono via `font-sans` / `font-mono`.

## What's done / what's left

**Done (deployable today):** auth, catalog with SQL filtering,
listing CRUD + photos, chat with Realtime, favorites, saved searches,
admin queue with Telegram callbacks, free-tier cap + rate limit,
pre-publication moderation, GDPR data export, Sentry, seller profile
+ reviews, real Terms/Privacy/Impressum, Vercel config.

**Open (good first issues for a teammate):**

1. **Real Mollie integration** — `lib/mollie.ts` already speaks
   REST; the holes are: auth on `/api/mollie/create`, payments-row
   insert, and webhook activation logic (bump / premium tiers).
2. **`/admin/reports` UI** — stub exists at
   `app/[locale]/admin/reports/page.tsx`, mirror `/admin/queue`.
3. **Email notifications via Resend** — `RESEND_API_KEY` ready;
   targets: new chat message, listing approved/rejected.
4. **Cron expiry for listings** — Vercel Cron + `CRON_SECRET`,
   flip `status='expired'` after N days; expire `is_premium` /
   `is_top` flags.
5. **next/image migration** — currently `<img>`; image patterns
   already whitelisted in `next.config.ts`.
6. **OG image generation** — `app/[locale]/listing/[id]/opengraph-image.tsx`
   via `next/og`.

## Deployment

Hosted on Vercel (region `fra1`, co-located with Supabase EU-Central).
Full checklist: [DEPLOY.md](DEPLOY.md).
