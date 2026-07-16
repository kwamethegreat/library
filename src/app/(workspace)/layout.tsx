import Link from "next/link";

/**
 * Layout for the immersive lesson WORKSPACE (item 114+).
 *
 * Deliberately NOT the marketing (public) layout: the split-view needs full
 * width and its own minimal chrome, so it does not inherit the public nav's
 * max-width container or the footer. Just a slim top bar to get back out, then
 * the workspace fills the rest.
 *
 * Kept a Server Component -- no client JS at the layout level.
 */
export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Slim top bar */}
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
        <Link href="/" className="text-sm font-semibold tracking-tight">
          [Product Name]
        </Link>
        <Link
          href="/catalog"
          className="text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          Exit to catalog
        </Link>
      </header>

      <main className="flex-1">{children}</main>
    </div>
  );
}
