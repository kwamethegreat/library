select slug, category, level, access_level, has_scaffold, has_gist, has_sandbox, has_local_mirror
from public.courses where published = true order by sort_order;