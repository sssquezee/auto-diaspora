/**
 * Shared Telegram → Supabase session provisioning.
 *
 * Find-or-create a Supabase user keyed by telegram_id, then establish a
 * cookie-bound session for it (via a one-time random password). Reused by
 * both Telegram entry points:
 *   - the Login Widget redirect flow (app/api/auth/telegram/route.ts)
 *   - the Mini App initData flow      (app/api/auth/telegram/miniapp/route.ts)
 *
 * Telegram never gives us an email, so the profile uses a synthetic one
 * (profiles.email is NOT NULL). The display fields are refreshed on every
 * login so a changed username / avatar propagates.
 */

import crypto from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type TelegramSessionInput = {
  telegramId: number;
  username: string | null;
  fullName: string | null;
  photoUrl: string | null;
};

/**
 * Returns true once a cookie-bound session has been set on the current
 * request's response. Must run inside a Route Handler / Server Action so
 * the Supabase cookie writes actually land on the response.
 */
export async function establishTelegramSession(
  input: TelegramSessionInput
): Promise<boolean> {
  const { telegramId } = input;
  const admin = createAdminClient();

  // Telegram-supplied display fields, refreshed on every login.
  const tgFields = {
    telegram_username: input.username,
    full_name: input.fullName,
    avatar_url: input.photoUrl,
  };

  // 1. Find existing user by telegram_id, else create one.
  const { data: existing } = await admin
    .from("profiles")
    .select("id,email")
    .eq("telegram_id", telegramId)
    .maybeSingle<{ id: string; email: string }>();

  let userId: string;
  let email: string;

  if (existing) {
    userId = existing.id;
    email = existing.email;
    await admin.from("profiles").update(tgFields).eq("id", userId);
  } else {
    // No email from Telegram → synthetic, unique, satisfies NOT NULL.
    email = `tg${telegramId}@telegram.autodiaspora.app`;
    const { data: created, error: createErr } =
      await admin.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: {
          provider: "telegram",
          telegram_id: telegramId,
          ...tgFields,
        },
      });
    if (createErr || !created.user) return false;
    userId = created.user.id;
    // The handle_new_user trigger already inserted the profile row;
    // fill in the Telegram-specific columns.
    await admin
      .from("profiles")
      .update({ telegram_id: telegramId, ...tgFields })
      .eq("id", userId);
  }

  // 2. Establish a session via a one-time random password.
  const password = `${crypto.randomUUID()}${crypto.randomUUID()}`;
  const { error: pwErr } = await admin.auth.admin.updateUserById(userId, {
    password,
  });
  if (pwErr) return false;

  const supabase = await createClient();
  const { error: signErr } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signErr) return false;

  return true;
}
