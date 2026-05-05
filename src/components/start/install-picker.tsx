"use client";

/**
 * InstallPicker — the tabbed install switcher on /start.
 *
 *   1. Top-level tabs pick a CLIENT  (claude-code / cursor / openclaw / generic).
 *   2. If that client has multiple install MODES, a pill group picks one:
 *        - Claude Code  → [ MCP | Skill ]
 *        - Cursor       → [ MCP | Rules ]
 *        - OpenClaw     → [ MCP | Skill ]
 *        - Generic      → no mode pill; the body is the long Agent-readable
 *          prompt and that's the only path.
 *   3. The content area shows one install block with a copy-able command
 *      plus a short i18n'd body/note. Everything comes from the dictionary
 *      under `start.picker.*` so it all flows in zh/en/ja/fr.
 *
 * Commands are defined here in code (they're structured, escape-sensitive
 * strings) while the *explanation* around them is i18n'd.
 */

import { useState } from "react";
import { CopyButton } from "@/components/copy-button";
import { AgentLogo } from "@/components/workspace/agent-logo";
import { useT } from "@/lib/i18n/context";

type Client =
  | "claude-code"
  | "cowork"
  | "cursor"
  | "openclaw"
  | "codex"
  | "hermes"
  | "generic";
type Mode = "mcp" | "skill";

// Canonical 7-tab order — matches the /workspace ConnectPicker on the app
// side. Local-CLI / OAuth-on-first-use clients first (Claude Code), then
// chat-mode device-flow clients (OpenClaw, Hermes), then more local clients
// (Codex, Cursor), then GUI (Cowork), finally the universal Generic Agent
// fallback.
const CLIENTS: Client[] = [
  "claude-code",
  "openclaw",
  "hermes",
  "codex",
  "cursor",
  "cowork",
  "generic",
];

/**
 * Per-client install modes. Every client now ships exactly one path
 * (MCP), so the Mode dimension is structurally a no-op — the layout
 * machinery and the pill row are still here in case we resurrect a
 * second mode for some client later, but with all arrays of length 1
 * the pill row is hidden everywhere.
 *
 * History note: OpenClaw used to expose a Skill mode (ClawHub install
 * via `openclaw skills install huozi/mcp`). It was dropped 2026-05
 * because there is no Skill layer to install — huozi ships only an MCP
 * server, no companion Skill package, and offering the Skill route
 * created a dead path that confused users.
 */
const CLIENT_MODES: Record<Client, Mode[]> = {
  "claude-code": ["mcp"],
  cowork: ["mcp"],
  cursor: ["mcp"],
  openclaw: ["mcp"],
  codex: ["mcp"],
  hermes: ["mcp"],
  generic: ["mcp"],
};

const CLIENT_NAMES: Record<Exclude<Client, "generic">, string> = {
  "claude-code": "Claude Code",
  cowork: "Claude Cowork",
  cursor: "Cursor",
  openclaw: "OpenClaw",
  codex: "Codex",
  hermes: "Hermes Agent",
};

function commandFor(client: Client, mode: Mode): string {
  // Choice 2 across all clients = one CLI line (or GUI URL paste for
  // Cowork). Every client relies on RFC 8252 OAuth-on-first-use:
  // first MCP call returns 401 with WWW-Authenticate, host opens the
  // user's browser, click Approve, host stores the OAuth token in its
  // own credential store. No static api_key in any of these snippets;
  // the api_key path is reserved for Choice 1 (Agent-driven device
  // flow) where the agent itself drives the install.
  if (mode === "mcp" && client === "claude-code") {
    return `claude mcp add --transport http huozi https://cloud.huozi.app/mcp`;
  }
  if (mode === "mcp" && client === "codex") {
    return `codex mcp add huozi --url https://cloud.huozi.app/mcp`;
  }
  if (mode === "mcp" && client === "hermes") {
    // The --auth oauth flag tells Hermes to run the MCP SDK's PKCE +
    // DCR + /.well-known discovery flow (vs expecting a static Bearer
    // header). Without it the connect hangs at 401.
    return `hermes mcp add huozi --url https://cloud.huozi.app/mcp --auth oauth`;
  }
  if (mode === "mcp" && client === "openclaw") {
    // OpenClaw's `mcp set` takes the server JSON inline. We omit the
    // Authorization header — the first MCP call should trigger OAuth
    // discovery on hosts that support it. (OpenClaw RFC 8252 native
    // support is upstream WIP; users on older builds may need to fall
    // back to Choice 1.)
    return `openclaw mcp set huozi '{"url":"https://cloud.huozi.app/mcp","transport":"streamable-http"}'`;
  }
  // Cowork — UI flow, no terminal command. Show the URL itself in
  // the copy box so users can paste it into the Customize >
  // Connectors > + dialog. Cowork drives OAuth itself.
  if (mode === "mcp" && client === "cowork") {
    return `https://cloud.huozi.app/mcp`;
  }
  // Generic — same shape as Cowork: just the URL. The user adapts
  // it to whichever host they're configuring.
  if (mode === "mcp" && client === "generic") {
    return `https://cloud.huozi.app/mcp`;
  }
  // Cursor — empty string so the parent renders mcpJsonSnippet()
  // (config-file paste, no one-line CLI exists).
  return "";
}

export function InstallPicker(_props: { agentPrompt: string }) {
  const t = useT();
  const [client, setClient] = useState<Client>("claude-code");
  // The mode dimension is currently a no-op — every client has a
  // single canonical install path now that OpenClaw's Skill route
  // was retired. Keep it pinned to "mcp" so the rest of the snippet
  // machinery still works without an extra branch.
  const mode: Mode = "mcp";
  void _props;

  function pickClient(c: Client) {
    setClient(c);
  }

  // Choice 1 paste prompt — universal across all agents, only the
  // ?for=<kind> filter changes. The /llms.txt route handler reads
  // ?for and trims its Step 4 to that one host so the agent gets a
  // doc that's already aimed at where it runs.
  const choice1Body = `Install huozi from cloud.huozi.app/llms.txt?for=${client}.`;

  return (
    <div className="space-y-6">
      {/* Step 1: pick your Agent. Native <select> rather than a tab
          row — 7 clients wrap to two lines as tabs, the dropdown is
          one line and scales without a layout shift. The selected
          agent's logo stays visible to the left of the trigger. */}
      <div>
        <label
          htmlFor="install-picker-client"
          className="block text-xs uppercase tracking-[0.15em] text-muted-foreground mb-2"
        >
          {t("start.picker.dropdown.label")}
        </label>
        <div className="relative inline-flex items-center">
          <span className="absolute left-3 pointer-events-none text-foreground">
            <AgentLogo kind={client} size={16} />
          </span>
          <select
            id="install-picker-client"
            value={client}
            onChange={(e) => pickClient(e.target.value as Client)}
            className="appearance-none rounded-md border border-border bg-background pl-9 pr-9 py-1.5 text-sm font-medium hover:border-foreground/40 focus:outline-none focus:border-foreground/60 transition-colors cursor-pointer"
          >
            {CLIENTS.map((c) => {
              const label =
                c === "generic"
                  ? t("start.picker.generic.name")
                  : CLIENT_NAMES[c];
              return (
                <option key={c} value={c}>
                  {label}
                </option>
              );
            })}
          </select>
          <svg
            viewBox="0 0 12 12"
            width="10"
            height="10"
            className="absolute right-3 pointer-events-none text-muted-foreground"
            aria-hidden="true"
          >
            <path
              d="M2 4 L6 8 L10 4"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      {/* Choice 1 · Agent-driven (RFC 8628 device flow).
          Paste-prompt is universal; only the ?for=<kind> query param
          changes per agent so /llms.txt serves a Step 4 already
          narrowed to the right host. */}
      <section>
        <div className="flex items-baseline justify-between gap-3 mb-1.5">
          <h3 className="font-medium text-sm text-foreground">
            {t("start.picker.choice1.title")}
          </h3>
          <span className="text-[10px] uppercase tracking-[0.15em] text-accent">
            {t("start.picker.choice1.badge")}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-2.5">
          {t("start.picker.choice1.desc")}
        </p>
        <div className="relative rounded-lg border-2 border-accent/40 bg-muted/40">
          <pre className="overflow-x-auto px-4 py-3 pr-14 text-sm font-mono leading-relaxed whitespace-pre-wrap break-all">
            {choice1Body}
          </pre>
          <CopyButton text={choice1Body} />
        </div>
      </section>

      {/* Choice 2 · Native CLI / GUI (RFC 8252 OAuth-on-first-use).
          Per-client snippet driven by the same dropdown. */}
      <section>
        <div className="flex items-baseline justify-between gap-3 mb-1.5">
          <h3 className="font-medium text-sm text-foreground">
            {t("start.picker.choice2.title")}
          </h3>
          <span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">
            {t("start.picker.choice2.badge")}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed mb-2.5">
          {t("start.picker.choice2.desc")}
        </p>
        <InstallCell client={client} mode={mode} t={t} />
      </section>
    </div>
  );
}

/**
 * mcp.json snippet for Cursor (the only client that lacks a one-line CLI
 * and still uses a config-file paste). No Authorization header — Cursor
 * supports OAuth-on-first-use, so the first MCP call returns 401 and
 * Cursor opens the user's browser to authorize. Static keys belong to
 * Choice 1 (the Agent-driven device flow), not here.
 */
function mcpJsonSnippet(): string {
  return JSON.stringify(
    {
      mcpServers: {
        huozi: {
          type: "http",
          url: "https://cloud.huozi.app/mcp",
        },
      },
    },
    null,
    2,
  );
}

function InstallCell({
  client,
  mode,
  t,
}: {
  client: Client;
  mode: Mode;
  t: (key: string) => string;
}) {
  const cmd = commandFor(client, mode);
  // Cursor is the only client without a one-line CLI; it gets the
  // mcp.json paste. Everyone else is covered by `cmd`.
  const showJson = mode === "mcp" && client === "cursor";
  const json = showJson ? mcpJsonSnippet() : "";
  const bodyKey = `start.picker.content.${client}.${mode}.body`;
  const step2Key = `start.picker.content.${client}.${mode}.step2`;
  const noteKey = `start.picker.content.${client}.${mode}.note`;
  const body = t(bodyKey);
  const step2 = t(step2Key);
  const note = t(noteKey);
  // `t()` returns the key itself when missing — treat that as absent.
  const hasStep2 = step2 !== step2Key;
  const hasNote = note !== noteKey;

  return (
    <div>
      {body !== bodyKey && (
        <p className="text-sm text-foreground/85 leading-relaxed mb-4">
          {body}
        </p>
      )}
      {cmd && (
        <div className="relative rounded-xl border-2 border-accent/40 bg-muted/20 mb-3">
          <pre className="p-4 pr-14 text-sm leading-relaxed font-mono whitespace-pre overflow-x-auto">
            <code>{cmd}</code>
          </pre>
          <CopyButton text={cmd} />
        </div>
      )}
      {hasStep2 && (
        <p className="text-sm text-foreground/85 leading-relaxed mb-3">
          {step2}
        </p>
      )}
      {json && (
        <div className="relative rounded-xl border-2 border-accent/40 bg-muted/20 mb-3">
          <pre className="p-4 pr-14 text-xs leading-relaxed font-mono whitespace-pre overflow-x-auto">
            <code>{json}</code>
          </pre>
          <CopyButton text={json} />
        </div>
      )}
      {hasNote && (
        <p className="text-xs text-muted-foreground leading-relaxed mt-3">
          {note}
        </p>
      )}
    </div>
  );
}

