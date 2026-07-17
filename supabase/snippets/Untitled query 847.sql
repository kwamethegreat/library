update public.lessons
set body_markdown = E'## Overview\n\nReact builds UIs from components.\n\n```tsx\nexport function Hello() {\n  return <h1>Hello</h1>;\n}\n```\n\n- point one\n- point two'
where slug = 'what-is-react';