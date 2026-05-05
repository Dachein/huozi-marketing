/**
 * Sidebar navigation for /docs/* pages. Sticky on desktop,
 * collapses to a horizontal scroller on narrow viewports.
 *
 * Topics are listed in canonical order (the same order the docs
 * landing page lists them). The current page is highlighted via
 * Next's `usePathname` so deep-linking + back/forward stay in sync.
 */

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n/context";

interface DocsSection {
  href: string;
  labelKey: string;
}

const SECTIONS: DocsSection[] = [
  { href: "/docs", labelKey: "docs.nav.overview" },
  { href: "/docs/editions", labelKey: "docs.nav.editions" },
  { href: "/docs/auth", labelKey: "docs.nav.auth" },
  { href: "/docs/api", labelKey: "docs.nav.api" },
];

export function DocsSidebarNav() {
  const t = useT();
  const pathname = usePathname();

  return (
    <nav
      aria-label="Docs navigation"
      className="lg:sticky lg:top-20 lg:self-start"
    >
      {/* Desktop: vertical list. Mobile/tablet: horizontal scroller. */}
      <div className="lg:hidden -mx-6 px-6 mb-6 overflow-x-auto">
        <ul className="flex gap-2 whitespace-nowrap pb-2">
          {SECTIONS.map((s) => {
            const active = pathname === s.href;
            return (
              <li key={s.href}>
                <Link
                  href={s.href}
                  className={`inline-block rounded-md px-3 py-1.5 text-sm transition-colors ${
                    active
                      ? "bg-foreground text-background"
                      : "border border-border text-muted-foreground hover:text-foreground hover:border-foreground/40"
                  }`}
                >
                  {t(s.labelKey)}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <ul className="hidden lg:flex flex-col gap-1 text-sm">
        <li className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 mb-2 px-3">
          {t("docs.nav.heading")}
        </li>
        {SECTIONS.map((s) => {
          const active = pathname === s.href;
          return (
            <li key={s.href}>
              <Link
                href={s.href}
                className={`block rounded-md px-3 py-1.5 transition-colors ${
                  active
                    ? "bg-muted text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                {t(s.labelKey)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
