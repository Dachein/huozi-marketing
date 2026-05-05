import Link from "next/link";
import type { Metadata } from "next";
import { CopyButton } from "@/components/copy-button";

export const metadata: Metadata = {
  title: "Connect huozi · Connectors Directory submission",
  description:
    "How huozi connects to Claude.ai, Cowork, Claude Desktop, Claude Code, Cursor and Codex via OAuth 2.1 over Streamable HTTP. Three worked examples and security notes for the Anthropic Connectors Directory review.",
};

function Code({ code, lang }: { code: string; lang?: string }) {
  return (
    <div className="relative group">
      <pre className="rounded-lg border border-border bg-[#1c1914] text-[#e8e0d0] p-4 pr-12 text-sm overflow-x-auto leading-relaxed">
        <code className={lang ? `language-${lang}` : undefined}>{code}</code>
      </pre>
      <CopyButton text={code} />
    </div>
  );
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-2xl font-bold mt-16 mb-4 scroll-mt-20">
      <a href={`#${id}`} className="hover:underline">
        {children}
      </a>
    </h2>
  );
}

function H3({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="text-lg font-semibold mt-10 mb-3 scroll-mt-20">
      <a href={`#${id}`} className="hover:underline">
        {children}
      </a>
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
      {children}
    </p>
  );
}

function Example({
  n,
  title,
  prompt,
  flow,
}: {
  n: number;
  title: string;
  prompt: string;
  flow: string[];
}) {
  return (
    <section className="mt-8 rounded-xl border border-border bg-muted/20 p-5">
      <h4 className="text-sm font-semibold uppercase tracking-[0.15em] text-muted-foreground mb-2">
        Example {n}
      </h4>
      <p className="text-base font-medium text-foreground mb-3">{title}</p>
      <div className="mb-4">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
          User prompt
        </p>
        <Code code={prompt} />
      </div>
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1.5">
          Tool calls the Agent makes
        </p>
        <ol className="list-decimal pl-5 text-sm text-foreground/85 leading-relaxed space-y-1">
          {flow.map((step, i) => (
            <li key={i}>
              <span className="font-mono text-xs">{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default function ConnectorPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="text-4xl font-bold tracking-tight">
            Connect huozi
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            huozi is a remote MCP server (Streamable HTTP, OAuth 2.1 + PKCE).
            One endpoint —{" "}
            <code className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded">
              https://cloud.huozi.app/mcp
            </code>{" "}
            — speaks the Connectors Directory dialect of Claude.ai, Cowork
            and Claude Desktop, and the same wire to Claude Code, Cursor and
            Codex. No PAT plumbing for end users; the host runs the OAuth
            dance and stores the token.
          </p>

          <H2 id="cowork">Cowork &amp; Claude.ai (Connectors Directory)</H2>
          <P>
            Once huozi is listed in the Connectors Directory, opening the
            connector picker inside Claude.ai or Claude Desktop &gt; Cowork
            and searching <em>huozi</em> shows it. One click runs the OAuth
            authorization in your browser, the host stores the token, and
            the seventeen huozi tools become available in the conversation.
            No terminal, no config file edit.
          </P>
          <P>
            Until the directory listing is live, Cowork users can&apos;t
            install huozi from inside Cowork — the connector picker is
            registry-gated by design. That gap is exactly what this page (and
            the registry submission it accompanies) closes.
          </P>

          <H2 id="claude-code">Claude Desktop &gt; Code &amp; Claude Code CLI</H2>
          <P>
            One terminal command registers huozi in Claude Code&apos;s
            user-scope MCP config (works in every project). Inside the next
            session, type{" "}
            <code className="font-mono text-xs bg-muted px-1">/mcp</code>,
            pick <em>huozi</em>, click Authenticate — the browser handles
            consent and the tools appear in the conversation. The same flow
            applies whether you run Claude Code from a terminal or open the
            Code tab inside Claude Desktop; they share one underlying
            runtime and one config file.
          </P>
          <Code code="claude mcp add --transport http huozi https://cloud.huozi.app/mcp" />

          <H2 id="cursor-codex">Cursor &amp; Codex CLI</H2>
          <P>
            Both ship native remote-MCP support and native OAuth 2.1. In
            Cursor, add a one-line entry to{" "}
            <code className="font-mono text-xs bg-muted px-1">
              ~/.cursor/mcp.json
            </code>{" "}
            and Cursor opens the browser when the first tool fires. In
            Codex, run{" "}
            <code className="font-mono text-xs bg-muted px-1">
              codex mcp login huozi
            </code>{" "}
            after registering the URL.
          </P>
          <Code
            lang="json"
            code={`{
  "mcpServers": {
    "huozi": { "url": "https://cloud.huozi.app/mcp" }
  }
}`}
          />

          <H2 id="examples">Worked examples</H2>
          <P>
            Three real prompts a user types into Claude.ai / Cowork after
            connecting huozi. Each shows the natural-language input and the
            sequence of MCP tool calls the Agent ends up making. These are
            representative — not the whole tool surface.
          </P>

          <Example
            n={1}
            title="Turn a week of research notes into a 16:9 deck"
            prompt={`I dropped a few research notes into huozi this week — pull the ones in research/2026-04 and turn them into a 16:9 pitch deck I can share with the team.`}
            flow={[
              `huozi_glob({ pattern: "research/2026-04/*.md" })`,
              `huozi_read(...)  // each matched file`,
              `huozi_template({ format: "deck" })  // 16:9 self-scaling HTML scaffold`,
              `huozi_write({ file_path: "decks/2026-04-recap.html", content: "..." })`,
              `huozi_share({ file_path: "decks/2026-04-recap.html", passcode: false })`,
            ]}
          />

          <Example
            n={2}
            title="Visualize a CSV and publish a public link"
            prompt={`There's a sales.csv in data/. Build me a clean dashboard view of it and give me a public URL I can text to Sam.`}
            flow={[
              `huozi_read({ file_path: "data/sales.csv" })`,
              `huozi_template({ format: "page" })  // long-form desktop page scaffold`,
              `huozi_write({ file_path: "dashboards/sales.html", content: "..." })`,
              `huozi_share({ file_path: "dashboards/sales.html", passcode: true })`,
            ]}
          />

          <Example
            n={3}
            title="Cross-session knowledge base maintenance"
            prompt={`What changed in the kb/ folder this week, and is anything inconsistent across the architecture pages?`}
            flow={[
              `huozi_history({ file_path: "kb/", since: "2026-04-28" })`,
              `huozi_grep({ pattern: "deprecated|TODO", path: "kb/architecture/" })`,
              `huozi_read(...)  // for each suspicious file`,
              `huozi_batch_edit({ all_or_nothing: true, edits: [...] })  // atomic fix`,
            ]}
          />

          <H2 id="security">Security &amp; data handling</H2>
          <P>
            <strong>OAuth 2.1 + PKCE</strong>. huozi never sees user
            passwords. The MCP host (Claude.ai, Claude Code, Cursor, Codex)
            runs the authorization code flow with PKCE; the resulting access
            token is held inside the host&apos;s own credential store
            (Keychain on macOS, equivalent on other platforms). The token
            never enters the conversation context.
          </P>
          <P>
            <strong>Per-Agent scoping</strong>. Every connection produces
            its own API key bound to one workspace. Revoking a key in the{" "}
            <Link
              href="https://cloud.huozi.app/workspace/connect"
              className="underline hover:text-foreground"
            >
              workspace settings
            </Link>{" "}
            kills only that Agent — the others keep working.
          </P>
          <P>
            <strong>What we store</strong>. File bytes in Cloudflare R2;
            commit metadata, identity rows and audit log in Cloudflare D1.
            Bytes never leave the workspace they were written into. See the{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
              privacy policy
            </Link>{" "}
            for the full statement.
          </P>
          <P>
            <strong>Tool annotations</strong>. Every tool the server exposes
            via MCP <code className="font-mono text-xs bg-muted px-1">
              ListTools
            </code>{" "}
            carries{" "}
            <code className="font-mono text-xs bg-muted px-1">title</code>{" "}
            +{" "}
            <code className="font-mono text-xs bg-muted px-1">
              readOnlyHint
            </code>{" "}
            or{" "}
            <code className="font-mono text-xs bg-muted px-1">
              destructiveHint
            </code>{" "}
            so connector hosts can render confirmation prompts before any
            destructive call. No tool mixes read and write semantics —
            search-style tools never delete, write-style tools never query
            unrelated data.
          </P>

          <H2 id="tool-surface">Tool surface (17)</H2>
          <P>
            Five tools mirror Claude Code&apos;s file-tool dialect (read,
            write, edit, glob, grep) bit-for-bit. The other twelve are
            huozi-native: atomic batch commits, per-file commit history,
            directory operations, binary upload / download, server-side SVG
            rendering, layout templates, public sharing, identity. The full
            grouped table lives on the main{" "}
            <Link href="/docs" className="underline hover:text-foreground">
              docs page
            </Link>
            .
          </P>

          <H2 id="contact">Reviewer / contact</H2>
          <P>
            For Connectors Directory review questions, reach{" "}
            <a
              href="mailto:hello@huozi.app"
              className="underline hover:text-foreground"
            >
              hello@huozi.app
            </a>
            . A test workspace and demo credentials are available on
            request.
          </P>
        </div>
      </main>
    </div>
  );
}
