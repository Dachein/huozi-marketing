import type { ReactNode } from "react";
import Link from "next/link";
import { headers } from "next/headers";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n";

/**
 * Shared shell for /start — both `/start` (Cloud, default) and
 * `/start/edge` (self-host) live under it. The two-tab nav at the top
 * lets the user switch path without losing the "I'm here to install
 * huozi" framing.
 *
 * The active tab is resolved from the request's pathname (read via
 * x-pathname injected by middleware). We avoid a client component for
 * just the active state — keeping the layout fully server-rendered
 * means the tabs are crawlable + zero JS for the common case.
 */
export default async function StartLayout({
  children,
}: {
  children: ReactNode;
}) {
  const locale = await getLocale();
  const tx = (key: string) => t(locale, key);

  // Best-effort: read the current pathname from the middleware-injected
  // header. Falls back to "" so we don't crash if middleware isn't set.
  const h = await headers();
  const pathname = h.get("x-pathname") ?? h.get("next-url") ?? "";
  const onEdge = pathname.startsWith("/start/edge");

  return (
    <div>
      {/* Shared top header with Cloud / Edge tabs. Visually low-weight
          (text-only with underline accent on active) — feels like the
          continuation of one page, not a sidebar app. */}
      <div className="mx-auto max-w-3xl px-6 pt-12">
        <nav className="flex items-center gap-1 border-b border-border/50">
          <TabLink href="/start" active={!onEdge} label={tx("start.tab.cloud")} />
          <TabLink
            href="/start/edge"
            active={onEdge}
            label={tx("start.tab.edge")}
          />
        </nav>
      </div>
      {children}
    </div>
  );
}

function TabLink({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
        active
          ? "border-foreground text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}
