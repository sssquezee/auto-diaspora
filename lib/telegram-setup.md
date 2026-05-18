# Telegram bot setup

## 1. Create the bot

Open @BotFather → `/newbot` → choose a name (e.g. "Auto Diaspora Admin")
and a username ending in `bot` (e.g. `AutoDiasporaAdminBot`).

BotFather replies with the bot **token**:

```
123456789:AAH4xxxxxxxxxxxxxxxxxxxxxxx
```

Save it as `TELEGRAM_BOT_TOKEN` in `.env.local`.

## 2. Get your chat id

Open the bot, send any message (e.g. `/start`). Then:

```sh
curl "https://api.telegram.org/bot<TOKEN>/getUpdates"
```

Look for `"chat": { "id": 123456789, ... }` in the JSON. Save that
number as `TELEGRAM_ADMIN_CHAT_ID`.

Restart the dev server. New listings will now push notifications to the
chat with two URL-style buttons that link back to `/admin/queue`.

## 3. Approve / Reject directly in Telegram (optional)

The "✅ Approve" and "❌ Reject" inline buttons fire `callback_query`
events. Telegram needs a **public URL** to POST those events to — it
won't reach `localhost`.

Two options:

- **ngrok / cloudflared** (local dev):

  ```sh
  ngrok http 3000
  # → https://abc-12-34-56-78.ngrok-free.app
  ```

- **Deploy** to Vercel / Cloudflare Pages and use the production URL.

Generate a secret and add to `.env.local`:

```sh
# Linux/macOS
openssl rand -hex 32

# Windows PowerShell
[Convert]::ToHexString((1..32 | ForEach-Object { Get-Random -Maximum 256 }))
```

```env
TELEGRAM_WEBHOOK_SECRET=<that-hex-string>
```

Register the webhook with Telegram (one-off):

```sh
curl "https://api.telegram.org/bot<TOKEN>/setWebhook" \
  -d "url=https://<YOUR_PUBLIC_URL>/api/telegram/webhook" \
  -d "secret_token=<TELEGRAM_WEBHOOK_SECRET>" \
  -d 'allowed_updates=["callback_query"]'
```

Telegram should respond `{"ok":true,"result":true,...}`. From now on,
tapping the buttons will:

1. Run the admin action server-side (UPDATE / DELETE on `listings`)
2. Show a toast ("Approved ✅" / "Rejected ❌")
3. Edit the original message to append the result

## 4. Remove the webhook later

```sh
curl "https://api.telegram.org/bot<TOKEN>/deleteWebhook"
```
