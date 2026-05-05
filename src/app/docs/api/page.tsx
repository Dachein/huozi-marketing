import Link from "next/link";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n/server";
import {
  H2,
  H3,
  Lead,
  P,
  Inline,
  Table,
  Th,
  Td,
  Code,
  Note,
  pick,
} from "@/components/docs/elements";

export const metadata: Metadata = {
  title: "HTTP API reference — huozi Docs",
  description:
    "Endpoint contracts for huozi: /.well-known/* OAuth metadata, /auth/device-code + /auth/token (device flow polling), /oauth/* (RFC 8252 + 8628 grants), /mcp (MCP JSON-RPC), /llms.txt (agent-readable spec).",
};

export default async function ApiPage() {
  const locale = await getLocale();
  const t = <T,>(v: Partial<Record<typeof locale, T>>): T => pick(locale, v);

  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">
        {t({
          zh: "HTTP API 参考",
          en: "HTTP API reference",
          ja: "HTTP API リファレンス",
          fr: "Référence API HTTP",
        })}
      </h1>
      <Lead>
        {t({
          zh: "huozi 的所有公开 HTTP 端点。OAuth 元数据按 RFC 8414 / RFC 9728 标准化;MCP 端点是标准 JSON-RPC over HTTP。Cloud 用 cloud.huozi.app,Edge 部署替换为你自己的 worker 域名 —— 端点路径完全一致。",
          en: "All public HTTP endpoints on huozi. OAuth metadata follows RFC 8414 / RFC 9728; the MCP endpoint is standard JSON-RPC over HTTP. Cloud uses cloud.huozi.app; Edge deployments swap in their own worker domain — endpoint paths are identical.",
          ja: "huozi のすべての公開 HTTP エンドポイント。OAuth メタデータは RFC 8414 / RFC 9728 準拠;MCP エンドポイントは標準 JSON-RPC over HTTP。Cloud は cloud.huozi.app、Edge デプロイは自分の worker ドメインに置換 —— エンドポイントパスは同一。",
          fr: "Tous les endpoints HTTP publics de huozi. Les métadonnées OAuth suivent RFC 8414 / RFC 9728 ; l'endpoint MCP est du JSON-RPC standard sur HTTP. Cloud utilise cloud.huozi.app ; les déploiements Edge substituent leur propre domaine worker — les chemins d'endpoint sont identiques.",
        })}
      </Lead>

      <Note>
        {t({
          zh: (
            <>
              下文示例都用 <Inline>https://cloud.huozi.app</Inline> 作为 base。Edge 用户把它换成你自己的 worker URL(比如 <Inline>https://myco.workers.dev</Inline>)即可。
            </>
          ),
          en: (
            <>
              Examples below use <Inline>https://cloud.huozi.app</Inline> as the base. Edge users substitute their own worker URL (e.g.{" "}
              <Inline>https://myco.workers.dev</Inline>).
            </>
          ),
          ja: (
            <>
              以下の例はすべて <Inline>https://cloud.huozi.app</Inline> を base として使用します。Edge ユーザーは自分の worker URL(例:<Inline>https://myco.workers.dev</Inline>)に置き換えてください。
            </>
          ),
          fr: (
            <>
              Les exemples ci-dessous utilisent <Inline>https://cloud.huozi.app</Inline> comme base. Les utilisateurs Edge substituent leur propre URL worker (par ex.{" "}
              <Inline>https://myco.workers.dev</Inline>).
            </>
          ),
        })}
      </Note>

      <H2 id="discovery">
        {t({
          zh: "OAuth 自动发现 (.well-known)",
          en: "OAuth discovery (.well-known)",
          ja: "OAuth 自動検出 (.well-known)",
          fr: "Découverte OAuth (.well-known)",
        })}
      </H2>

      <H3 id="oauth-protected-resource">
        <Inline>GET /.well-known/oauth-protected-resource</Inline>
      </H3>
      <P>
        {t({
          zh: "RFC 9728 protected resource metadata。声明 /mcp 是受 OAuth 保护的资源,客户端遇到 401 时跟着 WWW-Authenticate 到这里发现授权服务器。",
          en: "RFC 9728 protected-resource metadata. Declares /mcp as an OAuth-protected resource. When the client gets 401, it follows WWW-Authenticate here to discover the authorization server.",
          ja: "RFC 9728 protected-resource メタデータ。/mcp が OAuth 保護リソースであることを宣言。クライアントが 401 を受けると、WWW-Authenticate を辿ってここで認可サーバーを発見します。",
          fr: "Métadonnées de ressource protégée RFC 9728. Déclare /mcp comme ressource protégée par OAuth. Quand le client reçoit un 401, il suit WWW-Authenticate jusqu'ici pour découvrir le serveur d'autorisation.",
        })}
      </P>
      <Code
        code={`curl https://cloud.huozi.app/.well-known/oauth-protected-resource

# →
{
  "resource": "https://cloud.huozi.app/mcp",
  "authorization_servers": ["https://cloud.huozi.app"],
  "scopes_supported": ["mcp"],
  "bearer_methods_supported": ["header"],
  "resource_documentation": "https://cloud.huozi.app/start"
}`}
      />

      <H3 id="oauth-authorization-server">
        <Inline>GET /.well-known/oauth-authorization-server</Inline>
      </H3>
      <P>
        {t({
          zh: "RFC 8414 authorization server metadata。客户端从这里读到所有 OAuth 端点(包括 device flow)和支持的 grant types。",
          en: "RFC 8414 authorization-server metadata. The client reads all OAuth endpoints (including device flow) and the supported grant types from here.",
          ja: "RFC 8414 authorization-server メタデータ。クライアントはすべての OAuth エンドポイント(device flow を含む)とサポートされる grant types をここから読みます。",
          fr: "Métadonnées du serveur d'autorisation RFC 8414. Le client lit tous les endpoints OAuth (y compris le device flow) et les grant types supportés ici.",
        })}
      </P>
      <Code
        code={`curl https://cloud.huozi.app/.well-known/oauth-authorization-server

# →
{
  "issuer": "https://cloud.huozi.app",
  "authorization_endpoint": "https://cloud.huozi.app/oauth/authorize",
  "token_endpoint": "https://cloud.huozi.app/oauth/token",
  "registration_endpoint": "https://cloud.huozi.app/oauth/register",
  "device_authorization_endpoint": "https://cloud.huozi.app/auth/device-code",
  "response_types_supported": ["code"],
  "grant_types_supported": [
    "authorization_code",
    "refresh_token",
    "urn:ietf:params:oauth:grant-type:device_code"
  ],
  "code_challenge_methods_supported": ["S256"],
  "token_endpoint_auth_methods_supported": ["none"],
  "scopes_supported": ["mcp"],
  "service_documentation": "https://cloud.huozi.app/start"
}`}
      />

      <H2 id="device-flow">
        {t({
          zh: "Device flow (RFC 8628)",
          en: "Device flow (RFC 8628)",
          ja: "Device flow (RFC 8628)",
          fr: "Device flow (RFC 8628)",
        })}
      </H2>

      <H3 id="auth-device-code">
        <Inline>POST /auth/device-code</Inline>
      </H3>
      <P>
        {t({
          zh: "Device flow 起点。Agent 调它拿一对 device_code(自己用)和 user_code(给人看)。",
          en: "Device flow entry point. Agent calls it to get a paired device_code (for itself) and user_code (for the human).",
          ja: "Device flow のエントリーポイント。エージェントがこれを呼び出して device_code(自分用)と user_code(人間用)のペアを取得します。",
          fr: "Point d'entrée du device flow. L'agent l'appelle pour obtenir une paire device_code (pour lui-même) et user_code (pour l'humain).",
        })}
      </P>

      <Table>
        <thead>
          <tr>
            <Th>
              {t({ zh: "字段", en: "Field", ja: "フィールド", fr: "Champ" })}
            </Th>
            <Th>
              {t({ zh: "类型", en: "Type", ja: "型", fr: "Type" })}
            </Th>
            <Th>
              {t({ zh: "说明", en: "Notes", ja: "説明", fr: "Notes" })}
            </Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td>
              <Inline>client_name</Inline>
            </Td>
            <Td>
              {t({
                zh: "可选 string ≤ 80 字符",
                en: "Optional string ≤ 80 chars",
                ja: "オプション string ≤ 80 文字",
                fr: "string optionnel ≤ 80 caractères",
              })}
            </Td>
            <Td>
              {t({
                zh: "在 connection 列表里显示用,比如 \"Hermes on laptop\"。",
                en: 'Shown in the connection list, e.g. "Hermes on laptop".',
                ja: "connection 一覧に表示用、例 \"Hermes on laptop\"。",
                fr: "Affiché dans la liste des connexions, par ex. « Hermes on laptop ».",
              })}
            </Td>
          </tr>
          <tr>
            <Td>
              <Inline>agent_kind</Inline>
            </Td>
            <Td>
              {t({
                zh: "可选 string ≤ 32 字符",
                en: "Optional string ≤ 32 chars",
                ja: "オプション string ≤ 32 文字",
                fr: "string optionnel ≤ 32 caractères",
              })}
            </Td>
            <Td>
              {t({
                zh: (
                  <>
                    枚举:
                    <Inline>
                      claude-code | cursor | hermes | openclaw | codex | cowork | desktop | generic
                    </Inline>
                    。仅做归类标签,不影响功能。
                  </>
                ),
                en: (
                  <>
                    Enum:{" "}
                    <Inline>
                      claude-code | cursor | hermes | openclaw | codex | cowork | desktop | generic
                    </Inline>
                    . A categorization label; doesn't change functionality.
                  </>
                ),
                ja: (
                  <>
                    Enum:
                    <Inline>
                      claude-code | cursor | hermes | openclaw | codex | cowork | desktop | generic
                    </Inline>
                    。分類ラベルのみで、機能には影響しません。
                  </>
                ),
                fr: (
                  <>
                    Enum :{" "}
                    <Inline>
                      claude-code | cursor | hermes | openclaw | codex | cowork | desktop | generic
                    </Inline>
                    . Un label de catégorisation ; ne change pas le comportement.
                  </>
                ),
              })}
            </Td>
          </tr>
        </tbody>
      </Table>

      <Code
        code={`curl -sS -X POST https://cloud.huozi.app/auth/device-code \\
  -H "content-type: application/json" \\
  -d '{"client_name":"Hermes on laptop","agent_kind":"hermes"}'

# →
{
  "device_code": "<48 hex chars>",
  "user_code": "ABCD-1234",
  "verification_url": "https://cloud.huozi.app/device",
  "verification_url_complete": "https://cloud.huozi.app/device?code=ABCD-1234",
  "expires_in": 900,
  "interval": 5
}`}
      />

      <H3 id="auth-token">
        <Inline>POST /auth/token</Inline>
      </H3>
      <P>
        {t({
          zh: "轮询端点。每 interval 秒(默认 5 秒)调一次直到拿到 api_key 或终态错误。",
          en: "Polling endpoint. Call every `interval` seconds (default 5) until success or a terminal error.",
          ja: "ポーリングエンドポイント。interval 秒(デフォルト 5 秒)ごとに、成功または terminal エラーまで呼び出します。",
          fr: "Endpoint de sondage. Appelez toutes les `interval` secondes (défaut 5) jusqu'au succès ou à une erreur terminale.",
        })}
      </P>
      <Code
        code={`curl -sS -X POST https://cloud.huozi.app/auth/token \\
  -H "content-type: application/json" \\
  -d '{"device_code":"<from /auth/device-code>"}'

# Pending:    202  {"error": "authorization_pending"}
# Expired:    400  {"error": "expired_token"}
# Denied:     400  {"error": "access_denied"}
# Authorized: 200  {
#   "api_key": "hz_<slug>_<32 hex>",
#   "key_id": "k_<16 hex>",
#   "workspace": { "id": "ws_<slug>", "slug": "<slug>" }
# }`}
      />

      <H2 id="oauth-token">
        {t({
          zh: "标准 OAuth token 端点",
          en: "Standard OAuth token endpoint",
          ja: "標準 OAuth トークンエンドポイント",
          fr: "Endpoint OAuth token standard",
        })}
      </H2>

      <H3 id="oauth-token-endpoint">
        <Inline>POST /oauth/token</Inline>
      </H3>
      <P>
        {t({
          zh: "RFC 8252 + RFC 8628 共用的 token 端点。接受 application/json 或 application/x-www-form-urlencoded。三种 grant_type:",
          en: "Token endpoint shared by RFC 8252 + RFC 8628. Accepts application/json or application/x-www-form-urlencoded. Three grant_types:",
          ja: "RFC 8252 + RFC 8628 が共有する token エンドポイント。application/json または application/x-www-form-urlencoded を受け付けます。3 つの grant_type:",
          fr: "Endpoint token partagé par RFC 8252 + RFC 8628. Accepte application/json ou application/x-www-form-urlencoded. Trois grant_types :",
        })}
      </P>

      <Table>
        <thead>
          <tr>
            <Th>grant_type</Th>
            <Th>
              {t({ zh: "用途", en: "Purpose", ja: "用途", fr: "Objet" })}
            </Th>
            <Th>
              {t({ zh: "返回", en: "Returns", ja: "戻り値", fr: "Retourne" })}
            </Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td>
              <Inline>authorization_code</Inline>
            </Td>
            <Td>
              {t({
                zh: "RFC 8252 PKCE auth code 兑换为 access_token + refresh_token",
                en: "RFC 8252 PKCE auth code exchange for access_token + refresh_token",
                ja: "RFC 8252 PKCE auth code を access_token + refresh_token に交換",
                fr: "Échange auth code PKCE RFC 8252 contre access_token + refresh_token",
              })}
            </Td>
            <Td>
              <Inline>
                {"{access_token, token_type:Bearer, expires_in:3600, refresh_token, scope}"}
              </Inline>
            </Td>
          </tr>
          <tr>
            <Td>
              <Inline>refresh_token</Inline>
            </Td>
            <Td>
              {t({
                zh: "用 refresh_token 轮换出新的 access_token",
                en: "Rotate refresh_token to get a new access_token",
                ja: "refresh_token をローテーションして新しい access_token を取得",
                fr: "Faire tourner refresh_token pour obtenir un nouveau access_token",
              })}
            </Td>
            <Td>
              <Inline>
                {"{access_token, token_type:Bearer, expires_in:3600, refresh_token, scope}"}
              </Inline>
            </Td>
          </tr>
          <tr>
            <Td>
              <Inline>urn:ietf:params:oauth:grant-type:device_code</Inline>
            </Td>
            <Td>
              {t({
                zh: "RFC 8628 device code 兑换 token(form-encoded 标准接口)",
                en: "RFC 8628 device-code exchange (form-encoded canonical interface)",
                ja: "RFC 8628 device-code 交換(form-encoded の標準インターフェース)",
                fr: "Échange device-code RFC 8628 (interface canonique form-encoded)",
              })}
            </Td>
            <Td>
              <Inline>{"{access_token, token_type:Bearer, scope}"}</Inline>
            </Td>
          </tr>
        </tbody>
      </Table>

      <Code
        code={`# Device flow via standard OAuth shape
curl -sS -X POST https://cloud.huozi.app/oauth/token \\
  -H "content-type: application/x-www-form-urlencoded" \\
  --data-urlencode "grant_type=urn:ietf:params:oauth:grant-type:device_code" \\
  --data-urlencode "device_code=<from /auth/device-code>"

# → {"access_token":"hz_...","token_type":"Bearer","scope":"mcp"}`}
      />

      <H2 id="mcp">
        {t({
          zh: "MCP 端点",
          en: "MCP endpoint",
          ja: "MCP エンドポイント",
          fr: "Endpoint MCP",
        })}
      </H2>
      <H3 id="mcp-endpoint">
        <Inline>POST /mcp</Inline>
      </H3>
      <P>
        {t({
          zh: "MCP JSON-RPC 2.0 over HTTP(streamable-http transport)。所有 16 个 huozi_* 工具都通过这里调。要求 Authorization: Bearer <token>。无 token 返回 401 + WWW-Authenticate 触发 OAuth 自动发现。",
          en: "MCP JSON-RPC 2.0 over HTTP (streamable-http transport). All 16 huozi_* tools route through this one endpoint. Requires Authorization: Bearer <token>. No token returns 401 + WWW-Authenticate to trigger OAuth auto-discovery.",
          ja: "MCP JSON-RPC 2.0 over HTTP(streamable-http transport)。すべての 16 個の huozi_* ツールはこの 1 つのエンドポイントを経由します。Authorization: Bearer <token> が必要。token なしは 401 + WWW-Authenticate を返し OAuth 自動検出を発火。",
          fr: "MCP JSON-RPC 2.0 sur HTTP (transport streamable-http). Tous les 16 outils huozi_* passent par cet unique endpoint. Requiert Authorization: Bearer <token>. Sans token, retourne 401 + WWW-Authenticate pour déclencher la découverte OAuth automatique.",
        })}
      </P>
      <Code
        code={`curl -sS -X POST https://cloud.huozi.app/mcp \\
  -H "Authorization: Bearer hz_<your_key>" \\
  -H "content-type: application/json" \\
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "huozi_whoami",
      "arguments": {}
    }
  }'`}
      />

      <H2 id="llms-txt">
        {t({
          zh: "Agent 可读规范",
          en: "Agent-readable spec",
          ja: "エージェント可読仕様",
          fr: "Spec lisible par agent",
        })}
      </H2>
      <H3 id="llms-txt-endpoint">
        <Inline>GET /llms.txt</Inline>
      </H3>
      <P>
        {t({
          zh: (
            <>
              按{" "}
              <a className="underline" href="https://llmstxt.org" target="_blank" rel="noopener noreferrer">
                llmstxt.org
              </a>{" "}
              约定的纯文本安装协议。chat-mode Agent 用 WebFetch 拿这份,自己跑 device flow。Cache 5 分钟,内容按 request host 模板生成 —— Edge 部署自动用自己的 worker 域名。
            </>
          ),
          en: (
            <>
              Plain-text install protocol following the{" "}
              <a className="underline" href="https://llmstxt.org" target="_blank" rel="noopener noreferrer">
                llmstxt.org
              </a>{" "}
              convention. Chat-mode agents WebFetch this and drive the device flow themselves. Cached 5 min; content is templated per request host — Edge deploys automatically use their own worker domain.
            </>
          ),
          ja: (
            <>
              <a className="underline" href="https://llmstxt.org" target="_blank" rel="noopener noreferrer">
                llmstxt.org
              </a>{" "}
              規約に準拠したプレーンテキストのインストールプロトコル。チャットモードのエージェントがこれを WebFetch し、自分で device flow を実行します。Cache 5 分;コンテンツは request host ごとにテンプレート化 — Edge デプロイは自分の worker ドメインを自動使用。
            </>
          ),
          fr: (
            <>
              Protocole d'installation en texte brut suivant la convention{" "}
              <a className="underline" href="https://llmstxt.org" target="_blank" rel="noopener noreferrer">
                llmstxt.org
              </a>
              . Les agents en chat WebFetchent ceci et exécutent eux-mêmes le device flow. Cache 5 min ; le contenu est templaté par host de requête — les déploiements Edge utilisent automatiquement leur propre domaine worker.
            </>
          ),
        })}
      </P>
      <Code code={`curl https://cloud.huozi.app/llms.txt`} />

      <H3 id="llms-txt-filter">
        <Inline>GET /llms.txt?for=&lt;agent_kind&gt;</Inline>
      </H3>
      <P>
        {t({
          zh: "把 Step 4 过滤到只剩这一个 host 的 snippet,doc 缩到 ~70%,小 context 模型友好。kind 同上面 agent_kind 枚举。",
          en: "Filters Step 4 down to just that one host's snippet — doc shrinks to ~70%, small-context models stay happy. The kind enum matches agent_kind above.",
          ja: "Step 4 をその 1 つのホストのスニペットだけに絞り込み — doc は ~70% に縮小、小型コンテキストモデルでも快適。kind enum は上の agent_kind と同じ。",
          fr: "Filtre l'étape 4 pour ne garder que la snippet d'un seul hôte — la doc se réduit à ~70%, agréable pour les petits contextes. L'enum kind correspond à agent_kind ci-dessus.",
        })}
      </P>

      <H2 id="see-also">
        {t({ zh: "更多", en: "See also", ja: "関連情報", fr: "Voir aussi" })}
      </H2>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5">
        <li>
          <Link href="/docs/auth" className="underline hover:text-foreground">
            {t({
              zh: "Two install pipelines —— OAuth 与 device flow 深度",
              en: "Two install pipelines — OAuth and device flow deep dive",
              ja: "Two install pipelines — OAuth と device flow の詳細",
              fr: "Deux pipelines d'installation — OAuth et device flow en détail",
            })}
          </Link>
        </li>
        <li>
          <Link href="/docs" className="underline hover:text-foreground">
            {t({
              zh: "MCP tools reference —— 16 个工具",
              en: "MCP tools reference — the 16 tools",
              ja: "MCP tools reference — 16 個のツール",
              fr: "Référence des outils MCP — les 16 outils",
            })}
          </Link>
        </li>
        <li>
          <Link href="/docs/editions" className="underline hover:text-foreground">
            {t({
              zh: "Cloud vs Edge —— 域名替换规则",
              en: "Cloud vs Edge — domain substitution rules",
              ja: "Cloud vs Edge — ドメイン置換ルール",
              fr: "Cloud vs Edge — règles de substitution de domaine",
            })}
          </Link>
        </li>
      </ul>
    </article>
  );
}
