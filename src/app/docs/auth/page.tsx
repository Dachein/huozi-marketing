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
  title: "Two install pipelines — huozi Docs",
  description:
    "huozi supports two parallel install paths: RFC 8252 OAuth-on-first-use for users at their own terminal, and RFC 8628 device authorization grant for chat-mode agents. Both end at the same place — a Bearer token against /mcp.",
};

export default async function AuthPage() {
  const locale = await getLocale();
  const t = <T,>(v: Partial<Record<typeof locale, T>>): T => pick(locale, v);

  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">
        {t({
          zh: "两条 pipeline",
          en: "Two install pipelines",
          ja: "2 つのインストールパイプライン",
          fr: "Deux pipelines d'installation",
        })}
      </h1>
      <Lead>
        {t({
          zh: "huozi 支持两条平行的 pipeline,适配不同执行环境。两条最终都拿到 Bearer token 调 /mcp,但凭证来源、流程、token 形态都不同。按你 Agent 跑在哪决定走哪条。",
          en: "huozi supports two parallel install paths, matched to where your agent runs. Both end at the same place — a Bearer token against /mcp — but the credential source, the flow, and the token shape differ. Pick by environment.",
          ja: "huozi はエージェントの実行環境に合わせた 2 つの並行インストールパスをサポートします。どちらも最終的に /mcp に対する Bearer トークンに行き着きますが、認証情報の出所・フロー・トークンの形が異なります。環境で選んでください。",
          fr: "huozi prend en charge deux paths d'installation parallèles, adaptés à l'environnement où s'exécute votre agent. Les deux aboutissent au même endroit — un token Bearer contre /mcp — mais la source du jeton, le flux et la forme diffèrent. Choisissez selon l'environnement.",
        })}
      </Lead>

      <H2 id="comparison">
        {t({
          zh: "并排对比",
          en: "Side by side",
          ja: "並列比較",
          fr: "Comparaison côte à côte",
        })}
      </H2>
      <Table>
        <thead>
          <tr>
            <Th>
              {t({ zh: "维度", en: "Dimension", ja: "次元", fr: "Dimension" })}
            </Th>
            <Th>
              {t({
                zh: "选择二 · 本地终端 / GUI",
                en: "Choice 2 · Native CLI / GUI",
                ja: "選択 2 · ネイティブ CLI / GUI",
                fr: "Choix 2 · CLI / GUI native",
              })}
            </Th>
            <Th>
              {t({
                zh: "选择一 · Agent 自己装",
                en: "Choice 1 · Agent-driven",
                ja: "選択 1 · エージェント駆動",
                fr: "Choix 1 · Pilotage par l'Agent",
              })}
            </Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td>{t({ zh: "标准", en: "Spec", ja: "仕様", fr: "Spec" })}</Td>
            <Td>RFC 8252 + PKCE</Td>
            <Td>RFC 8628</Td>
          </tr>
          <tr>
            <Td>
              {t({
                zh: "适用场景",
                en: "Best for",
                ja: "最適なケース",
                fr: "Idéal pour",
              })}
            </Td>
            <Td>
              {t({
                zh: "用户在自己电脑终端;有 TTY、有系统浏览器、能绑 localhost 回调。",
                en: "User at their own terminal; has TTY, system browser, and can bind a localhost callback.",
                ja: "ユーザーが自身の端末で;TTY とシステムブラウザがあり、localhost コールバックをバインドできる。",
                fr: "Utilisateur à son propre terminal ; TTY, navigateur système, et capable de lier un callback localhost.",
              })}
            </Td>
            <Td>
              {t({
                zh: "Chat-mode Agent;非 TTY shell 工具、可能 headless / 沙箱 / 远端,无 localhost 回调。",
                en: "Chat-mode agent; non-TTY shell tool, possibly headless / sandboxed / remote, no localhost callback available.",
                ja: "チャットモードのエージェント;非 TTY のシェルツール、headless / サンドボックス / リモートの可能性、localhost コールバック不可。",
                fr: "Agent en chat ; outil shell non-TTY, possiblement headless / sandboxé / distant, pas de callback localhost.",
              })}
            </Td>
          </tr>
          <tr>
            <Td>
              {t({
                zh: "触发方式",
                en: "Triggered by",
                ja: "トリガー",
                fr: "Déclenché par",
              })}
            </Td>
            <Td>
              {t({
                zh: "客户端原生 mcp add CLI 或 GUI 的 Add connector 入口。",
                en: "Client's native mcp add CLI or GUI Add connector dialog.",
                ja: "クライアントのネイティブ mcp add CLI または GUI の Add connector ダイアログ。",
                fr: "La commande mcp add native du client ou la boîte de dialogue GUI Add connector.",
              })}
            </Td>
            <Td>
              {t({
                zh: "Agent 读 /llms.txt 后自己跑;用户粘一段 prompt。",
                en: "The agent fetches /llms.txt and drives the flow itself; user pastes a prompt.",
                ja: "エージェントが /llms.txt を取得し自身でフローを実行;ユーザーはプロンプトを貼り付ける。",
                fr: "L'agent récupère /llms.txt et exécute le flux lui-même ; l'utilisateur colle un prompt.",
              })}
            </Td>
          </tr>
          <tr>
            <Td>
              {t({
                zh: "用户动作",
                en: "User action",
                ja: "ユーザー操作",
                fr: "Action utilisateur",
              })}
            </Td>
            <Td>
              {t({
                zh: "点一次浏览器 Approve(本机弹起)。",
                en: "One click on browser Approve (popped on local machine).",
                ja: "ブラウザの Approve を 1 クリック(ローカルマシンに表示)。",
                fr: "Un clic sur Approve dans le navigateur (apparu sur la machine locale).",
              })}
            </Td>
            <Td>
              {t({
                zh: "点一次链接(任意设备),登录后 Approve。",
                en: "Click a link (on any device), sign in, then Approve.",
                ja: "リンクをクリック(任意のデバイス)し、サインインして Approve。",
                fr: "Cliquez un lien (sur n'importe quel appareil), connectez-vous, puis Approve.",
              })}
            </Td>
          </tr>
          <tr>
            <Td>
              {t({
                zh: "拿到的凭证",
                en: "Credential",
                ja: "認証情報",
                fr: "Identifiant",
              })}
            </Td>
            <Td>
              {t({
                zh: "OAuth access_token(短期,1 小时)+ refresh_token(可轮转,30 天)。",
                en: "OAuth access_token (short-lived, 1h) + refresh_token (rotating, 30 days).",
                ja: "OAuth access_token(短期、1 時間)+ refresh_token(ローテーション、30 日)。",
                fr: "access_token OAuth (courte durée, 1 h) + refresh_token (rotatif, 30 jours).",
              })}
            </Td>
            <Td>
              {t({
                zh: (
                  <>
                    静态 <Inline>hz_*</Inline> api_key(长期,直到撤销或 TTL 到期)。
                  </>
                ),
                en: (
                  <>
                    Static <Inline>hz_*</Inline> api_key (long-lived, until revoked or TTL expires).
                  </>
                ),
                ja: (
                  <>
                    静的な <Inline>hz_*</Inline> api_key(長期、取り消しまたは TTL 切れまで)。
                  </>
                ),
                fr: (
                  <>
                    api_key statique <Inline>hz_*</Inline> (longue durée, jusqu'à révocation ou expiration TTL).
                  </>
                ),
              })}
            </Td>
          </tr>
          <tr>
            <Td>
              {t({
                zh: "凭证存哪",
                en: "Stored in",
                ja: "保管場所",
                fr: "Stocké dans",
              })}
            </Td>
            <Td>
              {t({
                zh: "客户端自己的 token store(~/.hermes/mcp-tokens/、Cursor keychain 等),不进 config 文件。",
                en: "Client's own token store (~/.hermes/mcp-tokens/, Cursor's keychain, etc.) — not in plain config.",
                ja: "クライアント独自のトークンストア(~/.hermes/mcp-tokens/、Cursor の keychain 等)— 設定ファイルには入りません。",
                fr: "Le token store du client (~/.hermes/mcp-tokens/, le keychain de Cursor, etc.) — pas dans la config en clair.",
              })}
            </Td>
            <Td>
              {t({
                zh: "Host 的 MCP config 文件,Bearer 头明文。",
                en: "Host's MCP config file as a plain Bearer header.",
                ja: "ホストの MCP 設定ファイルに Bearer ヘッダとして平文で。",
                fr: "Le fichier de config MCP de l'hôte sous forme d'en-tête Bearer en clair.",
              })}
            </Td>
          </tr>
        </tbody>
      </Table>

      <Note>
        {t({
          zh: "两条路用同一个 /mcp 端点;服务器只看 Authorization header,不区分 token 怎么来的。换路径不要重新装,只换凭证发放方式。",
          en: "Both paths hit the same /mcp endpoint; the server only inspects the Authorization header, not how the token was obtained. Switching paths doesn't require reinstalling — just a new credential exchange.",
          ja: "両方の path は同じ /mcp エンドポイントを叩きます;サーバーは Authorization ヘッダのみを検査し、トークンの取得方法は区別しません。path を切り替える際に再インストールは不要 — 認証情報の再取得だけで済みます。",
          fr: "Les deux paths atteignent le même endpoint /mcp ; le serveur n'inspecte que l'en-tête Authorization, pas la méthode d'obtention du token. Changer de path ne nécessite pas de réinstaller — juste un nouvel échange d'identifiants.",
        })}
      </Note>

      <H2 id="rfc-8252">RFC 8252 · OAuth-on-first-use</H2>
      <P>
        {t({
          zh: "标准 OAuth 2.1 authorization code 流,带 PKCE-S256(RFC 7636)和 dynamic client registration(RFC 7591)。客户端不用预先注册,首次连 /mcp 失败时自动发现授权服务器、本机弹浏览器、收 localhost 回调。",
          en: "Standard OAuth 2.1 authorization-code flow with PKCE-S256 (RFC 7636) and dynamic client registration (RFC 7591). Clients don't pre-register — when the first MCP call fails, the client auto-discovers the authorization server, opens a local browser, and receives the code via a localhost callback.",
          ja: "PKCE-S256(RFC 7636)と動的クライアント登録(RFC 7591)を使う標準 OAuth 2.1 authorization-code フロー。クライアントは事前登録不要 — 最初の MCP 呼び出しが失敗すると、クライアントが認可サーバーを自動検出し、ローカルブラウザを開き、localhost コールバック経由でコードを受け取ります。",
          fr: "Flux standard OAuth 2.1 authorization-code avec PKCE-S256 (RFC 7636) et enregistrement dynamique du client (RFC 7591). Les clients ne s'enregistrent pas à l'avance — quand le premier appel MCP échoue, le client découvre automatiquement le serveur d'autorisation, ouvre un navigateur local, et reçoit le code via un callback localhost.",
        })}
      </P>

      <H3 id="rfc-8252-flow">{t({ zh: "流程", en: "Flow", ja: "フロー", fr: "Flux" })}</H3>
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

      <H3 id="rfc-8252-clients">
        {t({
          zh: "支持这条路的客户端",
          en: "Clients that take this path",
          ja: "この path を取るクライアント",
          fr: "Clients qui empruntent ce path",
        })}
      </H3>
      <P>
        {t({
          zh: "Claude Code(claude mcp add)、OpenAI Codex CLI(codex mcp add)、Hermes(hermes mcp add --auth oauth)、Cursor(~/.cursor/mcp.json)、Claude Desktop / Cowork(Customize → Connectors)、OpenClaw(部分,WIP)。",
          en: "Claude Code (claude mcp add), OpenAI Codex CLI (codex mcp add), Hermes (hermes mcp add --auth oauth), Cursor (~/.cursor/mcp.json), Claude Desktop / Cowork (Customize → Connectors), OpenClaw (partial, upstream WIP).",
          ja: "Claude Code(claude mcp add)、OpenAI Codex CLI(codex mcp add)、Hermes(hermes mcp add --auth oauth)、Cursor(~/.cursor/mcp.json)、Claude Desktop / Cowork(Customize → Connectors)、OpenClaw(部分対応、上流で進行中)。",
          fr: "Claude Code (claude mcp add), OpenAI Codex CLI (codex mcp add), Hermes (hermes mcp add --auth oauth), Cursor (~/.cursor/mcp.json), Claude Desktop / Cowork (Customize → Connectors), OpenClaw (partiel, en cours côté upstream).",
        })}
      </P>

      <H2 id="rfc-8628">
        RFC 8628 ·{" "}
        {t({
          zh: "Device Authorization Grant",
          en: "Device Authorization Grant",
          ja: "Device Authorization Grant",
          fr: "Octroi d'autorisation par appareil (Device Authorization Grant)",
        })}
      </H2>
      <P>
        {t({
          zh: "为没浏览器、没 TTY、跨设备的客户端设计的 OAuth 扩展。Agent 调一个端点拿 device_code + 用户码,把验证 URL 给用户(用户在任意设备点开),Agent 后台轮询 token 端点直到拿到 access_token。彻底解开了 8252 的「必须能收 callback」假设。",
          en: "An OAuth extension designed for clients that lack a browser, TTY, or cross-device control. The agent calls one endpoint for a device_code + user_code, hands the verification URL to the user (who opens it on any device), and polls the token endpoint until the token is granted. Sidesteps the localhost-callback assumption of RFC 8252.",
          ja: "ブラウザ、TTY、またはクロスデバイス制御を持たないクライアント向けに設計された OAuth 拡張。エージェントは 1 つのエンドポイントを呼び出して device_code と user_code を取得し、検証 URL をユーザーに渡します(ユーザーは任意のデバイスで開く)。トークンが付与されるまでトークンエンドポイントをポーリングします。RFC 8252 の「localhost コールバックがあること」前提を完全に回避します。",
          fr: "Une extension OAuth conçue pour les clients sans navigateur, sans TTY, ou avec contrôle inter-appareils. L'agent appelle un endpoint pour obtenir un device_code + user_code, transmet l'URL de vérification à l'utilisateur (qui l'ouvre sur n'importe quel appareil), et sonde l'endpoint token jusqu'à l'obtention du jeton. Contourne complètement l'hypothèse de callback localhost de RFC 8252.",
        })}
      </P>

      <H3 id="rfc-8628-flow">
        {t({ zh: "流程", en: "Flow", ja: "フロー", fr: "Flux" })}
      </H3>
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

      <H3 id="rfc-8628-clients">
        {t({
          zh: "标准 OAuth 端点也支持 device flow",
          en: "The standard OAuth endpoint also accepts device flow",
          ja: "標準 OAuth エンドポイントも device flow を受け付ける",
          fr: "L'endpoint OAuth standard accepte aussi le device flow",
        })}
      </H3>
      <P>
        {t({
          zh: (
            <>
              原生支持 RFC 8628 的 MCP 客户端可以直接调 <Inline>POST /oauth/token</Inline> 用 form-encoded
              body <Inline>grant_type=urn:ietf:params:oauth:grant-type:device_code&device_code=...</Inline>{" "}
              ,服务端会按 OAuth 标准 envelope 返回 <Inline>{"{access_token, token_type: \"Bearer\", scope}"}</Inline>。这样客户端能从{" "}
              <Inline>/.well-known/oauth-authorization-server</Inline> 自动发现,无需读这份 prompt。
            </>
          ),
          en: (
            <>
              MCP clients that natively implement RFC 8628 can call <Inline>POST /oauth/token</Inline> with
              form-encoded body{" "}
              <Inline>
                grant_type=urn:ietf:params:oauth:grant-type:device_code&device_code=...
              </Inline>
              ; the server returns the standard OAuth envelope{" "}
              <Inline>{"{access_token, token_type: \"Bearer\", scope}"}</Inline>. This lets the client
              discover device flow from <Inline>/.well-known/oauth-authorization-server</Inline> without
              reading this prompt.
            </>
          ),
          ja: (
            <>
              RFC 8628 をネイティブ実装する MCP クライアントは <Inline>POST /oauth/token</Inline>{" "}
              に form-encoded body{" "}
              <Inline>
                grant_type=urn:ietf:params:oauth:grant-type:device_code&device_code=...
              </Inline>{" "}
              で直接呼び出せます。サーバーは標準 OAuth エンベロープ{" "}
              <Inline>{"{access_token, token_type: \"Bearer\", scope}"}</Inline> を返します。これにより、クライアントはこのプロンプトを読まずに{" "}
              <Inline>/.well-known/oauth-authorization-server</Inline> から device flow を発見できます。
            </>
          ),
          fr: (
            <>
              Les clients MCP qui implémentent RFC 8628 nativement peuvent appeler{" "}
              <Inline>POST /oauth/token</Inline> avec un body form-encoded{" "}
              <Inline>
                grant_type=urn:ietf:params:oauth:grant-type:device_code&device_code=...
              </Inline>
              ; le serveur retourne l'enveloppe OAuth standard{" "}
              <Inline>{"{access_token, token_type: \"Bearer\", scope}"}</Inline>. Cela permet au client de
              découvrir le device flow depuis{" "}
              <Inline>/.well-known/oauth-authorization-server</Inline> sans lire ce prompt.
            </>
          ),
        })}
      </P>

      <H2 id="agent-prompt">
        {t({
          zh: "/llms.txt 协议",
          en: "/llms.txt protocol",
          ja: "/llms.txt プロトコル",
          fr: "Protocole /llms.txt",
        })}
      </H2>
      <P>
        {t({
          zh: (
            <>
              Chat-mode Agent 不读这份 docs(它读的是机器友好的{" "}
              <Link href="/llms.txt" className="underline">/llms.txt</Link>)。 该端点跟着部署域名走 ——
              Cloud 是 <Inline>cloud.huozi.app/llms.txt</Inline>,Edge 是{" "}
              <Inline>{"<your-deploy>/llms.txt"}</Inline> —— 内容由 route handler 按请求 host 模板生成。
            </>
          ),
          en: (
            <>
              Chat-mode agents don't read these docs — they read the machine-friendly{" "}
              <Link href="/llms.txt" className="underline">/llms.txt</Link>. The endpoint follows the
              deploy domain — Cloud serves <Inline>cloud.huozi.app/llms.txt</Inline>, Edge serves{" "}
              <Inline>{"<your-deploy>/llms.txt"}</Inline> — and the content is templated per request
              host by a route handler.
            </>
          ),
          ja: (
            <>
              チャットモードのエージェントはこの docs を読みません — 機械フレンドリーな{" "}
              <Link href="/llms.txt" className="underline">/llms.txt</Link> を読みます。エンドポイントはデプロイドメインに追従します —— Cloud は{" "}
              <Inline>cloud.huozi.app/llms.txt</Inline>、Edge は{" "}
              <Inline>{"<your-deploy>/llms.txt"}</Inline> —— コンテンツはルートハンドラがリクエストホストごとにテンプレート化します。
            </>
          ),
          fr: (
            <>
              Les agents en chat ne lisent pas cette documentation — ils lisent le{" "}
              <Link href="/llms.txt" className="underline">/llms.txt</Link> compatible machine. L'endpoint suit le domaine de déploiement —— Cloud sert{" "}
              <Inline>cloud.huozi.app/llms.txt</Inline>, Edge sert{" "}
              <Inline>{"<your-deploy>/llms.txt"}</Inline> —— et le contenu est templaté par requête (selon le host) par un route handler.
            </>
          ),
        })}
      </P>

      <H3 id="for-filter">
        <Inline>?for=&lt;agent_kind&gt;</Inline>{" "}
        {t({ zh: "过滤", en: "filter", ja: "フィルター", fr: "filtre" })}
      </H3>
      <P>
        {t({
          zh: (
            <>
              带 <Inline>?for=&lt;kind&gt;</Inline> 查询参数访问 <Inline>/llms.txt</Inline>{" "}
              会把 Step 4(写 host config 那段)过滤到只剩这一个 host 的 snippet,文档体积砍 ~70%。小 context window 模型(Haiku、本地小模型)就不会吃满。
            </>
          ),
          en: (
            <>
              Hitting <Inline>/llms.txt?for=&lt;kind&gt;</Inline> filters Step 4 (the per-host config
              snippet section) to just that one host. Cuts the doc by ~70% — small-context-window
              models (Haiku, smaller open models) stop choking on the full menu.
            </>
          ),
          ja: (
            <>
              クエリパラメータ <Inline>?for=&lt;kind&gt;</Inline> 付きで{" "}
              <Inline>/llms.txt</Inline> にアクセスすると、Step 4(ホスト config 書き込みセクション)がそのホストのスニペットのみに絞り込まれ、ドキュメントサイズが ~70% 削減されます。コンテキストウィンドウの小さいモデル(Haiku、ローカル小型モデル)が詰まらなくなります。
            </>
          ),
          fr: (
            <>
              Accéder à <Inline>/llms.txt?for=&lt;kind&gt;</Inline> filtre l'étape 4 (la section snippet par hôte) pour ne garder qu'un seul hôte. Réduit la doc de ~70% — les modèles à petite fenêtre de contexte (Haiku, modèles ouverts plus petits) cessent de s'étouffer.
            </>
          ),
        })}
      </P>
      <P>
        {t({
          zh: "可用 kind 值:",
          en: "Valid kinds:",
          ja: "有効な kind 値:",
          fr: "Valeurs valides :",
        })}
      </P>
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

      <H3 id="self-check">
        {t({
          zh: "Self-check 段",
          en: "Self-check section",
          ja: "Self-check セクション",
          fr: "Section Self-check",
        })}
      </H3>
      <P>
        {t({
          zh: (
            <>
              <Inline>/llms.txt</Inline> 顶部有「Before you start」自检段:列出 Agent 需要的工具能力(HTTP request、用户链接打印、文件写),没全部具备的话直接告诉用户去 Choice 2 自己装,而不是闷头试到失败。
            </>
          ),
          en: (
            <>
              The top of <Inline>/llms.txt</Inline> has a &quot;Before you start&quot; self-check listing the
              tool capabilities the agent needs (HTTP request, user-link printing, file write). Agents
              missing any are told to redirect the user to Choice 2 instead of silently failing.
            </>
          ),
          ja: (
            <>
              <Inline>/llms.txt</Inline> の冒頭に「Before you start」セルフチェックがあります:エージェントに必要なツール能力(HTTP リクエスト、ユーザーリンク印字、ファイル書込)を列挙。いずれかが欠けているエージェントには、サイレント失敗ではなく Choice 2 へのリダイレクトをユーザーに促すよう指示します。
            </>
          ),
          fr: (
            <>
              Le haut de <Inline>/llms.txt</Inline> contient une section &quot;Before you start&quot; listant les capacités d'outils dont l'agent a besoin (requête HTTP, impression de lien utilisateur, écriture de fichier). Les agents qui en manquent sont invités à rediriger l'utilisateur vers Choice 2 plutôt que d'échouer silencieusement.
            </>
          ),
        })}
      </P>

      <H2 id="security">
        {t({
          zh: "安全",
          en: "Security",
          ja: "セキュリティ",
          fr: "Sécurité",
        })}
      </H2>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 mb-4">
        <li>
          {t({
            zh: (
              <>
                RFC 8252 OAuth token 由 MCP 客户端持有,<strong>不会进入对话上下文</strong>。
              </>
            ),
            en: (
              <>
                RFC 8252 OAuth tokens stay in the MCP client's credential store and{" "}
                <strong>never enter the conversation context</strong>.
              </>
            ),
            ja: (
              <>
                RFC 8252 の OAuth トークンは MCP クライアントの認証情報ストアに保管され、<strong>会話コンテキストには入りません</strong>。
              </>
            ),
            fr: (
              <>
                Les jetons OAuth RFC 8252 restent dans le store du client MCP et{" "}
                <strong>n'entrent jamais dans le contexte de la conversation</strong>.
              </>
            ),
          })}
        </li>
        <li>
          {t({
            zh: "RFC 8628 device flow 拿到的是静态 api_key,需要 Agent 守住 prompt 里的「don't print api_key」纪律。",
            en: "RFC 8628 device flow yields a static api_key; agent discipline (the prompt's \"don't print api_key\" rule) is what keeps it out of chat.",
            ja: "RFC 8628 device flow が返すのは静的な api_key で、エージェントのディシプリン(プロンプトの「api_key を印字しない」ルール)がそれをチャットから守ります。",
            fr: "Le device flow RFC 8628 produit une api_key statique ; la discipline de l'agent (la règle « ne pas afficher api_key » du prompt) est ce qui la garde hors du chat.",
          })}
        </li>
        <li>
          {t({
            zh: (
              <>
                所有 key 都可在{" "}
                <Link href="https://cloud.huozi.app/workspace" className="underline">cloud.huozi.app/workspace</Link>(或 Edge 等价路径)随时撤销。
              </>
            ),
            en: (
              <>
                Any key can be revoked at{" "}
                <Link href="https://cloud.huozi.app/workspace" className="underline">cloud.huozi.app/workspace</Link>{" "}
                (or the Edge equivalent) at any time.
              </>
            ),
            ja: (
              <>
                すべてのキーは{" "}
                <Link href="https://cloud.huozi.app/workspace" className="underline">cloud.huozi.app/workspace</Link>(または Edge の同等パス)で随時取り消せます。
              </>
            ),
            fr: (
              <>
                Toute clé peut être révoquée à tout moment depuis{" "}
                <Link href="https://cloud.huozi.app/workspace" className="underline">cloud.huozi.app/workspace</Link>{" "}
                (ou l'équivalent Edge).
              </>
            ),
          })}
        </li>
        <li>
          {t({
            zh: "RFC 8252 token 默认 1 小时过期,需要 refresh 续命。RFC 8628 api_key 默认无过期,但每个 connection 可独立设 sliding-window TTL。",
            en: "RFC 8252 access tokens default to 1h TTL with refresh rotation. RFC 8628 api_keys have no default TTL but each connection can opt into a sliding-window TTL.",
            ja: "RFC 8252 のアクセストークンはデフォルトで 1 時間 TTL、refresh ローテーションで延命。RFC 8628 の api_key はデフォルト無期限ですが、connection ごとに sliding-window TTL を選択できます。",
            fr: "Les access_tokens RFC 8252 ont une TTL par défaut de 1 h avec rotation par refresh. Les api_keys RFC 8628 n'ont pas de TTL par défaut, mais chaque connexion peut activer une TTL à fenêtre glissante.",
          })}
        </li>
      </ul>

      <H2 id="see-also">
        {t({ zh: "更多", en: "See also", ja: "関連情報", fr: "Voir aussi" })}
      </H2>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5">
        <li>
          <Link href="/docs/api" className="underline hover:text-foreground">
            {t({
              zh: "HTTP API reference — 端点契约",
              en: "HTTP API reference — endpoint contracts",
              ja: "HTTP API リファレンス — エンドポイント契約",
              fr: "Référence API HTTP — contrats d'endpoint",
            })}
          </Link>
        </li>
        <li>
          <Link href="/docs/editions" className="underline hover:text-foreground">
            {t({
              zh: "Cloud vs Edge —— 两个版本的差异",
              en: "Cloud vs Edge — how the editions differ",
              ja: "Cloud vs Edge — 2 つのエディションの違い",
              fr: "Cloud vs Edge — comment les éditions diffèrent",
            })}
          </Link>
        </li>
        <li>
          <Link href="/start" className="underline hover:text-foreground">
            {t({
              zh: "Get started — 选 Agent + 复制",
              en: "Get started — pick an agent + copy",
              ja: "Get started — エージェントを選んでコピー",
              fr: "Get started — choisir un agent + copier",
            })}
          </Link>
        </li>
        <li>
          <Link href="/llms.txt" className="underline hover:text-foreground">
            /llms.txt{" "}
            {t({
              zh: "(Agent 读的版本)",
              en: "(the agent-readable version)",
              ja: "(エージェント可読版)",
              fr: "(la version lisible par l'agent)",
            })}
          </Link>
        </li>
      </ul>
    </article>
  );
}
