import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types";

export type Course = Tables<"courses">;

/** Published courses within a track, ordered. */
export async function getPublishedCoursesByTrack(
  trackId: string,
): Promise<Course[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("track_id", trackId)
    .eq("published", true)
    .order("sort_order", { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch courses: ${error.message}`);
  }

  return data ?? [];
}

/**
 * A single published course by slug, or null if not found / not visible.
 * Returns null (not throw) for "not found" so callers can render a 404.
 */
export async function getCourseBySlug(slug: string): Promise<Course | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch course: ${error.message}`);
  }

  return data;
}