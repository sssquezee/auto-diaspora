/**
 * Server-side saved searches — DB-backed (replaces localStorage).
 */

import { createClient } from "@/lib/supabase/server";

export type SavedSearch = {
  id: string;
  name: string;
  query: string;
  summary: string | null;
  created_at: string;
};

export type SavedSearchesState = {
  isAuthed: boolean;
  /** Query strings already saved by this user — used to disable the "Save" button. */
  savedQueries: Set<string>;
};

export async function getSavedSearchesState(): Promise<SavedSearchesState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { isAuthed: false, savedQueries: new Set() };

  const { data } = await supabase
    .from("saved_searches")
    .select("query")
    .eq("user_id", user.id);

  const queries = new Set<string>(
    (data ?? []).map((r) => (r as { query: string }).query)
  );
  return { isAuthed: true, savedQueries: queries };
}

export async function listSavedSearches(): Promise<SavedSearch[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data } = await supabase
    .from("saved_searches")
    .select("id, name, query, summary, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data ?? []) as SavedSearch[];
}
