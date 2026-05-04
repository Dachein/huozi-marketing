import Link from "next/link";
import type { Metadata } from "next";
import { CopyButton } from "@/components/copy-button";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: t(locale, "start.edge.meta.title"),
    description: t(locale, "start.edge.meta.description"),
  };
}

/**
 * /start/edge — install path for self-hosters.
 *
 * Edge install collapses to one curl-piped command. The script
 * (huozi.app/install) handles deps, OAuth, provisioning, deploy, and
 * prints the admin setup URL at the end. Everything after that mirrors
 * the Cloud flow — same /workspace banner, same hz_link_ snippet.
 *
 * Unlike /start (Cloud), there's no Agent-driven OTP path here: the
 * install is a one-time terminal action, not a conversational install.
 * Once Edge is up, daily-use is identical to Cloud and goes through
 * the standard MCP HTTP transport.
 */
const INSTALL_CMD =
  "bash <(curl -sSL https://huozi.app/install) --hostname edge.you.com";

const AGENT_PROMPT = `Deploy huozi Edge to my Cloudflare account.

Run this one command in my terminal — it handles everything end-to-end:

  ${INSTALL_CMD}

(Replace edge.you.com with whichever subdomain I want. The hostname
must be in a Cloudflare zone I own.)

The script will:
  1. Check prereqs (Node ≥20, jq, openssl, curl, python3).
  2. Open a browser for Cloudflare OAuth — I'll click Authorize.
  3. Tarball-fetch the huozi repo and install dependencies.
  4. Provision D1 + R2 + Durable Objects + DNS + Worker routes.
  5. Compile + deploy both workers (backend + BFF, ~5 minutes).
  6. Print a one-shot https://<host>/admin/setup?secret=... URL.

After it finishes:
  1. Open the printed setup URL in a browser; set my admin email + password.
  2. I land on /workspace. The top banner shows a connection snippet.
  3. Paste that snippet into your MCP config (e.g. Claude Code's mcp.json).
  4. Restart your AI client. Verify with: huozi_glob { pattern: "**/*" }

Other than the Cloudflare browser auth + setting my password, no input
needed from me. Proceed end-to-end.`;

export default async function StartEdgePage() {
  const locale = await getLocale();
  const tx = (key: string) => t(locale, key);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      {/* Heading */}
      <div className="mb-10">
        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.04em] mb-3">
          {tx("start.edge.hero.title")}
        </h1>
        <p className="text-muted-foreground leading-relaxed">
          {tx("start.edge.hero.subtitle")}
        </p>
      </div>

      {/* 1 · The one-liner — front and center */}
      <section className="mb-12">
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <h2 className="font-serif text-lg font-bold">
            {tx("start.edge.oneline.title")}
          </h2>
          <span className="text-[11px] uppercase tracking-wider text-accent">
            {tx("start.edge.oneline.badge")}
          </span>
        </div>
        <div className="relative rounded-xl border-2 border-accent/40 bg-muted/20">
          <pre className="p-5 pr-14 text-sm leading-relaxed font-mono whitespace-pre-wrap break-all">
            <code>{INSTALL_CMD}</code>
          </pre>
          <CopyButton text={INSTALL_CMD} />
        </div>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {tx("start.edge.oneline.desc")}
        </p>
      </section>

      {/* 2 · Prereqs */}
      <section className="mb-10">
        <h2 className="font-serif text-base font-bold mb-3">
          {tx("start.edge.prereq.title")}
        </h2>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>· {tx("start.edge.prereq.cf")}</li>
          <li>· {tx("start.edge.prereq.zone")}</li>
          <li>· {tx("start.edge.prereq.tools")}</li>
        </ul>
      </section>

      {/* 3 · Agent-driven variant */}
      <section className="mb-12">
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <h2 className="font-serif text-lg font-bold">
            {tx("start.edge.agent.title")}
          </h2>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {tx("start.edge.agent.badge")}
          </span>
        </div>
        <p className="mb-3 text-sm text-muted-foreground leading-relaxed">
          {tx("start.edge.agent.desc")}
        </p>
        <div className="relative rounded-lg border border-border bg-muted/30">
          <pre className="p-4 pr-12 text-xs leading-relaxed font-mono whitespace-pre-wrap">
            <code>{AGENT_PROMPT}</code>
          </pre>
          <CopyButton text={AGENT_PROMPT} />
        </div>
      </section>

      {/* 4 · After deploy */}
      <section className="mb-12">
        <h2 className="font-serif text-lg font-bold mb-4">
          {tx("start.edge.after.title")}
        </h2>
        <ol className="space-y-3 text-sm text-muted-foreground leading-relaxed list-decimal list-inside">
          <li>{tx("start.edge.after.s1")}</li>
          <li>{tx("start.edge.after.s2")}</li>
          <li>{tx("start.edge.after.s3")}</li>
          <li>{tx("start.edge.after.s4")}</li>
        </ol>
      </section>

      {/* Footer nav — back to deeper Edge docs / GitHub */}
      <section className="pt-8 border-t border-border/50">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href="/edge"
            className="rounded-lg border border-border p-5 hover:border-foreground/30 transition-colors"
          >
            <h3 className="font-semibold mb-1 text-sm">
              {tx("start.edge.footer.deep.title")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {tx("start.edge.footer.deep.desc")}
            </p>
          </Link>
          <Link
            href="https://github.com/Dachein/huozi"
            className="rounded-lg border border-border p-5 hover:border-foreground/30 transition-colors"
          >
            <h3 className="font-semibold mb-1 text-sm">
              {tx("start.edge.footer.repo.title")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {tx("start.edge.footer.repo.desc")}
            </p>
          </Link>
          <Link
            href="/docs"
            className="rounded-lg border border-border p-5 hover:border-foreground/30 transition-colors"
          >
            <h3 className="font-semibold mb-1 text-sm">
              {tx("start.edge.footer.docs.title")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {tx("start.edge.footer.docs.desc")}
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}
