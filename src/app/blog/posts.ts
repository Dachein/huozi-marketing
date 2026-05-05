import type { Locale } from "@/lib/i18n";

type PostMeta = {
  title: string;
  excerpt: string;
};

/**
 * Static (compiled-in) blog posts. Kept around so we can pin a post that must
 * survive even if KV is unbound — but normally empty. New posts go into KV
 * via /blog/admin and are served from there alongside whatever is here.
 */
export type Post = {
  slug: string;
  date: string;
  meta: Record<Locale, PostMeta>;
};

export const posts: Post[] = [];

export function getPost(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug);
}
