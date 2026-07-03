"use client";

import { SearchIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";

/**
 * Catalog search box. Writes the query to the `q` URL param (merging with the
 * existing filter params), so search combines with filters and every searched
 * view is shareable. Debounced so we navigate after the user pauses typing,
 * not on every keystroke.
 */
export function CatalogSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("q") ?? "";

  const [value, setValue] = useState(current);

  // Keep the input in sync if the URL changes externally (back/forward, a
  // shared link, or the Clear-filters button).
  useEffect(() => {
    setValue(current);
  }, [current]);

  // Debounce: push the q param ~300ms after typing stops.
  useEffect(() => {
    const trimmed = value.trim();
    if (trimmed === current) {
      return;
    }
    const timer = setTimeout(() => {
      const next = new URLSearchParams(searchParams.toString());
      if (trimmed) {
        next.set("q", trimmed);
      } else {
        next.delete("q");
      }
      const qs = next.toString();
      router.push(qs ? `/catalog?${qs}` : "/catalog");
    }, 300);
    return () => clearTimeout(timer);
  }, [value, current, router, searchParams]);

  return (
    <div className="relative max-w-sm">
      <SearchIcon
        className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />
      <Input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search challenges..."
        aria-label="Search catalog"
        className="pl-9"
      />
    </div>
  );
}
