import { DocsSidebarNav } from "@/components/docs/sidebar-nav";

/**
 * Shared shell for /docs/*. Fixed-width sidebar on the left, content
 * pane on the right. The sidebar collapses to a horizontal scroller
 * on tablet/mobile so the whole page stays one column there.
 *
 * Pages render their own <h1> + content; this layout only contributes
 * the nav + outer padding so each page can still claim full title /
 * meta independently.
 */
export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-6 py-12 lg:py-16">
          <div className="lg:grid lg:grid-cols-[200px_minmax(0,1fr)] lg:gap-12">
            <DocsSidebarNav />
            <div className="min-w-0">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
