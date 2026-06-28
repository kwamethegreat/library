insert into public.assets (lesson_id, asset_type, title, storage_path, access_level)
values (
  (select id from public.lessons where slug='what-is-react'),
  'pdf', 'Lesson Slides', 'lesson-assets/what-is-react/slides.pdf', 'free'
);