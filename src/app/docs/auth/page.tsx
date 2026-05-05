import Link from "next/link";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n/server";
import { H2, H3, Lead, P, Inline, Table, Th, Td, Code, Note } from "@/components/docs/elements";

export const metadata: Metadata = {
  title: "Two install pipelines — huozi Docs",
  description:
    "huozi supports two parallel install paths: RFC 8252 OAuth-on-first-use for users at their own terminal, and RFC 8628 device authorization grant for chat-mode agents. Both end at the same place — a Bearer token against /mcp.",
};

export default async function AuthPage() {
  const locale = await getLocale();
  const isZh = locale === "zh";

  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">
        {isZh ? "两条安装管线" : "Two install pipelines"}
      </h1>
      <Lead>
        {isZh
          ? "huozi 支持两条平行的安装路径,适配不同执行环境。两条路最终都拿到 Bearer token 调 /mcp,但凭证来源、流程、token 形态都不同。按你 Agent 跑在哪决定走哪条。"
          : "huozi supports two parallel install paths, matched to where your agent runs. Both end at the same place — a Bearer token against /mcp — but the credential source, the flow, and the token shape differ. Pick by environment."}
      </Lead>

      <H2 id="comparison">{isZh ? "并排对比" : "Side by side"}</H2>
      <Table>
        <thead>
          <tr>
            <Th>{isZh ? "维度" : "Dimension"}</Th>
            <Th>{isZh ? "选择二 · 本地终端 / GUI" : "Choice 2 · Native CLI / GUI"}</Th>
            <Th>{isZh ? "选择一 · Agent 自己装" : "Choice 1 · Agent-driven"}</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td>{isZh ? "标准" : "Spec"}</Td>
            <Td>RFC 8252 + PKCE</Td>
            <Td>RFC 8628</Td>
          </tr>
          <tr>
            <Td>{isZh ? "适用场景" : "Best for"}</Td>
            <Td>
              {isZh
                ? "用户在自己电脑终端;有 TTY、有系统浏览器、能绑 localhost 回调。"
                : "User at their own terminal; has TTY, system browser, and can bind a localhost callback."}
            </Td>
            <Td>
              {isZh
                ? "Chat-mode Agent;非 TTY shell 工具、可能 headless / 沙箱 / 远端,无 localhost 回调。"
                : "Chat-mode agent; non-TTY shell tool, possibly headless / sandboxed / remote, no localhost callback available."}
            </Td>
          </tr>
          <tr>
            <Td>{isZh ? "触发方式" : "Triggered by"}</Td>
            <Td>
              {isZh
                ? "客户端原生 mcp add CLI 或 GUI 的 Add connector 入口。"
                : "Client's native mcp add CLI or GUI Add connector dialog."}
            </Td>
            <Td>
              {isZh
                ? "Agent 读 /llms.txt 后自己跑;用户粘一段 prompt。"
                : "The agent fetches /llms.txt and drives the flow itself; user pastes a prompt."}
            </Td>
          </tr>
          <tr>
            <Td>{isZh ? "用户动作" : "User action"}</Td>
            <Td>
              {isZh
                ? "点一次浏览器 Approve(本机弹起)。"
                : "One click on browser Approve (popped on local machine)."}
            </Td>
            <Td>
              {isZh
                ? "点一次链接(任意设备),登录后 Approve。"
                : "Click a link (on any device), sign in, then Approve."}
            </Td>
          </tr>
          <tr>
            <Td>{isZh ? "拿到的凭证" : "Credential"}</Td>
            <Td>
              {isZh
                ? "OAuth access_token(短期,1 小时)+ refresh_token(可轮转,30 天)。"
                : "OAuth access_token (short-lived, 1h) + refresh_token (rotating, 30 days)."}
            </Td>
            <Td>
              {isZh ? (
                <>
                  静态 <Inline>hz_*</Inline> api_key(长期,直到撤销或 TTL 到期)。
                </>
              ) : (
                <>
                  Static <Inline>hz_*</Inline> api_key (long-lived, until revoked or TTL expires).
                </>
              )}
            </Td>
          </tr>
          <tr>
            <Td>{isZh ? "凭证存哪" : "Stored in"}</Td>
            <Td>
              {isZh
                ? "客户端自己的 token store(~/.hermes/mcp-tokens/、Cursor keychain 等),不进 config 文件。"
                : "Client's own token store (~/.hermes/mcp-tokens/, Cursor's keychain, etc.) — not in plain config."}
            </Td>
            <Td>
              {isZh
                ? "Host 的 MCP config 文件,Bearer 头明文。"
                : "Host's MCP config file as a plain Bearer header."}
            </Td>
          </tr>
        </tbody>
      </Table>

      <Note>
        {isZh
          ? "两条路用同一个 /mcp 端点;服务器只看 Authorization header,不区分 token 怎么来的。换路径不要重新装,只换凭证发放方式。"
          : "Both paths hit the same /mcp endpoint; the server only inspects the Authorization header, not how the token was obtained. Switching paths doesn't require reinstalling — just a new credential exchange."}
      </Note>

      <H2 id="rfc-8252">RFC 8252 · OAuth-on-first-use</H2>
      <P>
        {isZh
          ? "标准 OAuth 2.1 authorization code 流,带 PKCE-S256(RFC 7636)和 dynamic client registration(RFC 7591)。客户端不用预先注册,首次连 /mcp 失败时自动发现授权服务器、本机弹浏览器、收 localhost 回调。"
          : "Standard OAuth 2.1 authorization-code flow with PKCE-S256 (RFC 7636) and dynamic client registration (RFC 7591). Clients don't pre-register — when the first MCP call fails, the client auto-discovers the authorization server, opens a local browser, and receives the code via a localhost callback."}
      </P>

      <H3 id="rfc-8252-flow">{isZh ? "流程" : "Flow"}</H3>
      <Code
        code={`Step 1. Client → server:    POST /mcp  (no Authorization)
Step 2. Server → client:    401 + WWW-Authenticate: resource_metadata=/.well-known/oauth-protected-resource
Step 3. Client → server:    GET /.well-known/oauth-protected-resource
Step 4. Client → server:    GET /.well-known/oauth-authorization-server
Step 5. Client → server:    POST /oauth/register      (dynamic client registration)
Step 6. Client opens browser → /oauth/authorize?code_challenge=<S256>&...
Step 7. User signs in (OTP / password) + clicks Approve
Step 8. Browser → 127.0.0.1:<port>/callback?code=...
Step 9. Client → server:    POST /oauth/token  grant=authorization_code + code_verifier
Step 10. Server → client:   { access_token, refresh_token, expires_in, scope }
Step 11. Client retries:    POST /mcp  Authorization: Bearer <access_token>  → 200 OK`}
      />

      <H3 id="rfc-8252-clients">{isZh ? "支持这条路的客户端" : "Clients that take this path"}</H3>
      <P>
        {isZh
          ? "Claude Code(claude mcp add)、OpenAI Codex CLI(codex mcp add)、Hermes(hermes mcp add --auth oauth)、Cursor(~/.cursor/mcp.json)、Claude Desktop / Cowork(Customize → Connectors)、OpenClaw(部分,WIP)。"
          : "Claude Code (claude mcp add), OpenAI Codex CLI (codex mcp add), Hermes (hermes mcp add --auth oauth), Cursor (~/.cursor/mcp.json), Claude Desktop / Cowork (Customize → Connectors), OpenClaw (partial, upstream WIP)."}
      </P>

      <H2 id="rfc-8628">RFC 8628 · {isZh ? "Device Authorization Grant" : "Device Authorization Grant"}</H2>
      <P>
        {isZh
          ? "为没浏览器、没 TTY、跨设备的客户端设计的 OAuth 扩展。Agent 调一个端点拿 device_code + 用户码,把验证 URL 给用户(用户在任意设备点开),Agent 后台轮询 token 端点直到拿到 access_token。彻底解开了 8252 的「必须能收 callback」假设。"
          : "An OAuth extension designed for clients that lack a browser, TTY, or cross-device control. The agent calls one endpoint for a device_code + user_code, hands the verification URL to the user (who opens it on any device), and polls the token endpoint until the token is granted. Sidesteps the localhost-callback assumption of RFC 8252."}
      </P>

      <H3 id="rfc-8628-flow">{isZh ? "流程" : "Flow"}</H3>
      <Code
        code={`Step 1. Agent → server:     POST /auth/device-code  { client_name, agent_kind }
Step 2. Server → agent:     { device_code, user_code, verification_url_complete, expires_in: 900, interval: 5 }
Step 3. Agent prints verification_url_complete to user
Step 4. User opens URL → /device?code=ABCD-1234 (any device)
Step 5. User signs in (Cloud OTP / Edge password) + clicks Approve
Step 6. Agent polls every 5s:  POST /auth/token  { device_code }
        - 202 authorization_pending → keep polling
        - 200 { api_key, key_id, workspace } → done
Step 7. Agent writes api_key to host MCP config
Step 8. Agent/host calls:  POST /mcp  Authorization: Bearer <api_key>  → 200 OK`}
      />

      <H3 id="rfc-8628-clients" >{isZh ? "标准 OAuth 端点也支持 device flow" : "The standard OAuth endpoint also accepts device flow"}</H3>
      <P>
        {isZh ? (
          <>
            原生支持 RFC 8628 的 MCP 客户端可以直接调 <Inline>POST /oauth/token</Inline> 用 form-encoded
            body <Inline>grant_type=urn:ietf:params:oauth:grant-type:device_code&device_code=...</Inline>{" "}
            ,服务端会按 OAuth 标准 envelope 返回 <Inline>{"{access_token, token_type: \"Bearer\", scope}"}</Inline>。这样客户端能从{" "}
            <Inline>/.well-known/oauth-authorization-server</Inline> 自动发现,无需读这份 prompt。
          </>
        ) : (
          <>
            MCP clients that natively implement RFC 8628 can call <Inline>POST /oauth/token</Inline> with
            form-encoded body{" "}
            <Inline>
              grant_type=urn:ietf:params:oauth:grant-type:device_code&device_code=...
            </Inline>
            ; the server returns the standard OAuth envelope{" "}
            <Inline>{"{access_token, token_type: \"Bearer\", scope}"}</Inline>. This lets the client discover device flow from{" "}
            <Inline>/.well-known/oauth-authorization-server</Inline> without reading this prompt.
          </>
        )}
      </P>

      <H2 id="agent-prompt">{isZh ? "/llms.txt 协议" : "/llms.txt protocol"}</H2>
      <P>
        {isZh ? (
          <>
            Chat-mode Agent 不读这份 docs(它读的是机器友好的 <Link href="/llms.txt" className="underline">/llms.txt</Link>)。
            该端点跟着部署域名走 —— Cloud 是 <Inline>cloud.huozi.app/llms.txt</Inline>,Edge 是{" "}
            <Inline>{"<your-deploy>/llms.txt"}</Inline> —— 内容由 route handler 按请求 host 模板生成。
          </>
        ) : (
          <>
            Chat-mode agents don't read these docs — they read the machine-friendly{" "}
            <Link href="/llms.txt" className="underline">/llms.txt</Link>. The endpoint follows the
            deploy domain — Cloud serves <Inline>cloud.huozi.app/llms.txt</Inline>, Edge serves{" "}
            <Inline>{"<your-deploy>/llms.txt"}</Inline> — and the content is templated per request host
            by a route handler.
          </>
        )}
      </P>

      <H3 id="for-filter">
        <Inline>?for=&lt;agent_kind&gt;</Inline> {isZh ? "过滤" : "filter"}
      </H3>
      <P>
        {isZh ? (
          <>
            带 <Inline>?for=&lt;kind&gt;</Inline> 查询参数访问 <Inline>/llms.txt</Inline>{" "}
            会把 Step 4(写 host config 那段)过滤到只剩这一个 host 的 snippet,文档体积砍 ~70%。小 context window 模型(Haiku、本地小模型)就不会吃满。
          </>
        ) : (
          <>
            Hitting <Inline>/llms.txt?for=&lt;kind&gt;</Inline> filters Step 4 (the per-host config
            snippet section) to just that one host. Cuts the doc by ~70% — small-context-window
            models (Haiku, smaller open models) stop choking on the full menu.
          </>
        )}
      </P>
      <P>{isZh ? "可用 kind 值:" : "Valid kinds:"}</P>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 mb-4 font-mono">
        <li>claude-code</li>
        <li>cursor</li>
        <li>hermes</li>
        <li>openclaw</li>
        <li>codex</li>
        <li>cowork</li>
        <li>desktop</li>
        <li>generic</li>
      </ul>

      <H3 id="self-check">{isZh ? "Self-check 段" : "Self-check section"}</H3>
      <P>
        {isZh ? (
          <>
            <Inline>/llms.txt</Inline> 顶部有「Before you start」自检段:列出 Agent 需要的工具能力(HTTP request、用户链接打印、文件写),没全部具备的话直接告诉用户去 Choice 2 自己装,而不是闷头试到失败。
          </>
        ) : (
          <>
            The top of <Inline>/llms.txt</Inline> has a "Before you start" self-check listing the
            tool capabilities the agent needs (HTTP request, user-link printing, file write). Agents
            missing any are told to redirect the user to Choice 2 instead of silently failing.
          </>
        )}
      </P>

      <H2 id="security">{isZh ? "安全" : "Security"}</H2>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 mb-4">
        <li>
          {isZh ? (
            <>RFC 8252 OAuth token 由 MCP 客户端持有,<strong>不会进入对话上下文</strong>。</>
          ) : (
            <>RFC 8252 OAuth tokens stay in the MCP client's credential store and <strong>never enter the conversation context</strong>.</>
          )}
        </li>
        <li>
          {isZh
            ? "RFC 8628 device flow 拿到的是静态 api_key,需要 Agent 守住 prompt 里的「don't print api_key」纪律。"
            : "RFC 8628 device flow yields a static api_key; agent discipline (the prompt's \"don't print api_key\" rule) is what keeps it out of chat."}
        </li>
        <li>
          {isZh ? (
            <>所有 key 都可在 <Link href="https://cloud.huozi.app/workspace" className="underline">cloud.huozi.app/workspace</Link>(或 Edge 等价路径)随时撤销。</>
          ) : (
            <>Any key can be revoked at <Link href="https://cloud.huozi.app/workspace" className="underline">cloud.huozi.app/workspace</Link> (or the Edge equivalent) at any time.</>
          )}
        </li>
        <li>
          {isZh
            ? "RFC 8252 token 默认 1 小时过期,需要 refresh 续命。RFC 8628 api_key 默认无过期,但每个 connection 可独立设 sliding-window TTL。"
            : "RFC 8252 access tokens default to 1h TTL with refresh rotation. RFC 8628 api_keys have no default TTL but each connection can opt into a sliding-window TTL."}
        </li>
      </ul>

      <H2 id="see-also">{isZh ? "更多" : "See also"}</H2>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5">
        <li>
          <Link href="/docs/api" className="underline hover:text-foreground">
            {isZh ? "HTTP API reference — 端点契约" : "HTTP API reference — endpoint contracts"}
          </Link>
        </li>
        <li>
          <Link href="/docs/editions" className="underline hover:text-foreground">
            {isZh ? "Cloud vs Edge —— 两个版本的差异" : "Cloud vs Edge — how the editions differ"}
          </Link>
        </li>
        <li>
          <Link href="/start" className="underline hover:text-foreground">
            {isZh ? "Get started — 选 Agent + 复制" : "Get started — pick an agent + copy"}
          </Link>
        </li>
        <li>
          <Link href="/llms.txt" className="underline hover:text-foreground">
            /llms.txt {isZh ? "(Agent 读的版本)" : "(the agent-readable version)"}
          </Link>
        </li>
      </ul>
    </article>
  );
}
