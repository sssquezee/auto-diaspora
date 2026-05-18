/**
 * GDPR Article 15 — data portability.
 *
 * Returns a JSON dump of everything we hold for the requesting user:
 * profile, listings (with photo paths), favorites, saved searches,
 * chats + messages, reports they filed, payments. RLS does the gating
 * on each select.
 *
 * Auth: must be signed in. The route is locale-prefixed via middleware
 * and the cookie-bound supabase client.
 */

import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const userId = user.id;

  // Pull everything in parallel — RLS scopes each query to this user.
  const [
    profileRes,
    listingsRes,
    photosRes,
    favoritesRes,
    savedSearchesRes,
    chatsRes,
    messagesRes,
    reportsRes,
    paymentsRes,
  ] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).single(),
    supabase.from("listings").select("*").eq("user_id", userId),
    // listing_photos joined by listing ownership
    supabase
      .from("listing_photos")
      .select("*, listings!inner(user_id)")
      .eq("listings.user_id", userId),
    supabase.from("favorites").select("*").eq("user_id", userId),
    supabase.from("saved_searches").select("*").eq("user_id", userId),
    supabase
      .from("chats")
      .select("*")
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`),
    supabase
      .from("messages")
      .select("*, chats!inner(buyer_id, seller_id)")
      .or(
        `chats.buyer_id.eq.${userId},chats.seller_id.eq.${userId}`
      ),
    supabase.from("reports").select("*").eq("reporter_id", userId),
    supabase.from("payments").select("*").eq("user_id", userId),
  ]);

  const dump = {
    exported_at: new Date().toISOString(),
    user: {
      id: user.id,
      email: user.email,
      created_at: user.created_at,
      last_sign_in_at: user.last_sign_in_at,
    },
    profile: profileRes.data ?? null,
    listings: listingsRes.data ?? [],
    listing_photos: photosRes.data ?? [],
    favorites: favoritesRes.data ?? [],
    saved_searches: savedSearchesRes.data ?? [],
    chats: chatsRes.data ?? [],
    messages: messagesRes.data ?? [],
    reports_filed: reportsRes.data ?? [],
    payments: paymentsRes.data ?? [],
  };

  const today = new Date().toISOString().slice(0, 10);
  const filename = `auto-diaspora-export-${today}.json`;

  return new NextResponse(JSON.stringify(dump, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
