import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy · huozi",
  description:
    "How huozi Cloud handles user data, OAuth tokens, and file content. Architecture-level statement; legally binding policy will replace this page.",
};

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-2xl font-bold mt-12 mb-4 scroll-mt-20">
      <a href={`#${id}`} className="hover:underline">
        {children}
      </a>
    </h2>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm text-foreground/85 mb-4 leading-relaxed">
      {children}
    </p>
  );
}

export default function PrivacyPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        <div className="mx-auto max-w-3xl px-6 py-16">
          <h1 className="text-4xl font-bold tracking-tight">Privacy</h1>
          <p className="mt-3 text-sm uppercase tracking-[0.2em] text-muted-foreground">
            Effective: TBD · Last updated: TBD
          </p>
          <p className="mt-6 text-base text-muted-foreground leading-relaxed">
            This page describes — at the architectural level — what huozi
            Cloud stores, where it stores it, and how authentication
            tokens flow. The wording below is grounded in the source code;
            a fully legal Privacy Policy &amp; Data Processing Addendum
            will replace this page before huozi Cloud is generally
            available. Until then, treat this as a transparency disclosure,
            not a contractual commitment.
          </p>

          <H2 id="data-stored">What we store</H2>
          <P>
            <strong>File bytes</strong>. Anything you write through the
            MCP surface (or through the Web UI) is stored in Cloudflare R2
            keyed by content SHA-1, and indexed in Cloudflare D1 (path,
            commit history, audit rows). Bytes never leave the workspace
            they were written into.
          </P>
          <P>
            <strong>Identity rows</strong>. Email address, OTP codes
            (short-lived), workspace memberships, and per-Agent API keys —
            all in Cloudflare D1. We do not store passwords; Cloud
            authentication is email-OTP only.
          </P>
          <P>
            <strong>Audit log</strong>. One row per write/edit/delete
            commit, naming the principal (user or Agent) and the path
            touched. This is what powers{" "}
            <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
              huozi_history
            </code>
            .
          </P>

          <H2 id="oauth">OAuth tokens (MCP connectors)</H2>
          <P>
            When you connect huozi from Claude.ai, Claude Desktop, Cowork,
            Claude Code, Cursor or Codex via OAuth 2.1 + PKCE, the
            resulting access token is held inside the MCP host&apos;s own
            credential store (macOS Keychain or the platform equivalent).
            huozi&apos;s authorization server issues the token; the host
            stores it; the conversation context never sees it.
          </P>
          <P>
            Each host that authorizes gets its own access token bound to
            one workspace. Revoking a connection in the{" "}
            <Link
              href="https://cloud.huozi.app/workspace/connect"
              className="underline hover:text-foreground"
            >
              workspace settings
            </Link>{" "}
            invalidates that one token immediately and only that one — the
            other Agents you have connected keep working.
          </P>

          <H2 id="not-stored">What we do not store</H2>
          <P>
            <strong>Conversation transcripts</strong>. huozi receives MCP
            tool-call requests (tool name + arguments) and returns
            structured responses. We do not see the LLM prompts that led
            to those tool calls or the model&apos;s reasoning around them.
          </P>
          <P>
            <strong>Cross-workspace correlation</strong>. Workspaces are
            isolated. We do not aggregate file content or names across
            workspaces.
          </P>
          <P>
            <strong>Third-party telemetry on file content</strong>. File
            bytes are not shipped to analytics or LLM providers by huozi.
          </P>

          <H2 id="sharing">Public sharing</H2>
          <P>
            The{" "}
            <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
              huozi_share
            </code>{" "}
            tool publishes a single file to a{" "}
            <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">
              huozi.app/p/&lt;slug&gt;
            </code>{" "}
            URL. An optional 6-digit passcode gates access. Sharing is
            opt-in per file, never automatic; revoking a share removes the
            link immediately.
          </P>

          <H2 id="contact">Contact</H2>
          <P>
            Privacy questions:{" "}
            <a
              href="mailto:hello@huozi.app"
              className="underline hover:text-foreground"
            >
              hello@huozi.app
            </a>
            . Security disclosures should reach the same address — we
            don&apos;t yet run a separate security mailbox.
          </P>

          <p className="mt-12 text-xs text-muted-foreground/70 italic border-t border-border/40 pt-6">
            [LEGAL REVIEW REQUIRED] This page is an architecture-grounded
            transparency statement, not a vetted Privacy Policy. Replace
            with the reviewed legal document before relying on it for
            contractual or compliance purposes (GDPR, CCPA, SOC 2, etc.).
          </p>
        </div>
      </main>
    </div>
  );
}
