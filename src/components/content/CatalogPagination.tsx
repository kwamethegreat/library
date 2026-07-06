import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

interface CatalogPaginationProps {
  currentPage: number;
  totalPages: number;
  /**
   * Builds a URL for a target page, preserving the current filters/search/track.
   * Provided by the catalog page so this component stays presentational.
   */
  buildPageHref: (page: number) => string;
}

/**
 * Server-rendered pagination for the catalog. Real <a> links (SEO-friendly,
 * works without JS), preserving all active filters via buildPageHref. Renders
 * nothing when there's only a single page.
 */
export function CatalogPagination({
  currentPage,
  totalPages,
  buildPageHref,
}: CatalogPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const linkClass = buttonVariants({ variant: "outline", size: "sm" });
  const disabledClass = `${linkClass} pointer-events-none opacity-50`;
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav
      aria-label="Catalog pagination"
      className="mt-8 flex items-center justify-between gap-4"
    >
      {hasPrev ? (
        <Link
          href={buildPageHref(currentPage - 1)}
          rel="prev"
          className={linkClass}
        >
          Previous
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClass}>
          Previous
        </span>
      )}

      <span className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>

      {hasNext ? (
        <Link
          href={buildPageHref(currentPage + 1)}
          rel="next"
          className={linkClass}
        >
          Next
        </Link>
      ) : (
        <span aria-disabled="true" className={disabledClass}>
          Next
        </span>
      )}
    </nav>
  );
}
