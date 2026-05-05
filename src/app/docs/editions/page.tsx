import Link from "next/link";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n/server";
import { H2, H3, Lead, P, Inline, Table, Th, Td, Code, Note } from "@/components/docs/elements";

export const metadata: Metadata = {
  title: "Cloud vs Edge — huozi Docs",
  description:
    "huozi ships in two editions from one codebase: Cloud (huozi-hosted, multi-workspace, OTP login) and Edge (deployed on your own Cloudflare, single workspace, password login). Same MCP surface, three behavior axes differ.",
};

export default async function EditionsPage() {
  const locale = await getLocale();
  const isZh = locale === "zh";

  return (
    <article>
      <h1 className="text-3xl font-bold tracking-tight">
        {isZh ? "Cloud vs Edge" : "Cloud vs Edge"}
      </h1>
      <Lead>
        {isZh
          ? "huozi 一份代码出两个版本:Cloud(huozi 托管,多 workspace,OTP 登录)和 Edge(部署到你自己的 Cloudflare,单 workspace,密码登录)。MCP 表面、16 个工具、安装协议完全一致;只在三个行为轴上不同。"
          : "huozi ships two editions from a single codebase: Cloud (huozi-hosted, multi-workspace, OTP login) and Edge (deployed on your own Cloudflare account, single workspace, password login). Same MCP surface, same 16 tools, same install protocol; the editions differ on three behavior axes only."}
      </Lead>

      <H2 id="three-axes">{isZh ? "三个差异轴" : "Three axes of difference"}</H2>
      <Table>
        <thead>
          <tr>
            <Th>{isZh ? "维度" : "Dimension"}</Th>
            <Th>Cloud</Th>
            <Th>Edge</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td>
              <strong>{isZh ? "登录方式" : "Login"}</strong>
            </Td>
            <Td>
              {isZh
                ? "Email OTP(无密码)。新邮箱第一次登录 = 注册;无独立 signup 路由。"
                : "Email OTP (passwordless). New email's first login = registration; no separate signup route."}
            </Td>
            <Td>
              {isZh
                ? "Email + 密码。Self-host 部署不一定有出站 SMTP,密码免维护邮件链。"
                : "Email + password. Self-host deploys may lack outbound SMTP; passwords skip the mail dependency."}
            </Td>
          </tr>
          <tr>
            <Td>
              <strong>{isZh ? "Workspace 模型" : "Workspace model"}</strong>
            </Td>
            <Td>
              {isZh
                ? "多 workspace —— 用户可属于多个,可被邀请加入。"
                : "Multi-workspace — users can belong to many, and be invited into others."}
            </Td>
            <Td>
              {isZh ? (
                <>
                  单 workspace —— 部署时锁定 <Inline>HUOZI_EDGE_WORKSPACE_SLUG</Inline>。
                </>
              ) : (
                <>
                  Single workspace — locked at deploy time via <Inline>HUOZI_EDGE_WORKSPACE_SLUG</Inline>.
                </>
              )}
            </Td>
          </tr>
          <tr>
            <Td>
              <strong>{isZh ? "公开注册" : "Public registration"}</strong>
            </Td>
            <Td>
              {isZh
                ? "支持 —— 任何人输 email 即可加入。"
                : "Open — anyone with an email can sign in."}
            </Td>
            <Td>
              {isZh ? (
                <>
                  邀请制 —— admin 在 <Inline>/workspace/members</Inline> 生成邀请链接,新人通过链接预填 email + 设密码加入。
                </>
              ) : (
                <>
                  Invite-only — admins generate invite URLs at <Inline>/workspace/members</Inline>; new users pre-fill email and set a password through the link.
                </>
              )}
            </Td>
          </tr>
        </tbody>
      </Table>

      <Note>
        {isZh
          ? "其他一切共通 —— MCP 工具调用、commit 历史、二进制资产、公开分享、API key、OAuth 端点 —— 都在同一份 IdentityService 接口下,Cloud 和 Edge 各自实现。"
          : "Everything else is shared — MCP tool calls, commit history, binary assets, public sharing, API keys, OAuth endpoints — all behind one IdentityService interface that Cloud and Edge each implement."}
      </Note>

      <H2 id="when-to-pick">{isZh ? "怎么选" : "Which to pick"}</H2>
      <H3 id="pick-cloud">{isZh ? "选 Cloud,如果……" : "Pick Cloud if…"}</H3>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 mb-4">
        <li>
          {isZh
            ? "你想立刻开始用,不愿运维 Cloudflare 资源。"
            : "You want to start immediately and don't want to operate Cloudflare resources yourself."}
        </li>
        <li>
          {isZh
            ? "你需要跨工作区协作 / 在不同项目间切换。"
            : "You need cross-workspace collaboration or switching between projects."}
        </li>
        <li>
          {isZh
            ? "你的团队会有来自外部邮箱的人(自助注册)。"
            : "Your team will have people joining from outside email addresses (self-serve sign-up)."}
        </li>
      </ul>

      <H3 id="pick-edge">{isZh ? "选 Edge,如果……" : "Pick Edge if…"}</H3>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5 mb-4">
        <li>
          {isZh
            ? "数据合规要求字节落在你自己控制的 Cloudflare 账号下。"
            : "Compliance requires bytes to live in your own Cloudflare account."}
        </li>
        <li>
          {isZh
            ? "你只需要一个工作区(团队 / 项目级)。"
            : "You only need one workspace (team / project scope)."}
        </li>
        <li>
          {isZh
            ? "你想完全控制部署 —— 域名、自定义认证、按需扩展。"
            : "You want full control over the deploy — your own domain, custom auth, custom scaling."}
        </li>
        <li>
          {isZh
            ? "MIT 开源,你想自己 fork。"
            : "MIT-licensed — you want to fork it."}
        </li>
      </ul>

      <H2 id="edge-deploy">{isZh ? "Edge 一行部署" : "Edge one-command deploy"}</H2>
      <P>
        {isZh
          ? "完整部署命令(在你装好 wrangler CLI、登录 Cloudflare 后):"
          : "Full deploy command (after installing wrangler CLI and logging into Cloudflare):"}
      </P>
      <Code code={`curl -fsSL https://huozi.app/install.sh | bash`} />
      <P>
        {isZh ? (
          <>
            脚本会创建 D1 数据库、R2 bucket、Worker,把它们绑到一起,用一次性的 admin secret 接你登第一个账号。详细 walkthrough 见{" "}
            <Link href="/start/edge" className="underline">
              /start/edge
            </Link>
            。
          </>
        ) : (
          <>
            The script creates a D1 database, R2 bucket, and Worker, binds them together, and lets you set the first admin account via a one-time admin secret. Full walkthrough at{" "}
            <Link href="/start/edge" className="underline">
              /start/edge
            </Link>
            .
          </>
        )}
      </P>

      <H2 id="install-parity">{isZh ? "安装协议平等" : "Install protocol parity"}</H2>
      <P>
        {isZh ? (
          <>
            Edge 部署后,所有安装命令把 <Inline>cloud.huozi.app</Inline> 替换成你自己的 worker 域名(比如{" "}
            <Inline>myco.workers.dev</Inline> 或自定义域)即可。<Link href="/llms.txt" className="underline">/llms.txt</Link>{" "}
            和 <Link href="/docs/api" className="underline">/.well-known/*</Link> 端点都是 env-driven —— 同一份模板,host 自动匹配请求来源。
          </>
        ) : (
          <>
            After Edge deploy, every install snippet works the same — substitute your own worker domain (e.g.{" "}
            <Inline>myco.workers.dev</Inline> or a custom domain) for <Inline>cloud.huozi.app</Inline>. The{" "}
            <Link href="/llms.txt" className="underline">/llms.txt</Link> and{" "}
            <Link href="/docs/api" className="underline">/.well-known/*</Link> endpoints are env-driven — same template, host matches the request origin.
          </>
        )}
      </P>

      <H2 id="see-also">{isZh ? "更多" : "See also"}</H2>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5">
        <li>
          <Link href="/docs/auth" className="underline hover:text-foreground">
            {isZh ? "Two install pipelines (OAuth + device flow)" : "Two install pipelines (OAuth + device flow)"}
          </Link>
        </li>
        <li>
          <Link href="/start/edge" className="underline hover:text-foreground">
            {isZh ? "Edge 部署详细 walkthrough" : "Edge deploy detailed walkthrough"}
          </Link>
        </li>
        <li>
          <Link href="/edge" className="underline hover:text-foreground">
            {isZh ? "Edge 概览" : "Edge edition overview"}
          </Link>
        </li>
      </ul>
    </article>
  );
}
