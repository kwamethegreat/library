import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { LogoutButton } from "@/components/layout/LogoutButton";
import { buttonVariants } from "@/components/ui/button";
import { TierBadge } from "@/components/ui/TierBadge";
import type { UserTier } from "@/types";

interface NavigationProps {
  /**
   * Auth-aware CTA state. Defaults to logged-out. The (public) layout reads the
   * session in a Server Component and passes this, flipping the CTAs from
   * "Log in / Sign up" to "Dashboard / Log out".
   */
  isAuthenticated?: boolean;
  /**
   * The logged-in user's tier, shown as a badge. Undefined when logged out.
   */
  tier?: UserTier;
}

const navLinks = [
  { href: "/courses", label: "Courses" },
  { href: "/pricing", label: "Pricing" },
];

export function Navigation({ isAuthenticated = false, tier }: NavigationProps) {
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
              <>
                {tier && <TierBadge tier={tier} />}
                <Link
                  href="/dashboard"
                  className={buttonVariants({ variant: "default", size: "sm" })}
                >
                  Dashboard
                </Link>
                <LogoutButton />
              </>
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
