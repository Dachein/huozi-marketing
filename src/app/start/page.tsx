import Link from "next/link";
import type { Metadata } from "next";
import { CopyButton } from "@/components/copy-button";
import { InstallPicker } from "@/components/start/install-picker";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: t(locale, "start.meta.title"),
    description: t(locale, "start.meta.description"),
  };
}

/**
 * /start — the install guide.
 *
 * Designed to be readable by both humans and LLMs. A Claude Code / Cursor /
 * OpenClaw / custom agent can open this URL (WebFetch or similar), read the
 * prompt below literally, and execute the device-authorization flow
 * end-to-end. The user's only interaction is clicking one Authorize link.
 *
 * All human-facing copy is localized via `start.*` keys. The agentPrompt
 * itself is kept in English because LLMs read English natively; translating
 * it risks subtle semantic drift in the steps the Agent follows.
 *
 * The cloud API origin is env-driven so we can point staging / preview
 * deployments at a different worker without forking the prompt.
 */

const CLOUD_URL = process.env.HUOZI_CLOUD_URL ?? "https://cloud.huozi.app";

const agentPrompt = `Install huozi Cloud.

huozi is an Agent-native cloud drive exposed over MCP. Your job is to
walk the human through getting an api_key, then write that key into your
host's MCP config so the huozi_* tools become callable. All endpoints
are direct calls against ${CLOUD_URL} — no state-machine proxy, no
admin secret. You drive the flow yourself.

STEP 1 — Pick a path. Show these three options to the human verbatim
and ask which one fits:

  1. New user — I'll register you here. Just give me your email; I'll
     read the 6-digit code you receive and finish the install for you.
     No browser needed.
  2. Existing user — open a browser tab to authorize. Recommended if
     you're already signed in to cloud.huozi.app.
  3. I already have an API key (starts with \`hz_\`) and want to paste it.

==========================================================================
PATH 1 — New user, agent-driven (no browser).
==========================================================================

  1a. Ask the human for their email. Validate it's well-formed.

  1b. Request an OTP:

      curl -sS -X POST ${CLOUD_URL}/auth/otp/request \\
        -H "content-type: application/json" \\
        -d '{"email":"<email>"}'
      # → 200 { "ok": true } on success
      # → 429 if rate-limited (3 codes / 10 min / email)

  1c. Tell the human to check their inbox for a 6-digit code from
      huozi. Ask them to paste it. Trim whitespace.

  1d. Verify the code. Capture the JWT from the response body so you
      can authenticate the next call:

      curl -sS -X POST ${CLOUD_URL}/auth/otp/verify \\
        -H "content-type: application/json" \\
        -d '{"email":"<email>","code":"<code>"}'
      # → 200 { "ok": true, "token": "<jwt>", "user": { ... }, ... }
      # → 400 { "error": "invalid_code" }   ask again
      # → 429 { "error": "too_many_attempts" }   start over from 1b

  1e. Bootstrap the user's workspace + api_key in one call. The token
      from 1d is the auth here — pass it as a Bearer header:

      curl -sS -X POST ${CLOUD_URL}/me/workspaces/bootstrap \\
        -H "Authorization: Bearer <jwt>" \\
        -H "content-type: application/json" \\
        -d '{"name":"<host name, e.g. Claude Code>"}'
      # → 200 {
      #     "ok": true,
      #     "api_key": "hz_<slug>_<hex>",
      #     "workspace_slug": "<slug>",
      #     "workspace_created": true,
      #     ...
      #   }

      If the user already had a workspace, this reuses it
      (workspace_created: false) and just mints a fresh key. Either way
      you get an api_key — proceed to STEP 2.

==========================================================================
PATH 2 — Existing user, browser device flow.
==========================================================================

  2a. Request a device code:

      curl -sS -X POST ${CLOUD_URL}/auth/device-code \\
        -H "content-type: application/json" \\
        -d '{"client_name":"<host name>","agent_kind":"<claude-code|cursor|openclaw|generic>"}'
      # → 200 { device_code, user_code, verification_url_complete,
      #         expires_in, interval }

  2b. Tell the human to open verification_url_complete (or copy the
      user_code into cloud.huozi.app/device themselves). Wait for them to
      click Authorize and pick a workspace.

  2c. Poll /auth/token every <interval> seconds (default 5s):

      curl -sS -X POST ${CLOUD_URL}/auth/token \\
        -H "content-type: application/json" \\
        -d '{"device_code":"<code>"}'
      # → 202 { error: "authorization_pending" }   keep polling
      # → 400 { error: "expired_token" }           start over from 2a
      # → 400 { error: "access_denied" }           user clicked Deny
      # → 200 { api_key, workspace, ... }          done

      Stop polling once you see api_key. Proceed to STEP 2.

==========================================================================
PATH 3 — User already has an api_key.
==========================================================================

  Ask them to paste it. It must start with \`hz_\`. Treat it as the
  api_key for STEP 2 — no validation call needed (the next MCP call
  will validate naturally).

==========================================================================
STEP 2 — Install the MCP server in your host's config.
==========================================================================

You now hold an api_key. Pick the snippet matching your host and write
it (NEVER show the api_key to the human):

  claude-code   shell:  claude mcp add --transport http huozi \\
                          ${CLOUD_URL}/mcp \\
                          --header "Authorization: Bearer <api_key>"

  cursor        merge into ~/.cursor/mcp.json (or project-level
                .cursor/mcp.json):
                  { "mcpServers": { "huozi": {
                      "url": "${CLOUD_URL}/mcp",
                      "headers": { "Authorization": "Bearer <api_key>" }
                  } } }

  openclaw      merge into ~/.openclaw/openclaw.json under mcp.servers:
                  { "huozi": {
                      "url": "${CLOUD_URL}/mcp",
                      "headers": { "Authorization": "Bearer <api_key>" }
                  } }

  generic       print the URL + Authorization header, let the human
                paste them into whatever MCP client they use.

==========================================================================
STEP 3 — Verify and announce.
==========================================================================

After the MCP server registers, call:

  huozi_glob { pattern: "**/*" }

  - If it returns successfully (any number of files including 0), the
    install worked. Tell the human:
      "✓ Connected to workspace <slug>. Ask me to read, write, or edit
       files in your huozi workspace."
  - If it 401s, the api_key didn't land in the config — re-check the
    snippet you wrote and ask the human to reload their host.

==========================================================================
Security rules (always).
==========================================================================

  - Never print api_key, jwt, or device_code to the human.
  - Do not persist them anywhere except the MCP config your host owns.
  - The human can revoke any key at any time from the Connected Agents
    panel on cloud.huozi.app/workspace.

If the human is at a terminal themselves and prefers to drive the
install interactively, suggest \`npx huozi-mcp\` instead — same flow,
just with a TTY in the loop.`;

export default async function StartPage() {
  const locale = await getLocale();
  const tx = (key: string) => t(locale, key);

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <div className="text-center mb-12">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-[0.06em]">
          {tx("start.hero.title")}
        </h1>
        <p className="mt-3 text-muted-foreground">
          {tx("start.hero.subtitle")}
        </p>
      </div>

      {/* 0 · Conversational install — the primary path for normal users.
              They paste a short human-readable message into their Agent;
              the Agent WebFetches this very page, reads the agentPrompt
              section below, and drives the /api/agent/* state machine. */}
      <section className="mb-10">
        <div className="flex items-baseline justify-between gap-3 mb-3">
          <h2 className="font-serif text-lg font-bold">
            {tx("start.conversation.title")}
          </h2>
          <span className="text-[11px] uppercase tracking-wider text-accent">
            {tx("start.conversation.badge")}
          </span>
        </div>
        <p className="mb-3 text-sm text-muted-foreground leading-relaxed">
          {tx("start.conversation.desc")}
        </p>
        <div className="relative rounded-xl border-2 border-accent/40 bg-muted/20">
          <pre className="p-5 pr-14 text-base leading-relaxed font-mono whitespace-pre-wrap">
            <code>Install huozi from huozi.app/start.</code>
          </pre>
          <CopyButton text="Install huozi from huozi.app/start." />
        </div>
      </section>

      {/* 0b · Secondary — terminal one-liner for the dev path. Purposely
              less visually heavy than the conversational block above. */}
      <section className="mb-12">
        <div className="flex items-baseline justify-between gap-3 mb-2">
          <h2 className="font-serif text-sm font-medium text-muted-foreground">
            {tx("start.terminal.title")}
          </h2>
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
            {tx("start.terminal.badge")}
          </span>
        </div>
        <div className="relative rounded-lg border border-border bg-muted/30">
          <pre className="p-3 pr-12 text-sm leading-relaxed font-mono">
            <code>npx huozi-mcp</code>
          </pre>
          <CopyButton text="npx huozi-mcp" />
        </div>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          {tx("start.terminal.desc")}
        </p>
      </section>

      {/* 1 · Per-client install picker — MCP × Skill tabs per actual support */}
      <section className="mb-14">
        <div className="mb-4">
          <h2 className="font-serif text-lg font-bold">
            {tx("start.picker.title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
            {tx("start.picker.subtitle")}
          </p>
        </div>
        <InstallPicker agentPrompt={agentPrompt} />
      </section>

      {/* 2 · What happens next */}
      <section className="mb-14">
        <h2 className="font-serif text-lg font-bold mb-4">
          {tx("start.authorize.title")}
        </h2>
        <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-xs font-mono text-muted-foreground mb-3">
          {tx("start.authorize.example")}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {tx("start.authorize.desc")}
        </p>
      </section>

      {/* 3 · Done */}
      <section className="mb-14">
        <h2 className="font-serif text-lg font-bold mb-4">
          {tx("start.done.title")}
        </h2>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {tx("start.done.descBefore")}{" "}
          <span className="font-mono text-foreground">
            {tx("start.done.connectedPhrase")}
          </span>
          {tx("start.done.descAfter")}
        </p>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {tx("start.done.manageBefore")}{" "}
          <Link
            href="/workspace"
            className="underline hover:text-foreground"
          >
            /workspace
          </Link>
          {tx("start.done.manageAfter")}
        </p>
      </section>

      {/* 4 · Manual escape hatch */}
      <section className="mb-14">
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground list-none inline-flex items-center gap-2">
            <span className="inline-block transition-transform group-open:rotate-90 text-[9px]">
              ▸
            </span>
            {tx("start.manual.summary")}
          </summary>
          <div className="mt-4 space-y-4 pl-5 border-l border-border/50">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {tx("start.manual.desc")}
            </p>
            <CodeBlock
              code={`# 1. get codes
curl -sS -X POST ${CLOUD_URL}/auth/device-code \\
  -H "content-type: application/json" -d '{"client_name":"my-cli"}'

# (open verification_url_complete from the response, click Authorize)

# 2. poll every 5s until it returns a key
curl -sS -X POST ${CLOUD_URL}/auth/token \\
  -H "content-type: application/json" \\
  -d '{"device_code":"<from step 1>"}'

# 3. register with Claude Code
claude mcp add --transport http huozi ${CLOUD_URL}/mcp \\
  -H "Authorization: Bearer <api_key from step 2>"`}
            />
            <p className="text-xs text-muted-foreground">
              {tx("start.manual.noteBefore")}{" "}
              <Link
                href="/workspace/connect"
                className="underline hover:text-foreground"
              >
                /workspace/connect
              </Link>
              {tx("start.manual.noteAfter")}
            </p>
          </div>
        </details>
      </section>

      {/* Footer nav */}
      <section>
        <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-border/50">
          <Link
            href="/docs"
            className="flex-1 rounded-lg border border-border p-5 hover:border-foreground/30 transition-colors"
          >
            <h3 className="font-semibold mb-1 text-sm">
              {tx("start.footer.mcp.title")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {tx("start.footer.mcp.desc")}
            </p>
          </Link>
          <Link
            href="/cloud"
            className="flex-1 rounded-lg border border-border p-5 hover:border-foreground/30 transition-colors"
          >
            <h3 className="font-semibold mb-1 text-sm">
              {tx("start.footer.cloud.title")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {tx("start.footer.cloud.desc")}
            </p>
          </Link>
          <Link
            href="/edge"
            className="flex-1 rounded-lg border border-border p-5 hover:border-foreground/30 transition-colors"
          >
            <h3 className="font-semibold mb-1 text-sm">
              {tx("start.footer.edge.title")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {tx("start.footer.edge.desc")}
            </p>
          </Link>
        </div>
      </section>
    </div>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="relative group">
      <pre className="rounded-lg border border-border bg-muted px-4 py-3 pr-12 text-xs leading-relaxed overflow-x-auto font-mono whitespace-pre">
        <code>{code}</code>
      </pre>
      <CopyButton text={code} />
    </div>
  );
}
