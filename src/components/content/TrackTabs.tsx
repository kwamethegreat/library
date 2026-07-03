import Link from "next/link";

import { cn } from "@/lib/utils";
import type { Tables } from "@/types";

type Track = Tables<"tracks">;

interface TrackTabsProps {
  tracks: Track[];
  /** The active track slug from the URL param; undefined means "All". */
  activeTrack?: string;
}

/**
 * Track switcher for the catalog. Each tab is a Link to /catalog?track=<slug>
 * (the "All" tab clears the param), so switching tracks is plain navigation --
 * shareable, bookmarkable, and already compatible with the URL-param filter
 * state built later. Active state derives from `activeTrack`.
 */
export function TrackTabs({ tracks, activeTrack }: TrackTabsProps) {
  const tabClass = (isActive: boolean) =>
    cn(
      "whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition-colors",
      isActive
        ? "border-accent text-foreground"
        : "border-transparent text-muted-foreground hover:text-foreground",
    );

  return (
    <nav
      aria-label="Tracks"
      className="flex gap-1 overflow-x-auto border-b border-border"
    >
      {/* "All" clears the track filter. */}
      <Link
        href="/catalog"
        aria-current={activeTrack ? undefined : "page"}
        className={tabClass(!activeTrack)}
      >
        All
      </Link>

      {tracks.map((track) => {
        const isActive = track.slug === activeTrack;
        return (
          <Link
            key={track.id}
            href={`/catalog?track=${track.slug}`}
            aria-current={isActive ? "page" : undefined}
            className={tabClass(isActive)}
          >
            {track.title}
          </Link>
        );
      })}
    </nav>
  );
}
