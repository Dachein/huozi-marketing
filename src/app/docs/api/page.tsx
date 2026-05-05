import Link from "next/link";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n/server";
import { H2, H3, Lead, P, Inline, Table, Th, Td, Code, Note } from "@/components/docs/elements";

export const metadata: Metadata = {
  title: "HTTP API reference — huozi Docs",
  description:
    "Endpoint contracts for huozi: /.well-known/* OAuth metadata, /auth/device-code + /auth/token (device flow polling), /oauth/* (RFC 8252 + 8628 grants), /mcp (MCP JSON-RPC), /llms.txt (agent-readable spec).",
};

export default async function ApiPage() {
  const locale = await getLocale();
  const isZh = locale === "zh";

  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">
        {isZh ? "HTTP API reference" : "HTTP API reference"}
      </h1>
      <Lead>
        {isZh
          ? "huozi 的所有公开 HTTP 端点。OAuth 元数据按 RFC 8414 / RFC 9728 标准化;MCP 端点是标准 JSON-RPC over HTTP。Cloud 用 cloud.huozi.app,Edge 部署替换为你自己的 worker 域名 —— 端点路径完全一致。"
          : "All public HTTP endpoints on huozi. OAuth metadata follows RFC 8414 / RFC 9728; the MCP endpoint is standard JSON-RPC over HTTP. Cloud uses cloud.huozi.app; Edge deployments swap in their own worker domain — endpoint paths are identical."}
      </Lead>

      <Note>
        {isZh ? (
          <>
            下文示例都用 <Inline>https://cloud.huozi.app</Inline> 作为 base。Edge 用户把它换成你自己的 worker URL(比如 <Inline>https://myco.workers.dev</Inline>)即可。
          </>
        ) : (
          <>
            Examples below use <Inline>https://cloud.huozi.app</Inline> as the base. Edge users substitute their own worker URL (e.g.{" "}
            <Inline>https://myco.workers.dev</Inline>).
          </>
        )}
      </Note>

      <H2 id="discovery">{isZh ? "OAuth 自动发现 (.well-known)" : "OAuth discovery (.well-known)"}</H2>

      <H3 id="oauth-protected-resource">
        <Inline>GET /.well-known/oauth-protected-resource</Inline>
      </H3>
      <P>
        {isZh
          ? "RFC 9728 protected resource metadata。声明 /mcp 是受 OAuth 保护的资源,客户端遇到 401 时跟着 WWW-Authenticate 到这里发现授权服务器。"
          : "RFC 9728 protected-resource metadata. Declares /mcp as an OAuth-protected resource. When the client gets 401, it follows WWW-Authenticate here to discover the authorization server."}
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
        {isZh
          ? "RFC 8414 authorization server metadata。客户端从这里读到所有 OAuth 端点(包括 device flow)和支持的 grant types。"
          : "RFC 8414 authorization-server metadata. The client reads all OAuth endpoints (including device flow) and the supported grant types from here."}
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

      <H2 id="device-flow">{isZh ? "Device flow (RFC 8628)" : "Device flow (RFC 8628)"}</H2>

      <H3 id="auth-device-code">
        <Inline>POST /auth/device-code</Inline>
      </H3>
      <P>
        {isZh
          ? "Device flow 起点。Agent 调它拿一对 device_code(自己用)和 user_code(给人看)。"
          : "Device flow entry point. Agent calls it to get a paired device_code (for itself) and user_code (for the human)."}
      </P>

      <Table>
        <thead>
          <tr>
            <Th>{isZh ? "字段" : "Field"}</Th>
            <Th>{isZh ? "类型" : "Type"}</Th>
            <Th>{isZh ? "说明" : "Notes"}</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td>
              <Inline>client_name</Inline>
            </Td>
            <Td>{isZh ? "可选 string ≤ 80 字符" : "Optional string ≤ 80 chars"}</Td>
            <Td>
              {isZh
                ? "在 connection 列表里显示用,比如 \"Hermes on laptop\"。"
                : 'Shown in the connection list, e.g. "Hermes on laptop".'}
            </Td>
          </tr>
          <tr>
            <Td>
              <Inline>agent_kind</Inline>
            </Td>
            <Td>{isZh ? "可选 string ≤ 32 字符" : "Optional string ≤ 32 chars"}</Td>
            <Td>
              {isZh ? (
                <>
                  枚举:<Inline>claude-code | cursor | hermes | openclaw | codex | cowork | desktop | generic</Inline>。仅做归类标签,不影响功能。
                </>
              ) : (
                <>
                  Enum: <Inline>claude-code | cursor | hermes | openclaw | codex | cowork | desktop | generic</Inline>. A categorization label; doesn't change functionality.
                </>
              )}
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
        {isZh
          ? "轮询端点。每 interval 秒(默认 5 秒)调一次直到拿到 api_key 或终态错误。"
          : "Polling endpoint. Call every `interval` seconds (default 5) until success or a terminal error."}
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

      <H2 id="oauth-token">{isZh ? "标准 OAuth token 端点" : "Standard OAuth token endpoint"}</H2>

      <H3 id="oauth-token-endpoint">
        <Inline>POST /oauth/token</Inline>
      </H3>
      <P>
        {isZh
          ? "RFC 8252 + RFC 8628 共用的 token 端点。接受 application/json 或 application/x-www-form-urlencoded。三种 grant_type:"
          : "Token endpoint shared by RFC 8252 + RFC 8628. Accepts application/json or application/x-www-form-urlencoded. Three grant_types:"}
      </P>

      <Table>
        <thead>
          <tr>
            <Th>grant_type</Th>
            <Th>{isZh ? "用途" : "Purpose"}</Th>
            <Th>{isZh ? "返回" : "Returns"}</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td>
              <Inline>authorization_code</Inline>
            </Td>
            <Td>
              {isZh
                ? "RFC 8252 PKCE auth code 兑换为 access_token + refresh_token"
                : "RFC 8252 PKCE auth code exchange for access_token + refresh_token"}
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
              {isZh
                ? "用 refresh_token 轮换出新的 access_token"
                : "Rotate refresh_token to get a new access_token"}
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
              {isZh
                ? "RFC 8628 device code 兑换 token(form-encoded 标准接口)"
                : "RFC 8628 device-code exchange (form-encoded canonical interface)"}
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

      <H2 id="mcp">{isZh ? "MCP 端点" : "MCP endpoint"}</H2>
      <H3 id="mcp-endpoint">
        <Inline>POST /mcp</Inline>
      </H3>
      <P>
        {isZh
          ? "MCP JSON-RPC 2.0 over HTTP(streamable-http transport)。所有 16 个 huozi_* 工具都通过这里调。要求 Authorization: Bearer <token>。无 token 返回 401 + WWW-Authenticate 触发 OAuth 自动发现。"
          : "MCP JSON-RPC 2.0 over HTTP (streamable-http transport). All 16 huozi_* tools route through this one endpoint. Requires Authorization: Bearer <token>. No token returns 401 + WWW-Authenticate to trigger OAuth auto-discovery."}
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

      <H2 id="llms-txt">{isZh ? "Agent 可读规范" : "Agent-readable spec"}</H2>
      <H3 id="llms-txt-endpoint">
        <Inline>GET /llms.txt</Inline>
      </H3>
      <P>
        {isZh ? (
          <>
            按 <a className="underline" href="https://llmstxt.org" target="_blank" rel="noopener noreferrer">llmstxt.org</a> 约定的纯文本安装协议。chat-mode Agent 用 WebFetch 拿这份,自己跑 device flow。Cache 5 分钟,内容按 request host 模板生成 —— Edge 部署自动用自己的 worker 域名。
          </>
        ) : (
          <>
            Plain-text install protocol following the{" "}
            <a className="underline" href="https://llmstxt.org" target="_blank" rel="noopener noreferrer">llmstxt.org</a> convention. Chat-mode agents WebFetch this and drive the device flow themselves. Cached 5 min; content is templated per request host — Edge deploys automatically use their own worker domain.
          </>
        )}
      </P>
      <Code code={`curl https://cloud.huozi.app/llms.txt`} />

      <H3 id="llms-txt-filter">
        <Inline>GET /llms.txt?for=&lt;agent_kind&gt;</Inline>
      </H3>
      <P>
        {isZh
          ? "把 Step 4 过滤到只剩这一个 host 的 snippet,doc 缩到 ~70%,小 context 模型友好。kind 同上面 agent_kind 枚举。"
          : "Filters Step 4 down to just that one host's snippet — doc shrinks to ~70%, small-context models stay happy. The kind enum matches agent_kind above."}
      </P>

      <H2 id="see-also">{isZh ? "更多" : "See also"}</H2>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5">
        <li>
          <Link href="/docs/auth" className="underline hover:text-foreground">
            {isZh ? "Two install pipelines —— OAuth 与 device flow 深度" : "Two install pipelines — OAuth and device flow deep dive"}
          </Link>
        </li>
        <li>
          <Link href="/docs" className="underline hover:text-foreground">
            {isZh ? "MCP tools reference —— 16 个工具" : "MCP tools reference — the 16 tools"}
          </Link>
        </li>
        <li>
          <Link href="/docs/editions" className="underline hover:text-foreground">
            {isZh ? "Cloud vs Edge —— 域名替换规则" : "Cloud vs Edge — domain substitution rules"}
          </Link>
        </li>
      </ul>
    </article>
  );
}
