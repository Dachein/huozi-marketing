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
  title: "Cloud vs Edge — huozi Docs",
  description:
    "huozi ships in two editions from one codebase: Cloud (huozi-hosted, multi-workspace, OTP login) and Edge (deployed on your own Cloudflare, single workspace, password login). Same MCP surface, three behavior axes differ.",
};

export default async function EditionsPage() {
  const locale = await getLocale();
  const t = <T,>(v: Partial<Record<typeof locale, T>>): T => pick(locale, v);

  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">Cloud vs Edge</h1>
      <Lead>
        {t({
          zh: "huozi 一份代码出两个版本:Cloud(huozi 托管,多 workspace,OTP 登录)和 Edge(部署到你自己的 Cloudflare,单 workspace,密码登录)。MCP 表面、16 个工具、安装协议完全一致;只在三个行为轴上不同。",
          en: "huozi ships two editions from a single codebase: Cloud (huozi-hosted, multi-workspace, OTP login) and Edge (deployed on your own Cloudflare account, single workspace, password login). Same MCP surface, same 16 tools, same install protocol; the editions differ on three behavior axes only.",
          ja: "huozi は 1 つのコードベースから 2 つのエディションをリリースします:Cloud(huozi がホスト、マルチワークスペース、OTP ログイン)と Edge(自分の Cloudflare アカウントにデプロイ、シングルワークスペース、パスワードログイン)。同じ MCP サーフェス、同じ 16 ツール、同じインストールプロトコル;エディションは 3 つの動作軸でのみ異なります。",
          fr: "huozi propose deux éditions à partir d'un seul codebase : Cloud (hébergé par huozi, multi-workspace, connexion OTP) et Edge (déployé sur votre propre compte Cloudflare, workspace unique, connexion par mot de passe). Même surface MCP, mêmes 16 outils, même protocole d'installation ; les éditions ne diffèrent que sur trois axes de comportement.",
        })}
      </Lead>

      <H2 id="three-axes">
        {t({
          zh: "三个差异轴",
          en: "Three axes of difference",
          ja: "3 つの差異軸",
          fr: "Trois axes de différence",
        })}
      </H2>
      <Table>
        <thead>
          <tr>
            <Th>
              {t({
                zh: "维度",
                en: "Dimension",
                ja: "次元",
                fr: "Dimension",
              })}
            </Th>
            <Th>Cloud</Th>
            <Th>Edge</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td>
              <strong>
                {t({
                  zh: "登录方式",
                  en: "Login",
                  ja: "ログイン",
                  fr: "Connexion",
                })}
              </strong>
            </Td>
            <Td>
              {t({
                zh: "Email OTP(无密码)。新邮箱第一次登录 = 注册;无独立 signup 路由。",
                en: "Email OTP (passwordless). New email's first login = registration; no separate signup route.",
                ja: "Email OTP(パスワードなし)。新しいメールアドレスの初回ログイン = 登録;別の signup ルートはありません。",
                fr: "Email OTP (sans mot de passe). Première connexion d'un email = inscription ; pas de route signup séparée.",
              })}
            </Td>
            <Td>
              {t({
                zh: "Email + 密码。Self-host 部署不一定有出站 SMTP,密码免维护邮件链。",
                en: "Email + password. Self-host deploys may lack outbound SMTP; passwords skip the mail dependency.",
                ja: "Email + パスワード。セルフホスト deploy はアウトバウンド SMTP を持たない場合があり、パスワードならメール依存を回避できます。",
                fr: "Email + mot de passe. Les déploiements self-host peuvent manquer de SMTP sortant ; les mots de passe évitent la dépendance email.",
              })}
            </Td>
          </tr>
          <tr>
            <Td>
              <strong>
                {t({
                  zh: "Workspace 模型",
                  en: "Workspace model",
                  ja: "ワークスペースモデル",
                  fr: "Modèle de workspace",
                })}
              </strong>
            </Td>
            <Td>
              {t({
                zh: "多 workspace —— 用户可属于多个,可被邀请加入。",
                en: "Multi-workspace — users can belong to many, and be invited into others.",
                ja: "マルチワークスペース — ユーザーは複数に所属でき、他に招待されることもできます。",
                fr: "Multi-workspace — les utilisateurs peuvent appartenir à plusieurs, et être invités dans d'autres.",
              })}
            </Td>
            <Td>
              {t({
                zh: (
                  <>
                    单 workspace —— 部署时锁定 <Inline>HUOZI_EDGE_WORKSPACE_SLUG</Inline>。
                  </>
                ),
                en: (
                  <>
                    Single workspace — locked at deploy time via{" "}
                    <Inline>HUOZI_EDGE_WORKSPACE_SLUG</Inline>.
                  </>
                ),
                ja: (
                  <>
                    シングルワークスペース — デプロイ時に <Inline>HUOZI_EDGE_WORKSPACE_SLUG</Inline>{" "}
                    でロック。
                  </>
                ),
                fr: (
                  <>
                    Workspace unique — verrouillé au déploiement via{" "}
                    <Inline>HUOZI_EDGE_WORKSPACE_SLUG</Inline>.
                  </>
                ),
              })}
            </Td>
          </tr>
          <tr>
            <Td>
              <strong>
                {t({
                  zh: "公开注册",
                  en: "Public registration",
                  ja: "公開登録",
                  fr: "Inscription publique",
                })}
              </strong>
            </Td>
            <Td>
              {t({
                zh: "支持 —— 任何人输 email 即可加入。",
                en: "Open — anyone with an email can sign in.",
                ja: "オープン — メールアドレスを持つ誰でもサインイン可能。",
                fr: "Ouverte — toute personne avec un email peut se connecter.",
              })}
            </Td>
            <Td>
              {t({
                zh: (
                  <>
                    邀请制 —— admin 在 <Inline>/workspace/members</Inline>{" "}
                    生成邀请链接,新人通过链接预填 email + 设密码加入。
                  </>
                ),
                en: (
                  <>
                    Invite-only — admins generate invite URLs at{" "}
                    <Inline>/workspace/members</Inline>; new users pre-fill email and set a password through the link.
                  </>
                ),
                ja: (
                  <>
                    招待制 — admin が <Inline>/workspace/members</Inline>{" "}
                    で招待 URL を生成し、新規ユーザーはリンクからメールを事前入力してパスワードを設定し参加。
                  </>
                ),
                fr: (
                  <>
                    Sur invitation — les admins génèrent des URL d'invitation depuis{" "}
                    <Inline>/workspace/members</Inline> ; les nouveaux utilisateurs pré-remplissent leur email et définissent un mot de passe via le lien.
                  </>
                ),
              })}
            </Td>
          </tr>
        </tbody>
      </Table>

      <Note>
        {t({
          zh: "其他一切共通 —— MCP 工具调用、commit 历史、二进制资产、公开分享、API key、OAuth 端点 —— 都在同一份 IdentityService 接口下,Cloud 和 Edge 各自实现。",
          en: "Everything else is shared — MCP tool calls, commit history, binary assets, public sharing, API keys, OAuth endpoints — all behind one IdentityService interface that Cloud and Edge each implement.",
          ja: "その他すべては共通 — MCP ツール呼び出し、コミット履歴、バイナリアセット、公開共有、API キー、OAuth エンドポイント — すべて 1 つの IdentityService インターフェースの背後にあり、Cloud と Edge がそれぞれ実装します。",
          fr: "Tout le reste est partagé — appels d'outils MCP, historique des commits, actifs binaires, partage public, clés API, endpoints OAuth — tout derrière une interface IdentityService unique que Cloud et Edge implémentent chacun.",
        })}
      </Note>

      <H2 id="when-to-pick">
        {t({
          zh: "怎么选",
          en: "Which to pick",
          ja: "どちらを選ぶか",
          fr: "Lequel choisir",
        })}
      </H2>
      <H3 id="pick-cloud">
        {t({
          zh: "选 Cloud,如果……",
          en: "Pick Cloud if…",
          ja: "Cloud を選ぶ場合…",
          fr: "Choisissez Cloud si…",
        })}
      </H3>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 mb-4">
        <li>
          {t({
            zh: "你想立刻开始用,不愿运维 Cloudflare 资源。",
            en: "You want to start immediately and don't want to operate Cloudflare resources yourself.",
            ja: "すぐに使い始めたい、Cloudflare リソースを自分で運用したくない。",
            fr: "Vous voulez commencer immédiatement et ne souhaitez pas opérer vous-même les ressources Cloudflare.",
          })}
        </li>
        <li>
          {t({
            zh: "你需要跨工作区协作 / 在不同项目间切换。",
            en: "You need cross-workspace collaboration or switching between projects.",
            ja: "ワークスペース横断のコラボレーションやプロジェクト間切り替えが必要。",
            fr: "Vous avez besoin de collaboration inter-workspace ou de passer d'un projet à l'autre.",
          })}
        </li>
        <li>
          {t({
            zh: "你的团队会有来自外部邮箱的人(自助注册)。",
            en: "Your team will have people joining from outside email addresses (self-serve sign-up).",
            ja: "チームに外部メールアドレスから参加するメンバーがいる(セルフサービス登録)。",
            fr: "Votre équipe accueillera des personnes via des emails externes (inscription en self-service).",
          })}
        </li>
      </ul>

      <H3 id="pick-edge">
        {t({
          zh: "选 Edge,如果……",
          en: "Pick Edge if…",
          ja: "Edge を選ぶ場合…",
          fr: "Choisissez Edge si…",
        })}
      </H3>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 mb-4">
        <li>
          {t({
            zh: "数据合规要求字节落在你自己控制的 Cloudflare 账号下。",
            en: "Compliance requires bytes to live in your own Cloudflare account.",
            ja: "コンプライアンス上、データを自分の Cloudflare アカウント配下に置く必要がある。",
            fr: "La conformité exige que les octets résident dans votre propre compte Cloudflare.",
          })}
        </li>
        <li>
          {t({
            zh: "你只需要一个工作区(团队 / 项目级)。",
            en: "You only need one workspace (team / project scope).",
            ja: "ワークスペースが 1 つだけ必要(チーム / プロジェクト単位)。",
            fr: "Vous n'avez besoin que d'un seul workspace (échelle équipe / projet).",
          })}
        </li>
        <li>
          {t({
            zh: "你想完全控制部署 —— 域名、自定义认证、按需扩展。",
            en: "You want full control over the deploy — your own domain, custom auth, custom scaling.",
            ja: "デプロイを完全に制御したい — 自分のドメイン、カスタム認証、カスタムスケーリング。",
            fr: "Vous voulez le contrôle total du déploiement — votre propre domaine, authentification personnalisée, mise à l'échelle personnalisée.",
          })}
        </li>
        <li>
          {t({
            zh: "MIT 开源,你想自己 fork。",
            en: "MIT-licensed — you want to fork it.",
            ja: "MIT ライセンス — fork したい。",
            fr: "Sous licence MIT — vous voulez la forker.",
          })}
        </li>
      </ul>

      <H2 id="edge-deploy">
        {t({
          zh: "Edge 一行部署",
          en: "Edge one-command deploy",
          ja: "Edge ワンライナーデプロイ",
          fr: "Déploiement Edge en une commande",
        })}
      </H2>
      <P>
        {t({
          zh: "完整部署命令(在你装好 wrangler CLI、登录 Cloudflare 后):",
          en: "Full deploy command (after installing wrangler CLI and logging into Cloudflare):",
          ja: "完全なデプロイコマンド(wrangler CLI インストール + Cloudflare ログイン後):",
          fr: "Commande de déploiement complète (après installation du CLI wrangler et connexion à Cloudflare) :",
        })}
      </P>
      <Code code={`curl -fsSL https://huozi.app/install.sh | bash`} />
      <P>
        {t({
          zh: (
            <>
              脚本会创建 D1 数据库、R2 bucket、Worker,把它们绑到一起,用一次性的 admin secret 接你登第一个账号。详细 walkthrough 见{" "}
              <Link href="/start/edge" className="underline">
                /start/edge
              </Link>
              。
            </>
          ),
          en: (
            <>
              The script creates a D1 database, R2 bucket, and Worker, binds them together, and lets you set the first admin account via a one-time admin secret. Full walkthrough at{" "}
              <Link href="/start/edge" className="underline">
                /start/edge
              </Link>
              .
            </>
          ),
          ja: (
            <>
              スクリプトは D1 データベース、R2 バケット、Worker を作成し、それらをバインドし、ワンタイム admin secret で最初の admin アカウントを設定できるようにします。詳細なウォークスルーは{" "}
              <Link href="/start/edge" className="underline">
                /start/edge
              </Link>
              。
            </>
          ),
          fr: (
            <>
              Le script crée une base D1, un bucket R2 et un Worker, les lie ensemble, et vous permet de définir le premier compte admin via un secret admin unique. Walkthrough complet sur{" "}
              <Link href="/start/edge" className="underline">
                /start/edge
              </Link>
              .
            </>
          ),
        })}
      </P>

      <H2 id="install-parity">
        {t({
          zh: "安装协议平等",
          en: "Install protocol parity",
          ja: "インストールプロトコルの同等性",
          fr: "Parité du protocole d'installation",
        })}
      </H2>
      <P>
        {t({
          zh: (
            <>
              Edge 部署后,所有安装命令把 <Inline>cloud.huozi.app</Inline> 替换成你自己的 worker 域名(比如{" "}
              <Inline>myco.workers.dev</Inline> 或自定义域)即可。
              <Link href="/llms.txt" className="underline">/llms.txt</Link> 和{" "}
              <Link href="/docs/api" className="underline">/.well-known/*</Link> 端点都是 env-driven —— 同一份模板,host 自动匹配请求来源。
            </>
          ),
          en: (
            <>
              After Edge deploy, every install snippet works the same — substitute your own worker domain (e.g.{" "}
              <Inline>myco.workers.dev</Inline> or a custom domain) for <Inline>cloud.huozi.app</Inline>. The{" "}
              <Link href="/llms.txt" className="underline">/llms.txt</Link> and{" "}
              <Link href="/docs/api" className="underline">/.well-known/*</Link> endpoints are env-driven — same template, host matches the request origin.
            </>
          ),
          ja: (
            <>
              Edge デプロイ後、すべてのインストールスニペットは同じように動作します — <Inline>cloud.huozi.app</Inline> を自分の worker ドメイン(例:<Inline>myco.workers.dev</Inline> やカスタムドメイン)に置き換えるだけ。{" "}
              <Link href="/llms.txt" className="underline">/llms.txt</Link> と{" "}
              <Link href="/docs/api" className="underline">/.well-known/*</Link> エンドポイントは env 駆動 — 同じテンプレート、host はリクエスト元に自動マッチ。
            </>
          ),
          fr: (
            <>
              Après le déploiement Edge, chaque snippet d'installation fonctionne de la même manière — substituez votre propre domaine worker (par ex.{" "}
              <Inline>myco.workers.dev</Inline> ou un domaine personnalisé) à <Inline>cloud.huozi.app</Inline>. Les endpoints{" "}
              <Link href="/llms.txt" className="underline">/llms.txt</Link> et{" "}
              <Link href="/docs/api" className="underline">/.well-known/*</Link> sont env-driven — même template, le host correspond à l'origine de la requête.
            </>
          ),
        })}
      </P>

      <H2 id="see-also">
        {t({ zh: "更多", en: "See also", ja: "関連情報", fr: "Voir aussi" })}
      </H2>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5">
        <li>
          <Link href="/docs/auth" className="underline hover:text-foreground">
            {t({
              zh: "两条 pipeline (OAuth + device flow)",
              en: "Two install pipelines (OAuth + device flow)",
              ja: "2 つのインストールパイプライン (OAuth + device flow)",
              fr: "Deux pipelines d'installation (OAuth + device flow)",
            })}
          </Link>
        </li>
        <li>
          <Link href="/start/edge" className="underline hover:text-foreground">
            {t({
              zh: "Edge 部署详细 walkthrough",
              en: "Edge deploy detailed walkthrough",
              ja: "Edge デプロイ詳細ウォークスルー",
              fr: "Walkthrough détaillé du déploiement Edge",
            })}
          </Link>
        </li>
        <li>
          <Link href="/edge" className="underline hover:text-foreground">
            {t({
              zh: "Edge 概览",
              en: "Edge edition overview",
              ja: "Edge エディション概要",
              fr: "Aperçu de l'édition Edge",
            })}
          </Link>
        </li>
      </ul>
    </article>
  );
}
