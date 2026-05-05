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
  | "cursor"
  | "openclaw"
  | "codex"
  | "hermes"
  | "generic";
type Mode = "mcp" | "skill";

const CLIENTS: Client[] = [
  "claude-code",
  "cursor",
  "openclaw",
  "codex",
  "hermes",
  "generic",
];

/**
 * Per-client install modes, matched to each ecosystem's native extension
 * culture:
 *   - Claude Code / Cursor → MCP is the canonical way to extend, and their
 *     MCP tool descriptions carry enough context that a separate Skill
 *     layer is redundant. Same pattern Supabase / Linear / GitHub MCP
 *     servers follow.
 *   - OpenClaw → ClawHub is the first-class ecosystem. Skill and MCP coexist;
 *     users may prefer the Skill entry point.
 *   - Codex → first-class MCP via `codex mcp add` (TOML-backed).
 *   - Hermes → MCP via ~/.hermes/config.yaml; no `mcp add` subcommand yet.
 *   - Generic → only the Agent-readable curl prompt applies.
 */
const CLIENT_MODES: Record<Client, Mode[]> = {
  "claude-code": ["mcp"],
  cursor: ["mcp"],
  openclaw: ["mcp", "skill"],
  codex: ["mcp"],
  hermes: ["mcp"],
  generic: ["mcp"],
};

const CLIENT_NAMES: Record<Exclude<Client, "generic">, string> = {
  "claude-code": "Claude Code",
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
  // OpenClaw skill — published to ClawHub as huozi/mcp; the CLI fetches
  // and wires the skill into ~/.openclaw/skills/ for you.
  if (client === "openclaw" && mode === "skill") {
    return `openclaw skills install huozi/mcp`;
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
      {/* Client tabs */}
      <div className="mb-5 flex flex-wrap gap-1 border-b border-border">
        {CLIENTS.map((c) => {
          const isActive = c === client;
          const label =
            c === "generic" ? t("start.picker.generic.name") : CLIENT_NAMES[c];
          return (
            <button
              key={c}
              type="button"
              onClick={() => pickClient(c)}
              className={`-mb-px inline-flex items-center gap-2 px-4 py-2.5 border-b-2 text-sm font-medium transition-colors ${
                isActive
                  ? "border-accent text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-border"
              }`}
            >
              {c !== "generic" && <AgentLogo kind={c} size={16} />}
              <span>{label}</span>
            </button>
          );
        })}
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
