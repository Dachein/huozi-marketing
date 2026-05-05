import Link from "next/link";
import type { Metadata } from "next";
import { listDynamicPosts } from "@/lib/blog/store";
import { AddPostForm, DeletePostForm } from "./admin-form";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Blog admin — huozi.app",
  robots: { index: false, follow: false },
};

export default async function BlogAdminPage() {
  const posts = await listDynamicPosts();
  posts.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <nav className="mb-8">
        <Link
          href="/blog"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to blog
        </Link>
      </nav>

      <h1 className="font-serif text-3xl font-bold tracking-tight">Blog admin</h1>
      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
        Register a new blog post. Title / date / link land in KV; the actual
        article lives on huozi.app/p/&lt;slug&gt;. Token must match{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">
          BLOG_ADMIN_TOKEN
        </code>{" "}
        on the worker.
      </p>

      <section className="mt-12">
        <h2 className="font-serif text-xl font-bold mb-4">Add post</h2>
        <AddPostForm />
      </section>

      <section className="mt-16">
        <h2 className="font-serif text-xl font-bold mb-4">
          Existing dynamic posts ({posts.length})
        </h2>
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            None yet. Add one above.
          </p>
        ) : (
          <ul className="divide-y divide-border/60 border-t border-border/60">
            {posts.map((p) => (
              <li
                key={p.slug}
                className="py-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="font-serif text-base font-bold truncate">
                    {p.title}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {p.date} · {p.slug}
                  </div>
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground break-all"
                  >
                    {p.url}
                  </a>
                </div>
                <DeletePostForm slug={p.slug} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
