import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types";

export type Track = Tables<"tracks">;

/**
 * Returns published tracks, ordered for display.
 * RLS ensures only published rows are visible to anon/authenticated callers,
 * but we also filter explicitly for clarity and to keep the intent obvious.
 */
export async function getPublishedTracks(): Promise<Track[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tracks")
    .select("*")
    .eq("published", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch tracks: ${error.message}`);
  }

  return data ?? [];
}