/**
 * Shared content types for the learning catalog.
 *
 * Base row types are derived from the generated database types
 * (src/types/database.ts) so they stay in sync with the schema automatically:
 * change a column, run `npm run db:types`, and these update.
 *
 * The generated types widen CHECK-constrained columns to `string`. This file is
 * where we NARROW them to their real allowed values (verified against the DB
 * CHECK constraints), and where we compose the nested / view-model shapes the
 * fetchers and components consume.
 */

import type { AccessLevel } from "@/types/access";
import type { Tables } from "@/types/database";

// --- Narrowed enum unions (from DB CHECK constraints) ----------------------

/** courses.level */
export type CourseLevel = "beginner" | "intermediate" | "advanced";

/** courses.validation_lab_status */
export type ValidationLabStatus = "none" | "draft" | "active" | "archived";

/** courses.category (four operational pillars) */
export type CourseCategory = "LEARN" | "PROJ" | "AUTO" | "CAREER";

/**
 * courses.format -- editorial INTENT, not length:
 *   sprint      = ship one thing, fast
 *   masterclass = master a domain
 * Nullable in the schema (not every course is classified yet).
 */
export type CourseFormat = "sprint" | "masterclass";

/** lessons.video_provider (nullable in the schema) */
export type VideoProvider = "mux" | "youtube" | "vimeo";

/** code_assets.asset_kind */
export type CodeAssetKind = "snippet" | "file" | "repo" | "config";

/** assets.asset_type */
export type AssetType =
  | "file"
  | "pdf"
  | "slides"
  | "dataset"
  | "image"
  | "archive";

/** The denormalized asset-flag columns on courses. */
export type CourseAssetFlag =
  | "has_scaffold"
  | "has_gist"
  | "has_sandbox"
  | "has_local_mirror";

// Note: AccessLevel ("free" | "paid" | "enterprise") is reused from
// @/types/access for every access_level column.

// --- Base row types (single source of truth = generated types) -------------

export type Track = Tables<"tracks">;
export type Course = Tables<"courses">;
export type Module = Tables<"modules">;
export type Lesson = Tables<"lessons">;
export type CodeAsset = Tables<"code_assets">;
export type Asset = Tables<"assets">;

// --- Refined view types (base row + narrowed enum columns) -----------------
// Use these in UI/business code that relies on the constrained values. They
// override the loose `string` (or `string | null`) from the generated row with
// the real union, so exhaustive switches and prop typing work.

export type CourseView = Omit<
  Course,
  "level" | "validation_lab_status" | "access_level" | "category" | "format"
> & {
  level: CourseLevel;
  validation_lab_status: ValidationLabStatus;
  access_level: AccessLevel;
  category: CourseCategory | null;
  format: CourseFormat | null;
};

export type LessonView = Omit<Lesson, "video_provider" | "access_level"> & {
  video_provider: VideoProvider | null;
  access_level: AccessLevel;
};

export type CodeAssetView = Omit<CodeAsset, "asset_kind" | "access_level"> & {
  asset_kind: CodeAssetKind;
  access_level: AccessLevel;
};

export type AssetView = Omit<Asset, "asset_type" | "access_level"> & {
  asset_type: AssetType;
  access_level: AccessLevel;
};

// --- Composed / nested shapes ----------------------------------------------

/** A module with its ordered lessons (course-detail pages). */
export type ModuleWithLessons = Module & {
  lessons: LessonView[];
};

/** A course with its full module/lesson tree (course-detail pages). */
export type CourseWithModules = CourseView & {
  modules: ModuleWithLessons[];
};

// --- Course OUTLINE shapes (public course-detail page) ---------------------
//
// IMPORTANT -- these are METADATA-ONLY view models, and that is the whole
// point. The public course page must advertise paid lessons and paid code
// assets as LOCKED, which means listing that they exist without ever shipping
// their payload to the client.
//
// They are populated by the get_course_lesson_outline() /
// get_course_code_assets() SECURITY DEFINER RPCs, which structurally cannot
// return the payload columns:
//    lessons     -> no body_markdown, no video_asset_id
//    code_assets -> no code_body, no storage_path
//
// The payload is fetched separately, per lesson, behind a server-side
// entitlement check (Phase 6 / 9). Do NOT widen these types to include payload
// columns -- that would defeat the paywall.

/** Safe lesson metadata for the course outline. No body, no video asset id. */
export interface LessonOutline {
  id: string;
  module_id: string;
  slug: string;
  title: string;
  lesson_number: number;
  summary: string | null;
  access_level: AccessLevel;
  is_public_preview: boolean;
  video_provider: VideoProvider | null;
  /** A video exists -- without disclosing which video. */
  has_video: boolean;
}

/** Safe code-asset metadata for the course outline. No code, no storage path. */
export interface CodeAssetMeta {
  id: string;
  lesson_id: string;
  slug: string;
  title: string;
  description: string | null;
  asset_kind: CodeAssetKind;
  language: string;
  access_level: AccessLevel;
}

/** A lesson in the outline, with the code assets attached to it. */
export type LessonOutlineWithAssets = LessonOutline & {
  codeAssets: CodeAssetMeta[];
};

/** A module in the outline, with its ordered lessons. */
export type ModuleOutline = Module & {
  lessons: LessonOutlineWithAssets[];
};

/**
 * The full course-detail payload: the course, its published modules, their
 * published lessons, and every published code asset -- free and paid alike,
 * metadata only.
 */
export type CourseHierarchy = CourseView & {
  modules: ModuleOutline[];
};

// --- Catalog card view-model (CourseCard) ----------------------------------
// The operational card shows System Moat Identifier, Challenge (course) Title,
// Code Asset Flag, and Validation Lab Status -- NOT review stars or generic
// metrics. Includes category and the asset flags so cards and filters can use
// them.

export type CourseCardData = Pick<
  CourseView,
  | "id"
  | "slug"
  | "title"
  | "system_moat_identifier"
  | "code_asset_flag"
  | "validation_lab_status"
  | "level"
  | "access_level"
  | "category"
  | "track_id"
> & {
  has_scaffold: boolean;
  has_gist: boolean;
  has_sandbox: boolean;
  has_local_mirror: boolean;
};
