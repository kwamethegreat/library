-- assets: non-code downloadable files attached to a lesson (PDFs, slides,
-- datasets, images). The file lives in Supabase Storage; this row stores a
-- pointer (storage_path) plus metadata and access gating.

create table public.assets (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  asset_type text not null default 'file',
  title text not null,
  storage_path text not null,
  access_level text not null default 'free',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- access_level mirrors the AccessLevel union type.
  constraint assets_access_level_check
    check (access_level in ('free', 'paid', 'enterprise')),

  -- asset_type categorizes the file (drives icon/handling in the UI).
  constraint assets_asset_type_check
    check (asset_type in ('file', 'pdf', 'slides', 'dataset', 'image', 'archive')),

  -- storage_path must be non-empty (it's the pointer into Supabase Storage).
  constraint assets_storage_path_not_empty
    check (length(trim(storage_path)) > 0)
);

create trigger assets_set_updated_at
  before update on public.assets
  for each row
  execute function public.set_updated_at();

-- Index for listing a lesson's assets.
create index assets_lesson_idx
  on public.assets (lesson_id);

comment on table public.assets is
  'Non-code downloadable files for a lesson; storage_path points into Supabase Storage.';