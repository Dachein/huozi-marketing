import { NextResponse, type NextRequest } from "next/server";

/**
 * Marketing site middleware.
 *
 * Currently does one thing: inject `x-pathname` so server-rendered
 * layouts (e.g. /start/layout.tsx, which derives the active Cloud/Edge
 * tab from the URL) can read the current request path without flipping
 * to a client component.
 *
 * Kept minimal on purpose — every middleware tick costs latency on the
 * marketing critical path. Add to it only when you'd otherwise need a
 * client component for something a server component could do.
 */
export function middleware(request: NextRequest) {
  const headers = new Headers(request.headers);
  headers.set(
    "x-pathname",
    request.nextUrl.pathname + request.nextUrl.search,
  );
  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
