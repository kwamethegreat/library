insert into public.code_assets (lesson_id, slug, title, asset_kind, storage_path)
values (
  (select id from public.lessons where slug='what-is-react'),
  'full-project', 'Full Project', 'repo', 'code-assets/what-is-react/project.zip'
);