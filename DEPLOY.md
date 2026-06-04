# Auto Diaspora — Vercel deploy checklist

End-to-end walkthrough from "code on master" → "live at autodiaspora.com".

## 0. Prerequisites

- GitHub repo with this code pushed to `master` (or any branch you want
  to deploy from).
- Vercel account → connect GitHub.
- Domain registered (Namecheap / Cloudflare / etc).
- Supabase project already provisioned (already done in your case).
- Mollie account with at least a `test_*` API key.

## 1. Import to Vercel

1. Vercel Dashboard → **Add New… → Project**.
2. Pick the GitHub repo. Vercel auto-detects Next.js.
3. **Root directory**: leave blank (project root).
4. **Build & output settings**: use defaults. `vercel.json` already pins
   `regions: ["fra1"]` (Frankfurt) so serverless functions co-locate
   with the Supabase EU-Central database.
5. **Environment variables** — see the next section.
6. Click **Deploy**. Wait ~2 min for first build.

## 2. Environment variables

Copy from `.env.example` and fill these in the Vercel **Environment
Variables** panel. Set them for `Production` *and* `Preview` (so PR
deploys can also exercise the full stack).

### Required

| Key | Value | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://<ref>.supabase.co` | from Supabase Dashboard → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJ…` | same page, "Project API keys → anon public" |
| `SUPABASE_SERVICE_ROLE_KEY` | `sb_secret_…` or legacy JWT | same page, secret keys section. **Server-only, never expose** |
| `NEXT_PUBLIC_SITE_URL` | `https://autodiaspora.com` | goes into sitemap, OG, emails. **Must match prod domain** |
| `NEXT_PUBLIC_SITE_NAME` | `Auto Diaspora` | |
| `ADMIN_USER_IDS` | `<your-profile-uuid>` | comma-separated UUIDs from auth.users |

### Recommended (without these, related features are no-ops)

| Key | Value | Notes |
|---|---|---|
| `MOLLIE_API_KEY` | `test_…` for staging, `live_…` for prod | required for real payments |
| `NEXT_PUBLIC_SENTRY_DSN` | `https://…ingest.sentry.io/…` | error monitoring |
| `TELEGRAM_BOT_TOKEN` | from @BotFather | admin pings |
| `TELEGRAM_ADMIN_CHAT_ID` | from `getUpdates` | where pings go |
| `TELEGRAM_WEBHOOK_SECRET` | `openssl rand -hex 32` | required only if you want inline Approve/Reject |
| `RESEND_API_KEY` | `re_…` from resend.com | required for transactional emails (chat / moderation) |
| `EMAIL_FROM` | `Auto Diaspora <send@yourdomain>` | the verified sender on Resend |
| `CRON_SECRET` | `openssl rand -hex 32` | required for `/api/cron/expire` to authorise host crontab |

### Setting up Resend (transactional email)

1. resend.com → sign up → **Domains → Add domain** → enter the
   sender domain (e.g. `mail.autodiaspora.com`).
2. Resend shows DNS records (SPF, DKIM, optional DMARC). Paste them
   at your registrar. Wait until status flips to **Verified** (5-30 min).
3. **API keys → Create API key** → scope: *sending access* only →
   copy the `re_…` value into `RESEND_API_KEY`.
4. Set `EMAIL_FROM` to a verified address on that domain, e.g.
   `Auto Diaspora <hello@mail.autodiaspora.com>`. **Must** be on the
   verified domain or Resend rejects with 403.
5. Smoke test: open a chat with yourself or a test account and send a
   message — the recipient's email should land within ~10 seconds.

### Setting up the expiry cron

`POST /api/cron/expire` clears `is_premium` / `is_top` when the
corresponding `*_until` has passed. The endpoint requires the
`Authorization: Bearer $CRON_SECRET` header so randos can't hit it.

On the VPS, add a daily crontab entry as root:

```sh
crontab -e
# add this line — runs every day at 03:00 UTC
0 3 * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" https://autodiaspora.com/api/cron/expire >> /var/log/autodiaspora-cron.log 2>&1
```

Replace `$CRON_SECRET` with the actual value or define it via
`/etc/cron.d/autodiaspora` instead so the secret stays in a file
read-only to root.

Verify with a manual curl from the server:
```sh
curl -i -H "Authorization: Bearer <SECRET>" https://autodiaspora.com/api/cron/expire
# expected: 200 + JSON {"ok": true, "premium_cleared": N, "top_cleared": M}
```

### Filling legal placeholders

[messages/{en,uk,ru}.json](messages) still contain `[OWNER NAME]`,
`[KVK NUMBER]`, `[REGISTERED ADDRESS]`, `[STREET]`, `[POSTCODE] [CITY]`,
`[XXXXXXXXX]` (BTW), `[+31 ...]` (phone) inside `Privacy.sections.*`,
`Terms.sections.*`, `Impressum.*`. Do a global find-and-replace once
the eenmanszaak is registered and the actual values are in hand. The
site can ship without these but the legal pages won't be substitutable
for real Terms / Privacy / Impressum until they're filled.

## 3. Custom domain

1. Vercel project → **Settings → Domains → Add**.
2. Enter `autodiaspora.com` (and `www.autodiaspora.com`).
3. Vercel shows the required DNS records. At your registrar:
   - `A` record `@` → `76.76.21.21`
   - `CNAME` record `www` → `cname.vercel-dns.com`
4. Wait for DNS propagation (typically 5–30 min). Vercel issues a
   Let's Encrypt cert automatically.
5. Update `NEXT_PUBLIC_SITE_URL` to `https://autodiaspora.com` and
   redeploy (Vercel → Deployments → ⋯ → Redeploy).

## 4. Supabase wiring (done once, after the domain is live)

1. Supabase Dashboard → **Authentication → URL Configuration**:
   - **Site URL**: `https://autodiaspora.com`
   - **Redirect URLs** (add all):
     - `https://autodiaspora.com/**`
     - `https://*.vercel.app/**` (for preview deploys)
2. Supabase Dashboard → **Authentication → Sign In / Up**:
   - **Confirm email**: ✅ **turn ON** for production (dev had it off
     for convenience — production must have it on, otherwise random
     spammers register with disposable emails).
3. Supabase Dashboard → **SQL Editor**: run `supabase/realtime.sql`
   if you haven't yet (enables Realtime publication on `messages` +
   `chats` tables — required for live chat).
4. Storage:
   - `listings` bucket must exist (Storage → New bucket → name
     `listings`, **Public: ON**).
   - Run the 4 Storage RLS policies from the bottom of
     `supabase/schema.sql` (they're commented out — uncomment and
     execute in SQL Editor).

## 5. Mollie webhook (when you switch to real payments)

1. Mollie Dashboard → **Developers → Webhook URL**:
   ```
   https://autodiaspora.com/api/mollie/webhook
   ```
2. The existing `app/api/mollie/webhook/route.ts` already verifies
   payment status via Mollie's REST API before activating a service —
   safe to point production at it.

## 6. Telegram webhook (optional, for in-chat Approve/Reject)

After deploy:

```sh
curl "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://autodiaspora.com/api/telegram/webhook" \
  -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>" \
  -d 'allowed_updates=["callback_query"]'
```

Verify: `curl https://api.telegram.org/bot<TOKEN>/getWebhookInfo`.

## 7. Sentry (optional but recommended)

1. sentry.io → New project → **Next.js** → grab the DSN.
2. Paste into `NEXT_PUBLIC_SENTRY_DSN` (Vercel env).
3. Redeploy.
4. Trigger a deliberate 500 (e.g. broken Server Action) → confirm it
   shows up in Sentry within ~30 seconds.

Source maps for readable stack traces are *not* set up — if you want
them, add `withSentryConfig` wrapper in `next.config.ts` + a
`SENTRY_AUTH_TOKEN` env. Not required for basic error capture.

## 8. Smoke test on production

Open `https://autodiaspora.com` and walk through:

- [ ] Sign up with a brand-new email — receive confirmation email,
      click link, land on `/account`.
- [ ] Reset password from `/auth/forgot` — receive email, set new
      password, sign in.
- [ ] Create a listing — pending state, see it in `/account/listings`
      under "Pending" tab.
- [ ] As admin (your UUID in `ADMIN_USER_IDS`), open `/admin/queue` —
      see the pending listing — approve.
- [ ] Catalog `/` now shows the listing.
- [ ] Open in incognito → favourite → redirected to login. Sign in,
      favourite again → succeeds, shows in `/account/favorites`.
- [ ] Open `/sitemap.xml` and `/robots.txt` — both 200.
- [ ] Trigger 404 (`/uk/this-does-not-exist`) — custom 404 page.

## 9. Day-2 ops

- **Vercel Analytics** (built-in): free tier shows traffic + Core Web
  Vitals. Toggle in **Project → Analytics**.
- **Vercel Logs**: real-time `Functions` tab shows Server Action +
  Route Handler logs. Bookmark.
- **Supabase Logs**: SQL queries, Auth events, Storage operations —
  Supabase Dashboard → Logs.
- **Sentry Alerts**: configure email/Slack alerts for new issues.

## 10. When things go wrong

- Build failed → check Vercel build logs, usually a missing env var
  or a TypeScript error that slipped past local `tsc`.
- "Missing environment variable NEXT_PUBLIC_SUPABASE_URL" in build:
  the var is unset for the environment being deployed (set it for
  both Production AND Preview).
- Email confirmation links 404: `NEXT_PUBLIC_SITE_URL` doesn't match
  the production domain — fix and redeploy.
- Telegram callbacks not firing: `getWebhookInfo` shows
  `last_error_message`. Common causes: domain not resolvable,
  Vercel function 401-ing due to bad `secret_token`.
- RLS errors (`new row violates row-level security`): user is hitting
  an action the policy doesn't allow. Confirm the policy in Supabase
  Dashboard → Database → Policies.
