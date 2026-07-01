import { Footer } from "@/components/layout/Footer";
import { Navigation } from "@/components/layout/Navigation";
import { getCurrentUser } from "@/lib/auth";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Read the session server-side so the nav reflects real auth state.
  const user = await getCurrentUser();

  return (
    <>
      <Navigation isAuthenticated={!!user} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
