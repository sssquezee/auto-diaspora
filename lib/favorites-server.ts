/**
 * Server-side favorites — DB-backed.
 *
 * Replaces the localStorage approach for any flow that runs on the server
 * (catalog pages, listing detail, account dashboard). The browser-side
 * FavoriteButton still optimistically toggles UI state but calls Server
 * Actions for persistence.
 */

import { createClient } from "@/lib/supabase/server";

export type FavoritesState = {
  isAuthed: boolean;
  favoriteIds: Set<string>;
};

export async function getFavoritesState(): Promise<FavoritesState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { isAuthed: false, favoriteIds: new Set() };

  const { data } = await supabase
    .from("favorites")
    .select("listing_id")
    .eq("user_id", user.id);

  const ids = new Set<string>(
    (data ?? []).map((r) => (r as { listing_id: string }).listing_id)
  );
  return { isAuthed: true, favoriteIds: ids };
}

export async function getFavoritesCount(): Promise<number> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return 0;

  const { count } = await supabase
    .from("favorites")
    .select("listing_id", { count: "exact", head: true })
    .eq("user_id", user.id);
  return count ?? 0;
}
