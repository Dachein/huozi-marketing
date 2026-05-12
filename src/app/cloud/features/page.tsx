import Link from "next/link";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const _ = (key: string) => t(locale, key);
  return {
    title: _("cloud.features.meta.title"),
    description: _("cloud.features.meta.description"),
    openGraph: {
      title: _("cloud.features.meta.title"),
      description: _("cloud.features.meta.description"),
      siteName: "活字 Huozi",
    },
    twitter: { card: "summary_large_image" },
  };
}

// Ordering tells a narrative: data types → live data → live execution
// → sharing → who can use it → tools → history → self-host. The two
// "differentiator" cards (jsonl + jsruntime) sit adjacent because
// they're the data+exec pair that distinguishes huozi from "just
// another cloud drive". Don't move them apart.
const FEATURES: ReadonlyArray<{ key: string; highlight?: boolean }> = [
  { key: "fourtype" },
  { key: "jsonl", highlight: true },
  { key: "jsruntime", highlight: true },
  { key: "share" },
  { key: "collab" },
  { key: "mcp" },
  { key: "history" },
  { key: "edge" },
];

function Tag({ text, accent }: { text: string; accent?: boolean }) {
  const cls = accent
    ? "bg-accent/15 text-accent"
    : "bg-muted-foreground/15 text-muted-foreground";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${cls}`}
    >
      {text}
    </span>
  );
}

export default async function FeaturesPage() {
  const locale = await getLocale();
  const _ = (key: string) => t(locale, key);
  const isCJK = locale === "zh" || locale === "ja";

  return (
    <>
      {/* Hero — terser than /cloud's; this is a "spec sheet" page, not
          a story landing page. */}
      <section className="relative flex flex-col items-center justify-center px-6 pt-20 pb-10">
        <div className="text-center max-w-3xl">
          <div className="mb-4 text-xs uppercase tracking-[0.2em] text-muted-foreground">
            cloud.huozi.app / features
          </div>
          <h1
            className={`font-serif font-bold leading-tight ${
              isCJK
                ? "text-3xl sm:text-4xl md:text-5xl tracking-[0.12em]"
                : "text-2xl sm:text-3xl md:text-4xl tracking-[0.05em]"
            }`}
          >
            {_("cloud.features.hero.title")}
          </h1>
          <p className="mt-5 text-base sm:text-lg text-muted-foreground leading-relaxed">
            {_("cloud.features.hero.subtitle")}
          </p>
        </div>
      </section>

      {/* Features grid. Highlighted cards get an accent border + tinted
          bg so the differentiator pair (jsonl + jsruntime) reads as the
          eye-catchers, not just two more bullets. */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <div className="grid sm:grid-cols-2 gap-5">
          {FEATURES.map((f) => {
            const tagKey = `cloud.features.${f.key}.tag`;
            const tagText = _(tagKey);
            const hasTag = tagText !== tagKey;
            return (
              <div
                key={f.key}
                className={`rounded-xl border p-5 transition-colors ${
                  f.highlight
                    ? "border-accent/30 bg-accent/5 hover:border-accent/60"
                    : "border-border bg-background hover:border-muted-foreground/40"
                }`}
              >
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <h3 className="font-serif text-lg font-semibold">
                    {_(`cloud.features.${f.key}.title`)}
                  </h3>
                  {hasTag && <Tag text={tagText} accent={f.highlight} />}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {_(`cloud.features.${f.key}.body`)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA — bounce visitors back to /cloud where the deep tool list
          and design principles live. */}
      <section className="mx-auto max-w-3xl px-6 pb-24 text-center">
        <h3 className="font-serif text-xl font-semibold mb-2">
          {_("cloud.features.cta.title")}
        </h3>
        <p className="text-sm text-muted-foreground mb-5">
          {_("cloud.features.cta.body")}
        </p>
        <Link
          href="/cloud"
          className="inline-block rounded-full border border-border px-5 py-2 text-sm hover:bg-muted transition-colors"
        >
          {_("cloud.features.cta.link")}
        </Link>
      </section>
    </>
  );
}
