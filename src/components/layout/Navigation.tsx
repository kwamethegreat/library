import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";


interface NavigationProps {
  /**
   * Auth-aware CTA state. Defaults to logged-out. Once Supabase auth is wired
   * (Phase 2), pass this from a Server Component that reads the session, to
   * flip the CTAs from "Log in / Sign up" to "Dashboard".
   */
  isAuthenticated?: boolean;
}

const navLinks = [
  { href: "/courses", label: "Courses" },
  { href: "/pricing", label: "Pricing" },
];

export function Navigation({ isAuthenticated = false }: NavigationProps) {
  return (
    <header className="border-b border-border">
      <Container>
        <nav className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="text-lg font-semibold tracking-tight">
            [Product Name]
          </Link>

          {/* Minimal system nav */}
          <ul className="hidden items-center gap-6 md:flex">
            {navLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          {/* Auth-aware CTA slots */}
          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className={buttonVariants({ variant: "default", size: "sm" })}
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className={buttonVariants({ variant: "ghost", size: "sm" })}
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className={buttonVariants({ variant: "default", size: "sm" })}
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </nav>
      </Container>
    </header>
  );
}
