import Link from "next/link";

import { Container } from "@/components/layout/Container";
import { CTA, PRICING_HREF } from "@/lib/navigation/cta";

/**
 * Footer link columns.
 *
 * Every href here must resolve to a page that actually exists -- a footer full
 * of 404s is worse than a short footer. The Company (About/Contact) and Legal
 * (Privacy/Terms) columns are therefore NOT rendered yet: those pages are built
 * at item 301 (Phase 20). Restore them there.
 *
 * "Pricing" anchors to the homepage teaser until /pricing ships at item 140.
 */
const footerSections = [
  {
    heading: "Product",
    links: [
      { href: CTA.browseCurriculum.href, label: "Catalog" },
      { href: CTA.freeLesson.href, label: "Free lesson" },
      { href: PRICING_HREF, label: "Pricing" },
    ],
  },
  {
    heading: "Account",
    links: [
      { href: "/login", label: "Log in" },
      { href: "/signup", label: "Sign up" },
    ],
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border">
      <Container className="py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              [Product Name]
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              A technical learning platform.
            </p>
          </div>

          {/* Link columns */}
          {footerSections.map((section) => (
            <div key={section.heading}>
              <h3 className="text-sm font-medium text-foreground">
                {section.heading}
              </h3>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
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
            </div>
          ))}
        </div>

        {/* Bottom bar -- sibling of the grid, full width */}
        <div className="mt-10 border-t border-border pt-6 text-sm text-muted-foreground">
          &copy; {year} [Product Name]. All rights reserved.
        </div>
      </Container>
    </footer>
  );
}
