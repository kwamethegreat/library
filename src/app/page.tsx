import { Footer } from "@/components/layout/Footer";
import { Navigation } from "@/components/layout/Navigation";

export default function Home() {
  return (
    <>
      <Navigation />
      <main className="flex-1 p-8">Short content</main>
      <Footer />
    </>
  );
}