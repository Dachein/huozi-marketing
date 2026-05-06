import Link from "next/link";
import type { Metadata } from "next";
import { CopyButton } from "@/components/copy-button";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n";
import { cloudUrl } from "@/lib/cloud-url";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const _ = (key: string) => t(locale, key);
  return {
    title: _("cloud.meta.title"),
    description: _("cloud.meta.description"),
    openGraph: {
      title: _("cloud.meta.title"),
      description: _("cloud.meta.description"),
      siteName: "活字 Huozi",
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

// Source-of-truth ordering for the cloud tools section.  Each group
// matches a section heading on /cloud; ordering inside the group is
// "most-used first → niche last" so the eye lands on the workhorse tools.
// Keep the descKey aligned with the i18n key — `huozi_batch_edit` reads
// `cloud.tools.batch.desc` for historical parity with the older 7-tool
// content (avoids touching every locale just to rename one key).
const TOOL_GROUPS: ReadonlyArray<{
  key: "dialect" | "dirops" | "binary" | "publish";
  tools: ReadonlyArray<{ name: string; descKey: string }>;
}> = [
  {
    key: "dialect",
    tools: [
      { name: "huozi_read", descKey: "read" },
      { name: "huozi_edit", descKey: "edit" },
      { name: "huozi_write", descKey: "write" },
      { name: "huozi_glob", descKey: "glob" },
      { name: "huozi_grep", descKey: "grep" },
    ],
  },
  {
    key: "dirops",
    tools: [
      { name: "huozi_list_tree", descKey: "list_tree" },
      { name: "huozi_mkdir", descKey: "mkdir" },
      { name: "huozi_mv", descKey: "mv" },
      { name: "huozi_rm", descKey: "rm" },
      { name: "huozi_batch_edit", descKey: "batch" },
      { name: "huozi_history", descKey: "history" },
    ],
  },
  {
    key: "binary",
    tools: [
      { name: "huozi_upload", descKey: "upload" },
      { name: "huozi_download", descKey: "download" },
      { name: "huozi_image_render", descKey: "image_render" },
    ],
  },
  {
    key: "publish",
    tools: [
      { name: "huozi_template", descKey: "template" },
      { name: "huozi_share", descKey: "share" },
      { name: "huozi_whoami", descKey: "whoami" },
    ],
  },
];

function CodeBlock({ code, lang }: { code: string; lang?: string }) {
  return (
    <div className="relative group">
      <pre className="rounded-lg border border-border bg-muted p-4 pr-12 text-sm overflow-x-auto">
        <code className={lang ? `language-${lang}` : undefined}>{code}</code>
      </pre>
      <CopyButton text={code} />
    </div>
  );
}

function Status({
  kind,
  text,
}: {
  kind: "shipping" | "coming" | "preview";
  text: string;
}) {
  const cls = {
    shipping: "bg-accent/15 text-accent",
    coming: "bg-muted-foreground/15 text-muted-foreground",
    preview: "bg-muted-foreground/15 text-muted-foreground",
  }[kind];
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium uppercase tracking-wider ${cls}`}>
      {text}
    </span>
  );
}

export default async function CloudPage() {
  const locale = await getLocale();
  const _ = (key: string) => t(locale, key);
  const isCJK = locale === "zh" || locale === "ja";

  // Marketing site assumes anonymous visitors — no cross-app auth peek.
  // The product app (huozi.app/{workspace,login,…}) has its own
  // authenticated CTAs once the user signs in.
  const signedIn = false;

  return (
    <>
        {/* Hero */}
        <section className="relative flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-1/3 left-0 right-0 h-64 animate-mist"
              style={{
                background:
                  "radial-gradient(ellipse 80% 50% at 50% 50%, var(--border), transparent)",
              }}
            />
          </div>

          <div className="relative z-10 text-center max-w-3xl">
            <div className="mb-6 flex items-center justify-center gap-3">
              <Status kind="preview" text={_("cloud.status.preview")} />
              <span className="text-xs text-muted-foreground">
                cloud.huozi.app
              </span>
            </div>

            <h1
              className={`font-serif font-bold leading-tight animate-ink-reveal ${
                isCJK
                  ? "text-4xl sm:text-5xl md:text-6xl tracking-[0.15em]"
                  : "text-3xl sm:text-4xl md:text-5xl tracking-[0.06em]"
              }`}
            >
              <span className="text-accent">云</span> huozi Cloud
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed animate-ink-reveal delay-200">
              {_("cloud.hero.tagline1")}
              <br />
              <span className="text-sm sm:text-base">
                {_("cloud.hero.tagline2")}
              </span>
            </p>

            <div className="mt-10 mb-4 flex items-center justify-center gap-4 animate-ink-reveal-slow delay-400">
              <span className="block w-16 h-px bg-border" />
              <span className="text-accent text-lg font-serif">载</span>
              <span className="block w-16 h-px bg-border" />
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={cloudUrl(signedIn ? "/workspace" : "/login?redirect=/workspace")}
                className="rounded-full bg-foreground px-6 py-2.5 text-sm font-medium text-background hover:opacity-90 transition-opacity"
              >
                {signedIn ? _("cloud.cta.open") : _("cloud.cta.signInWorkspace")} →
              </Link>
            </div>
          </div>
        </section>

        {/* The metaphor */}
        <section className="mx-auto max-w-3xl px-6 py-12">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide mb-4">
            {_("cloud.metaphor.title")}
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            {_("cloud.metaphor.body1")}
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            {_("cloud.metaphor.body2")}
          </p>

          <div className="mt-8 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">
                    {_("cloud.compare.physical")}
                  </th>
                  <th className="px-4 py-3 text-left font-medium">
                    {_("cloud.compare.huozi")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <Row a={_("cloud.compare.r1a")} b={_("cloud.compare.r1b")} />
                <Row a={_("cloud.compare.r2a")} b={_("cloud.compare.r2b")} />
                <Row a={_("cloud.compare.r3a")} b={_("cloud.compare.r3b")} />
                <Row a={_("cloud.compare.r4a")} b={_("cloud.compare.r4b")} />
                <Row a={_("cloud.compare.r5a")} b={_("cloud.compare.r5b")} />
              </tbody>
            </table>
          </div>
        </section>

        {/* What's shipped today */}
        <section className="mx-auto max-w-3xl px-6 py-12">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide">
              {_("cloud.shipped.title")}
            </h2>
            <Status kind="shipping" text={_("cloud.status.shipping")} />
          </div>

          <p className="text-muted-foreground leading-relaxed mb-8">
            {_("cloud.shipped.intro1")}
            <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">
              https://cloud.huozi.app/mcp
            </code>
            {_("cloud.shipped.intro2")}
          </p>

          {/* Tool grid grouped by capability area. The "Claude Code 方言"
              group is the dialect-mirror tier (drop-in for any CC-trained
              Agent); the rest are huozi-native extensions, sliced by what
              kind of work they do. Group titles double as the only badge
              users need — no per-card cc-mirror / huozi-ext tag clutter. */}
          {TOOL_GROUPS.map((group) => (
            <div key={group.key} className="mb-8 last:mb-0">
              <h3 className="text-sm font-medium uppercase tracking-[0.18em] text-muted-foreground mb-3">
                {_(`cloud.tools.group.${group.key}.title`)}
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                {group.tools.map((t) => (
                  <ToolCard
                    key={t.name}
                    name={t.name}
                    desc={_(`cloud.tools.${t.descKey}.desc`)}
                  />
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Permissions & collaboration — sits between the bare tool grid
            and the abstract design principles. The two items below are
            both shipped, just under-advertised: scope enforcement is a
            Worker-side hard guarantee, members/invites is a real /workspace/
            members UI surface. Don't move this back into the roadmap. */}
        <section className="mx-auto max-w-3xl px-6 py-12 border-t border-border/50">
          <div className="flex items-center gap-3 mb-3">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide">
              {_("cloud.team.title")}
            </h2>
            <Status kind="shipping" text={_("cloud.status.shipping")} />
          </div>
          <p className="text-muted-foreground leading-relaxed mb-6">
            {_("cloud.team.intro")}
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-border p-5">
              <h3 className="font-semibold mb-2 text-sm">
                {_("cloud.team.scope.title")}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {_("cloud.team.scope.body")}
              </p>
            </div>
            <div className="rounded-lg border border-border p-5">
              <h3 className="font-semibold mb-2 text-sm">
                {_("cloud.team.members.title")}
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {_("cloud.team.members.body")}
              </p>
            </div>
          </div>
        </section>

        {/* Design principles */}
        <section className="mx-auto max-w-3xl px-6 py-12 border-t border-border/50">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide mb-6">
            {_("cloud.principles.title")}
          </h2>

          <ol className="space-y-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <Principle
                key={n}
                n={n}
                title={_(`cloud.principles.${n}.title`)}
                body={_(`cloud.principles.${n}.body`)}
              />
            ))}
          </ol>
        </section>

        {/* Coming soon */}
        <section className="mx-auto max-w-3xl px-6 py-12 border-t border-border/50">
          <div className="flex items-center gap-3 mb-6">
            <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide">
              {_("cloud.roadmap.title")}
            </h2>
            <Status kind="coming" text={_("cloud.status.coming")} />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <Roadmap
                key={n}
                label={_(`cloud.roadmap.${n}.label`)}
                desc={_(`cloud.roadmap.${n}.desc`)}
              />
            ))}
          </div>
        </section>

        {/* Try it */}
        <section
          id="try-it"
          className="mx-auto max-w-3xl px-6 py-12 border-t border-border/50"
        >
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide mb-6">
            {_("cloud.try.title")}
          </h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            {_("cloud.try.intro")}
          </p>

          <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3 mt-8">
            {_("cloud.try.h.claudeCode")}
          </h3>
          <CodeBlock
            code={`claude mcp add --transport http huozi https://cloud.huozi.app/mcp \\
  --header "Authorization: Bearer hz_YOUR_TOKEN"`}
          />

          <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3 mt-8">
            {_("cloud.try.h.claudeDesktop")}
          </h3>
          <CodeBlock
            code={`// ~/Library/Application Support/Claude/claude_desktop_config.json
{
  "mcpServers": {
    "huozi": {
      "type": "http",
      "url": "https://cloud.huozi.app/mcp",
      "headers": {
        "Authorization": "Bearer hz_YOUR_TOKEN"
      }
    }
  }
}`}
          />

          <h3 className="text-sm font-semibold uppercase text-muted-foreground mb-3 mt-8">
            {_("cloud.try.h.rawHttp")}
          </h3>
          <CodeBlock
            code={`curl -X POST https://cloud.huozi.app/mcp \\
  -H "Authorization: Bearer hz_YOUR_TOKEN" \\
  -H "content-type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'`}
          />
        </section>

        {/* Who it's for */}
        <section className="mx-auto max-w-3xl px-6 py-12 border-t border-border/50">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold tracking-wide mb-6">
            {_("cloud.who.title")}
          </h2>

          <div className="space-y-6">
            {[1, 2, 3, 4].map((n) => (
              <Persona
                key={n}
                title={_(`cloud.who.${n}.title`)}
                body={_(`cloud.who.${n}.body`)}
              />
            ))}
          </div>
        </section>

        {/* Footer signature */}
        <section className="mx-auto max-w-3xl px-6 py-12 border-t border-border/50">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="font-serif text-sm">
                <span className="text-accent">字</span> huozi ·{" "}
                <span className="text-accent">云</span> Cloud
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {_("cloud.footer.tagline")}
              </p>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">
                huozi.app
              </Link>
              <Link
                href="/start"
                className="hover:text-foreground transition-colors"
              >
                {_("cloud.footer.publish")}
              </Link>
            </div>
          </div>
        </section>
    </>
  );
}

// ── Small presentational helpers ──────────────────────────────────────

function Row({ a, b }: { a: string; b: string }) {
  return (
    <tr>
      <td className="px-4 py-3 text-muted-foreground">{a}</td>
      <td className="px-4 py-3">{b}</td>
    </tr>
  );
}

function ToolCard({ name, desc }: { name: string; desc: string }) {
  return (
    <div className="rounded-lg border border-border p-5 hover:border-foreground/20 transition-colors">
      <code className="font-mono text-sm font-semibold block mb-2">{name}</code>
      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function Principle({
  n,
  title,
  body,
}: {
  n: number;
  title: string;
  body: string;
}) {
  return (
    <li className="flex gap-5">
      <span className="flex-shrink-0 font-serif text-2xl font-bold text-accent leading-none pt-1">
        {n}
      </span>
      <div>
        <h3 className="font-semibold mb-1">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
      </div>
    </li>
  );
}

function Roadmap({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="rounded-lg border border-dashed border-border p-5">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold text-sm">{label}</h3>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function Persona({ title, body }: { title: string; body: string }) {
  return (
    <div>
      <h3 className="font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
    </div>
  );
}
