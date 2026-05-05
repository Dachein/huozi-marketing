import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * A blog post registered at runtime via /blog/admin. Content lives on
 * huozi.app/p/<slug> — this row only carries the metadata needed to
 * render a card on the index page and link the reader through.
 */
export type DynamicPost = {
  slug: string;
  date: string;
  url: string;
  title: string;
  excerpt: string;
  /** Optional second-locale display, mirrors the bilingual feel of the static posts. */
  titleSecondary?: string;
  excerptSecondary?: string;
  /** ms epoch when this entry was written. */
  createdAt: number;
};

const KEY_PREFIX = "post:";
const keyFor = (slug: string) => `${KEY_PREFIX}${slug}`;

async function getKV(): Promise<KVNamespace | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env.BLOG_POSTS ?? null;
  } catch {
    return null;
  }
}

export async function listDynamicPosts(): Promise<DynamicPost[]> {
  const kv = await getKV();
  if (!kv) return [];

  const out: DynamicPost[] = [];
  let cursor: string | undefined;
  do {
    const page = await kv.list({ prefix: KEY_PREFIX, cursor });
    const values = await Promise.all(
      page.keys.map((k) => kv.get<DynamicPost>(k.name, "json")),
    );
    for (const v of values) if (v) out.push(v);
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  return out;
}

export async function putDynamicPost(post: DynamicPost): Promise<void> {
  const kv = await getKV();
  if (!kv) throw new Error("BLOG_POSTS KV is not bound on this deployment.");
  await kv.put(keyFor(post.slug), JSON.stringify(post));
}

export async function deleteDynamicPost(slug: string): Promise<void> {
  const kv = await getKV();
  if (!kv) throw new Error("BLOG_POSTS KV is not bound on this deployment.");
  await kv.delete(keyFor(slug));
}

export async function getAdminToken(): Promise<string | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env.BLOG_ADMIN_TOKEN ?? null;
  } catch {
    return null;
  }
}

const SLUG_RE = /^[a-z0-9](?:[a-z0-9-]{0,62}[a-z0-9])?$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function validateSlug(slug: string): string | null {
  if (!SLUG_RE.test(slug)) {
    return "Slug must be lowercase letters, digits, hyphens (1–64 chars).";
  }
  return null;
}

export function validateDate(date: string): string | null {
  if (!DATE_RE.test(date)) return "Date must be YYYY-MM-DD.";
  const t = Date.parse(date);
  if (Number.isNaN(t)) return "Date is not a real calendar date.";
  return null;
}

export function validateUrl(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") {
      return "URL must be http(s).";
    }
    return null;
  } catch {
    return "URL is not parseable.";
  }
}
