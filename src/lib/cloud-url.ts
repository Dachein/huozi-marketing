/**
 * Canonical product origin. The marketing site lives on huozi.app, but
 * login / workspace / connect / device / /p all live on cloud.huozi.app.
 * Anything in marketing that links into the product MUST use an absolute
 * URL through this helper — relative paths resolve against huozi.app and
 * hit the main worker's "moved" 404 middleware.
 *
 * Override via HUOZI_CLOUD_URL for staging / preview deploys.
 */
const CLOUD_URL = (
  process.env.HUOZI_CLOUD_URL ?? "https://cloud.huozi.app"
).replace(/\/+$/, "");

/**
 * Build an absolute product URL. Pass paths starting with "/".
 *
 * @example cloudUrl("/login?redirect=/workspace") → "https://cloud.huozi.app/login?redirect=/workspace"
 */
export function cloudUrl(path: string): string {
  if (!path.startsWith("/")) {
    throw new Error(
      `cloudUrl path must start with "/" — got: ${path.slice(0, 64)}`,
    );
  }
  return `${CLOUD_URL}${path}`;
}
