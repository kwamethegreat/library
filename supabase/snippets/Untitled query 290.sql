select slug, title from public.courses
where search_vector @@ websearch_to_tsquery('english', 'react');