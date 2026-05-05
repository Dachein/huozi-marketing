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

// Mode labels are product names — we don't translate "MCP" / "Skill".
const MODE_LABELS: Record<Mode, string> = {
  mcp: "MCP",
  skill: "Skill",
};

function commandFor(client: Client, mode: Mode): string {
  // MCP install — runs the host's add-MCP-server command directly
  // against the remote HTTP endpoint. No npm wrapper, no local proxy.
  // The host stores the api_key in its own MCP config; daily traffic
  // goes from the host straight to cloud.huozi.app/mcp.
  if (mode === "mcp" && client === "claude-code") {
    return `claude mcp add --transport http huozi https://cloud.huozi.app/mcp`;
  }
  // Cowork — UI flow, no terminal command. Show the URL itself in the
  // copy box so users can paste it into the Customize > Connectors > +
  // dialog. No `--header` because Cowork drives OAuth itself.
  if (mode === "mcp" && client === "cowork") {
    return `https://cloud.huozi.app/mcp`;
  }
  // OpenAI Codex CLI — same `mcp add` ergonomic, but TOML-backed
  // (~/.codex/config.toml) and reads the bearer indirectly via env-var
  // so the token never lands in plain text inside config.
  if (client === "codex" && mode === "mcp") {
    return `# 1) export the key once in your shell rc
export HUOZI_API_KEY=hz_your_key

# 2) register the server
codex mcp add huozi \\
  --url https://cloud.huozi.app/mcp \\
  --bearer-token-env-var HUOZI_API_KEY`;
  }
  // Cursor / OpenClaw-MCP / Hermes / generic share the same shape: a
  // config-file snippet. We render the YAML/JSON inline below the picker;
  // the function returns an empty string so the parent skips the "command"
  // panel and goes straight to the snippet panel.
  return "";
}

/** Hermes Agent uses YAML, not JSON; bearer is inline (no env-var
 *  redirect documented in their config schema as of Feb 2026). */
function hermesYamlSnippet(): string {
  return `# Append to ~/.hermes/config.yaml
mcp_servers:
  huozi:
    url: "https://cloud.huozi.app/mcp"
    headers:
      Authorization: "Bearer hz_your_key"`;
}

export function InstallPicker({ agentPrompt }: { agentPrompt: string }) {
  const t = useT();
  const [client, setClient] = useState<Client>("claude-code");
  const [mode, setMode] = useState<Mode>("mcp");

  const modes = CLIENT_MODES[client];

  function pickClient(c: Client) {
    setClient(c);
    const next = CLIENT_MODES[c];
    if (!next.includes(mode)) setMode(next[0]);
  }

  return (
    <div>
      {/* Client picker — native <select> instead of a tab row.
          The section H2 + subtitle above already explain what
          to pick, so the dropdown stands alone (no inline label).
          Matches the /workspace ConnectPicker on the app side. */}
      <div className="mb-5">
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

      {/* Mode pills — hidden when the client only has one mode */}
      {modes.length > 1 && (
        <div className="mb-5 inline-flex rounded-full border border-border bg-muted/30 p-1">
          {modes.map((m) => {
            const isActive = m === mode;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`px-4 py-1 text-xs font-medium uppercase tracking-[0.15em] rounded-full transition-colors ${
                  isActive
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {MODE_LABELS[m]}
              </button>
            );
          })}
        </div>
      )}

      {/* Content */}
      {client === "generic" ? (
        <GenericCell t={t} agentPrompt={agentPrompt} />
      ) : (
        <InstallCell client={client} mode={mode} t={t} />
      )}
    </div>
  );
}

/**
 * Build the mcp.json snippet a Cursor / OpenClaw config needs.
 * Universal shape:
 *   { "mcpServers": { "huozi": {
 *       "type": "http",
 *       "url": "https://cloud.huozi.app/mcp",
 *       "headers": { "Authorization": "Bearer hz_your_key" }
 *   } } }
 *
 * The placeholder string `hz_your_key` is intentional — users grab their
 * actual key from /workspace/connect on the product side.
 */
function mcpJsonSnippet(): string {
  return JSON.stringify(
    {
      mcpServers: {
        huozi: {
          type: "http",
          url: "https://cloud.huozi.app/mcp",
          headers: {
            Authorization: "Bearer hz_your_key",
          },
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
  const showJson =
    mode === "mcp" && (client === "cursor" || client === "openclaw");
  const json = showJson ? mcpJsonSnippet() : "";
  const yaml = client === "hermes" && mode === "mcp" ? hermesYamlSnippet() : "";
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
      {yaml && (
        <div className="relative rounded-xl border-2 border-accent/40 bg-muted/20 mb-3">
          <pre className="p-4 pr-14 text-xs leading-relaxed font-mono whitespace-pre overflow-x-auto">
            <code>{yaml}</code>
          </pre>
          <CopyButton text={yaml} />
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

function GenericCell({
  t,
  agentPrompt,
}: {
  t: (key: string) => string;
  agentPrompt: string;
}) {
  return (
    <div>
      <p className="text-sm text-foreground/85 leading-relaxed mb-4">
        {t("start.picker.content.generic.mcp.body")}
      </p>
      <div className="relative rounded-xl border-2 border-dashed border-border bg-muted/40">
        <pre className="p-5 pr-14 text-xs leading-relaxed whitespace-pre-wrap break-words font-mono overflow-x-auto max-h-[380px]">
          <code>{agentPrompt}</code>
        </pre>
        <div className="absolute top-3 right-3">
          <CopyButton text={agentPrompt} />
        </div>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed mt-3">
        {t("start.picker.content.generic.mcp.note")}
      </p>
    </div>
  );
}
