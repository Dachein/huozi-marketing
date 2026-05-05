import Link from "next/link";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n/server";
import type { Locale } from "@/lib/i18n";
import { listDynamicPosts, type DynamicPost } from "@/lib/blog/store";
import { posts as staticPosts, type Post as StaticPost } from "./posts";

export const metadata: Metadata = {
  title: "Blog — huozi.app",
  description:
    "Notes on Agent-native tools, the tradition of knowledge vessels, and why your data should outlive any one AI.",
};

const labels = {
  zh: { title: "博客", read: "阅读 / Read", external: "↗ 在 huozi 上阅读" },
  en: { title: "Blog", read: "Read / 阅读", external: "↗ Read on huozi" },
  ja: { title: "ブログ", read: "読む / Read", external: "↗ huozi で読む" },
  fr: { title: "Blog", read: "Lire / Read", external: "↗ Lire sur huozi" },
} as const;

type RenderedPost = {
  slug: string;
  date: string;
  href: string;
  external: boolean;
  primaryTitle: string;
  primaryExcerpt: string;
  secondaryTitle?: string;
  secondaryExcerpt?: string;
};

function fromStatic(post: StaticPost, locale: Locale): RenderedPost {
  const primary = post.meta[locale] ?? post.meta.en;
  const secondary =
    locale === "en" ? post.meta.zh : locale === "zh" ? post.meta.en : post.meta.en;
  return {
    slug: post.slug,
    date: post.date,
    href: `/blog/${post.slug}`,
    external: false,
    primaryTitle: primary.title,
    primaryExcerpt: primary.excerpt,
    secondaryTitle: secondary?.title,
    secondaryExcerpt: secondary?.excerpt,
  };
}

function fromDynamic(post: DynamicPost): RenderedPost {
  return {
    slug: post.slug,
    date: post.date,
    href: post.url,
    external: true,
    primaryTitle: post.title,
    primaryExcerpt: post.excerpt,
    secondaryTitle: post.titleSecondary,
    secondaryExcerpt: post.excerptSecondary,
  };
}

export default async function BlogIndex() {
  const locale = await getLocale();
  const L = labels[locale] ?? labels.en;

  const dynamic = await listDynamicPosts();
  const seen = new Set(dynamic.map((p) => p.slug));
  const merged: RenderedPost[] = [
    ...dynamic.map(fromDynamic),
    ...staticPosts
      .filter((p) => !seen.has(p.slug))
      .map((p) => fromStatic(p, locale)),
  ].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-serif text-4xl font-bold tracking-tight">{L.title}</h1>
      <p className="mt-4 text-base leading-relaxed">
        关于 Agent 时代的工具、知识的器皿,以及为什么你的数据应该比任何一个 AI 活得更久。
      </p>
      <p className="mt-2 text-sm text-muted-foreground leading-relaxed italic">
        Notes on Agent-native tools, the tradition of knowledge vessels, and why
        your data should outlive any one AI.
      </p>

      <div className="mt-12 border-t border-border/60">
        {merged.map((post) => {
          const card = (
            <div className="flex flex-col gap-2">
              <time className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-serif">
                {post.date}
              </time>
              <h2 className="font-serif text-2xl font-bold leading-tight group-hover:text-accent transition-colors">
                {post.primaryTitle}
                {post.secondaryTitle && (
                  <span className="ml-3 font-normal text-muted-foreground">
                    / {post.secondaryTitle}
                  </span>
                )}
              </h2>
              <p className="mt-1 text-sm leading-relaxed">{post.primaryExcerpt}</p>
              {post.secondaryExcerpt && (
                <p className="text-sm text-muted-foreground leading-relaxed italic">
                  {post.secondaryExcerpt}
                </p>
              )}
              <span className="mt-2 text-sm font-medium text-muted-foreground group-hover:text-foreground">
                {post.external ? L.external : L.read} →
              </span>
            </div>
          );

          const className =
            "group block border-b border-border/60 py-8 transition-colors hover:bg-muted/40";

          return post.external ? (
            <a
              key={post.slug}
              href={post.href}
              target="_blank"
              rel="noopener noreferrer"
              className={className}
            >
              {card}
            </a>
          ) : (
            <Link key={post.slug} href={post.href} className={className}>
              {card}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
