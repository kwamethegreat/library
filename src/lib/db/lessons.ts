import { createClient } from "@/lib/supabase/server";
import type { Tables } from "@/types";

export type Lesson = Tables<"lessons">;

/** A single published lesson by slug, or null if not found / not visible. */
export async function getLessonBySlug(slug: string): Promise<Lesson | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to fetch lesson: ${error.message}`);
  }

  return data;
}