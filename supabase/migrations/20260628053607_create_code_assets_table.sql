-- code_assets: the "code vault" — code snippets/files attached to a lesson.
-- Short code lives inline in code_body; larger files point to Storage via
-- storage_path. At least one of the two must be present.

create table public.code_assets (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  slug text not null,
  title text not null,
  description text,
  asset_kind text not null default 'snippet',
  language text not null default 'plaintext',
  code_body text,
  storage_path text,
  access_level text not null default 'free',
  published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  -- URL-safe slug, unique within a lesson.
  constraint code_assets_slug_format
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint code_assets_lesson_slug_unique unique (lesson_id, slug),

  -- access_level mirrors the AccessLevel union type.
  constraint code_assets_access_level_check
    check (access_level in ('free', 'paid', 'enterprise')),

  -- asset_kind categorizes the code entry.
  constraint code_assets_asset_kind_check
    check (asset_kind in ('snippet', 'file', 'repo', 'config')),

  -- Must have the code somewhere: inline body OR a storage pointer.
  constraint code_assets_has_content
    check (
      (code_body is not null and length(trim(code_body)) > 0)
      or (storage_path is not null and length(trim(storage_path)) > 0)
    )
);

create trigger code_assets_set_updated_at
  before update on public.code_assets
  for each row
  execute function public.set_updated_at();

-- Index for listing a lesson's published code assets.
create index code_assets_lesson_published_idx
  on public.code_assets (lesson_id, published);

comment on table public.code_assets is
  'Code vault entries for a lesson; code stored inline (code_body) or in Storage (storage_path).';