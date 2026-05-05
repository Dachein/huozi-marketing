import Link from "next/link";
import type { Metadata } from "next";
import { CopyButton } from "@/components/copy-button";
import { InstallPicker } from "@/components/start/install-picker";
import { getLocale } from "@/lib/i18n/server";
import { t } from "@/lib/i18n";
import { cloudUrl } from "@/lib/cloud-url";

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

const agentPrompt = `TASK: Install huozi Cloud as an MCP server. This is a setup task — not a
coding project. Do not ask about tech stack, do not write code. Drive the
RFC 8628 device authorization flow end-to-end against ${CLOUD_URL}.

WHY device flow (and not OAuth-on-first-use):
  - Your shell tool is non-TTY → interactive CLIs like \`<host> mcp add
    --auth oauth\` exit immediately
  - You may run headless / sandboxed → no system browser to open
  - You can't bind a localhost callback the user's browser can reach
  Device flow sidesteps all three: the user opens one URL on any device
  with a browser, signs in (Cloud=email OTP, Edge=password — handled by
  the verification page), clicks Approve. You poll for the key. Done.

==========================================================================
STEP 1 — Request a device code.
==========================================================================

curl -sS -X POST ${CLOUD_URL}/auth/device-code \\
  -H "content-type: application/json" \\
  -d '{"client_name":"<host name, e.g. Hermes>","agent_kind":"<claude-code|openclaw|hermes|codex|cursor|cowork|generic>"}'
# → 200 {
#     device_code,                  # opaque, you poll with this
#     user_code,                    # 8-char human-readable, prefilled in URL
#     verification_url,             # bare /device URL
#     verification_url_complete,    # /device?code=XXXX-YYYY (use this one)
#     expires_in: 900,              # 15 min grant TTL
#     interval: 5                   # poll cadence in seconds
#   }

Capture device_code and verification_url_complete into your scratch.

==========================================================================
STEP 2 — Hand the user a single clickable link.
==========================================================================

Print verification_url_complete to the user and tell them, verbatim:

  "Open this link. If asked, sign in (new email = auto-register on Cloud).
   Then click Approve. I'll be polling and pick up the key the moment you
   approve — no need to come back and tell me."

The /device page handles login + grant approval together. New users
register on the spot via email OTP (Cloud) or password (Edge — invite
required).

==========================================================================
STEP 3 — Poll for the api_key.
==========================================================================

Every <interval> seconds (default 5) until terminal:

curl -sS -X POST ${CLOUD_URL}/auth/token \\
  -H "content-type: application/json" \\
  -d '{"device_code":"<from STEP 1>"}'
# → 202 { error: "authorization_pending" }   keep polling
# → 400 { error: "expired_token" }           grant expired, restart STEP 1
# → 400 { error: "access_denied" }           user clicked Deny, stop
# → 200 { api_key, key_id, workspace }       done — capture api_key

==========================================================================
STEP 4 — Install the MCP server in the host's config.
==========================================================================

Pick the host you're running in and write the snippet. NEVER print api_key
to the user.

  claude-code  shell (if you have shell tool access; otherwise tell user
               to run this in their terminal):
                 claude mcp add --transport http huozi ${CLOUD_URL}/mcp \\
                   --header "Authorization: Bearer <api_key>"

  cursor       merge into ~/.cursor/mcp.json (or project-level
               .cursor/mcp.json):
                 { "mcpServers": { "huozi": {
                     "type": "http",
                     "url": "${CLOUD_URL}/mcp",
                     "headers": { "Authorization": "Bearer <api_key>" }
                 } } }

  hermes       append to ~/.hermes/config.yaml (create if missing,
               preserve existing entries):
                 mcp_servers:
                   huozi:
                     url: "${CLOUD_URL}/mcp"
                     headers:
                       Authorization: "Bearer <api_key>"
               Then tell the user to type "/reload-mcp" in chat — slash
               commands have to be typed by the user, you can't issue
               them. Do NOT use \`hermes mcp add\` — it requires a TTY
               and exits in chat shells.

  openclaw     shell:
                 openclaw mcp set huozi '{"url":"${CLOUD_URL}/mcp","transport":"streamable-http","headers":{"Authorization":"Bearer <api_key>"}}'

  codex        shell (two lines, run both):
                 export HUOZI_API_KEY=<api_key>
                 codex mcp add huozi --url ${CLOUD_URL}/mcp \\
                   --bearer-token-env-var HUOZI_API_KEY

  cowork       Tell the user to open Claude Cowork → Customize →
               Connectors → + Add custom connector. Paste this URL into
               the URL field:
                 ${CLOUD_URL}/mcp
               No Authorization header — Cowork drives OAuth on first
               call. The api_key from STEP 3 is unused for cowork; you
               can revoke it after the user finishes setup.

  generic      Register the MCP server in whichever host the user is
               running. URL = ${CLOUD_URL}/mcp, Authorization header =
               "Bearer <api_key>". Per the host's docs, write to its
               config file (JSON / YAML / TOML) or use its CLI. Reload
               the host as it requires (process restart / slash command
               / reconnect).

==========================================================================
STEP 5 — Verify and announce.
==========================================================================

After the host reloads its MCP config, call huozi_whoami via the MCP
tools.
  - 200 with workspace identity → install worked. Tell the user:
      "Connected to workspace <slug>. Ask me to read, write, or edit
       files in your huozi workspace."
  - 401 → api_key didn't land. Re-check STEP 4 snippet, ask user to
    reload host (or /reload-mcp for Hermes).

==========================================================================
Security rules.
==========================================================================

  - Never print api_key or device_code in the conversation.
  - Keep them in your tool scratch only; persist them only into the host
    MCP config that owns them.
  - The user can revoke any key from cloud.huozi.app/workspace.

==========================================================================
Notes for clients that auto-discover.
==========================================================================

If your MCP runtime supports RFC 8628 natively, you don't need this
prompt — it can read

  ${CLOUD_URL}/.well-known/oauth-authorization-server

and use the advertised \`device_authorization_endpoint\` plus
\`grant_type=urn:ietf:params:oauth:grant-type:device_code\` against
\`token_endpoint\` directly. The legacy /auth/token JSON shape used in
STEP 3 is preserved for prompt-driven Agents that find form-encoded
OAuth bodies awkward.`;

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

      {/* (Removed: a `npx huozi-mcp` terminal one-liner used to live
          here. We dropped it as part of the "remote HTTP MCP, no local
          npm" architecture decision — daily-use config is mcp.json with
          type:"http", surfaced via the InstallPicker below.) */}

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
            href={cloudUrl("/workspace")}
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
                href={cloudUrl("/workspace/connect")}
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
