import type { VideoProvider } from "@/types/content";

interface LessonVideoProps {
  provider: VideoProvider | null;
  /** The stored playback / video id (lessons.video_asset_id). */
  videoId: string | null;
}

/**
 * Basic PUBLIC video player for a free lesson (item 119).
 *
 * Scope, on purpose:
 *   - youtube / vimeo -> real public iframe embeds.
 *   - mux             -> placeholder. Mux's real player + SIGNED playback is
 *                        Phase 8; a public stream embed would be throwaway work
 *                        redone there, and paid Mux videos must never be public.
 *
 * Security: `videoId` is author-controlled, so we validate it against a strict
 * per-provider pattern before building any src. A malformed id renders the
 * "unavailable" state rather than an attacker-influenced URL. We also use
 * youtube-nocookie, a minimal `allow` list, and sandbox the frame.
 *
 * Server Component -- the iframe needs no client JS. This fills the `video`
 * slot of LessonTheoryPane (item 115); the 16:9 frame is provided there.
 */
export function LessonVideo({ provider, videoId }: LessonVideoProps) {
  if (!provider || !videoId) {
    return null;
  }

  if (provider === "mux") {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center">
        <span className="font-mono text-xs text-muted-foreground">MUX</span>
        <p className="max-w-xs text-xs text-muted-foreground">
          Secure Mux playback arrives with the video pipeline (Phase 8).
        </p>
      </div>
    );
  }

  const src = buildEmbedSrc(provider, videoId);
  if (!src) {
    return (
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-xs text-muted-foreground">Video unavailable.</p>
      </div>
    );
  }

  return (
    <iframe
      src={src}
      title="Lesson video"
      className="absolute inset-0 h-full w-full"
      loading="lazy"
      // Minimal capability grant; fullscreen is included intentionally.
      allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      // Sandbox: allow the scripts/same-origin the players need, nothing more.
      sandbox="allow-scripts allow-same-origin allow-presentation"
      referrerPolicy="strict-origin-when-cross-origin"
    />
  );
}

/**
 * Build a public embed URL, but only for an id that matches the provider's
 * strict id shape. Returns null for anything unexpected so a bad/hostile id can
 * never be interpolated into a live src.
 */
function buildEmbedSrc(
  provider: Exclude<VideoProvider, "mux">,
  videoId: string,
): string | null {
  switch (provider) {
    case "youtube": {
      // YouTube ids: 11 chars, [A-Za-z0-9_-].
      if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) {
        return null;
      }
      // nocookie domain: no tracking cookie until the user hits play.
      return `https://www.youtube-nocookie.com/embed/${videoId}`;
    }
    case "vimeo": {
      // Vimeo ids are numeric.
      if (!/^[0-9]+$/.test(videoId)) {
        return null;
      }
      return `https://player.vimeo.com/video/${videoId}`;
    }
    default:
      return null;
  }
}
