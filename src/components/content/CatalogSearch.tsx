"use client";

import { SearchIcon } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { MIN_SEARCH_LENGTH } from "@/lib/catalog/filters";

/**
 * Catalog search box. Writes the query to the `q` URL param (merging with the
 * existing filter params), so search combines with filters and every searched
 * view is shareable. Debounced so we navigate after the user pauses typing,
 * not on every keystroke.
 *
 * Too-short guard: we only write `?q=` once the trimmed term reaches
 * MIN_SEARCH_LENGTH, and show a quiet "keep typing" hint below that. This keeps
 * the URL clean and avoids running a useless one-character full-text query. The
 * server-side parser enforces the same floor, so this is UX, not the guarantee.
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

  // Debounce: push the q param ~300ms after typing stops. A term below the
  // minimum length resolves to an empty q, which clears any existing search
  // (e.g. deleting "react" down to "r" resets the list) without ever putting a
  // sub-threshold value in the URL.
  useEffect(() => {
    const trimmed = value.trim();
    const nextQ = trimmed.length >= MIN_SEARCH_LENGTH ? trimmed : "";
    if (nextQ === current) {
      return;
    }
    const timer = setTimeout(() => {
      const next = new URLSearchParams(searchParams.toString());
      if (nextQ) {
        next.set("q", nextQ);
      } else {
        next.delete("q");
      }
      const qs = next.toString();
      router.push(qs ? `/catalog?${qs}` : "/catalog");
    }, 300);
    return () => clearTimeout(timer);
  }, [value, current, router, searchParams]);

  const trimmedLength = value.trim().length;
  const showHint = trimmedLength > 0 && trimmedLength < MIN_SEARCH_LENGTH;

  return (
    <div className="max-w-sm">
      <div className="relative">
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
          aria-describedby={showHint ? "catalog-search-hint" : undefined}
          className="pl-9"
        />
      </div>
      {/* Always-mounted live region so screen readers announce the hint when it
          appears; empty (zero-height) when there's nothing to say. */}
      <div aria-live="polite">
        {showHint ? (
          <p
            id="catalog-search-hint"
            className="mt-1.5 text-xs text-muted-foreground"
          >
            Keep typing to search...
          </p>
        ) : null}
      </div>
    </div>
  );
}
