select slug, category, has_scaffold, has_sandbox
from public.courses where published = true order by sort_order;