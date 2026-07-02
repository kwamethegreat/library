import { Footer } from "@/components/layout/Footer";
import { Navigation } from "@/components/layout/Navigation";
import { getCurrentUser, getUserTier } from "@/lib/auth";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read the session server-side so the nav reflects real auth state, and fetch
  // the tier for logged-in users so the TierBadge shows their status.
  const user = await getCurrentUser();
  const tier = user ? await getUserTier() : undefined;

  return (
    <>
      <Navigation isAuthenticated={!!user} tier={tier} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
