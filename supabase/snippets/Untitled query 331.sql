insert into public.code_assets (lesson_id, slug, title, language, code_body)
values (
  (select id from public.lessons where slug='what-is-react'),
  'hello-world', 'Hello World', 'typescript', 'console.log("hello");'
);