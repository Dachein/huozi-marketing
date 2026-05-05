import Link from "next/link";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n/server";
import { H2, H3, Lead, P, Inline, Table, Th, Td } from "@/components/docs/elements";

export const metadata: Metadata = {
  title: "Docs — huozi",
  description:
    "huozi Cloud / Edge documentation — Agent-native cloud drive over MCP. Two install pipelines (RFC 8252 OAuth + RFC 8628 device flow), Cloud vs Edge editions, and the 16-tool MCP surface.",
};

/**
 * /docs landing page. Short overview + category cards + the MCP
 * tools reference table (the table is here on the landing page
 * because it's self-contained and the most-linked thing in the
 * old single-page docs).
 *
 * Long-form content lives in subpages under /docs/<topic>/ —
 * wired up via the shared layout.tsx + sidebar-nav.tsx.
 */
export default async function DocsPage() {
  const locale = await getLocale();
  const isZh = locale === "zh";

  return (
    <article>
      <h1 className="text-4xl font-bold tracking-tight">
        {isZh ? "文档" : "Docs"}
      </h1>
      <Lead>
        {isZh
          ? "huozi 是一个 Agent 原生的云盘 —— 通过 MCP 暴露文件树,任何 MCP 客户端(Claude Code / Cursor / Hermes / OpenClaw / Cowork / 任意 Agent)都能把它当作共享工作区。本文档覆盖 Cloud / Edge 两个版本、两条 pipeline(RFC 8252 OAuth + RFC 8628 device flow)、以及 16 个 MCP 工具。"
          : "huozi is an Agent-native cloud drive. It exposes a versioned file tree over MCP so any MCP client (Claude Code, Cursor, Hermes, OpenClaw, Cowork, or any agent) can use it as a shared workspace. These docs cover the Cloud / Edge editions, the two install pipelines (RFC 8252 OAuth + RFC 8628 device flow), and the 16-tool MCP surface."}
      </Lead>

      <H2 id="topics">{isZh ? "目录" : "Topics"}</H2>
      <P>
        {isZh
          ? "文档按下面分类组织。每张卡片是一个独立子页(深度链接友好);右侧/顶部边栏在所有 /docs 页都能切换。"
          : "Docs are organized into the topics below. Each card opens its own sub-page (deep-linkable). The sidebar on the right (or the top bar on mobile) navigates between them."}
      </P>
      <div className="grid sm:grid-cols-2 gap-3 mb-12">
        <TopicCard
          href="/start"
          title={isZh ? "Getting started" : "Getting started"}
          desc={
            isZh
              ? "复制粘贴一行,Agent 自己装。或者按你客户端的原生 CLI / GUI 装。"
              : "Paste a one-liner — the Agent installs itself. Or use your client's native CLI / GUI."
          }
          external
        />
        <TopicCard
          href="/docs/editions"
          title={isZh ? "Cloud vs Edge" : "Cloud vs Edge"}
          desc={
            isZh
              ? "两个版本如何不同(登录、workspace 模型、注册),以及怎么选。"
              : "How the two editions differ (login, workspace model, registration) — and which to pick."
          }
        />
        <TopicCard
          href="/docs/auth"
          title={isZh ? "两条 pipeline" : "Two install pipelines"}
          desc={
            isZh
              ? "RFC 8252 OAuth-on-first-use(本地终端)vs RFC 8628 device flow(Agent 自己装)。"
              : "RFC 8252 OAuth-on-first-use (local terminal) vs RFC 8628 device flow (the Agent drives it)."
          }
        />
        <TopicCard
          href="/docs/api"
          title={isZh ? "HTTP API reference" : "HTTP API reference"}
          desc={
            isZh
              ? "/.well-known、/auth、/oauth、/mcp、/llms.txt —— 端点契约 + curl 示例。"
              : "/.well-known, /auth, /oauth, /mcp, /llms.txt — endpoint contracts + curl examples."
          }
        />
        <TopicCard
          href="#tools"
          title={isZh ? "MCP tools reference" : "MCP tools reference"}
          desc={
            isZh
              ? "16 个 huozi_* 工具:Claude Code 方言 5 个 + huozi 扩展 11 个。"
              : "16 huozi_* tools: 5 Claude Code dialect + 11 huozi-native extensions."
          }
        />
        <TopicCard
          href="/docs/auth#agent-prompt"
          title={isZh ? "Agent integration" : "Agent integration"}
          desc={
            isZh
              ? "llms.txt 协议、?for=<kind> 过滤、agent_kind 枚举。"
              : "The llms.txt protocol, the ?for=<kind> filter, the agent_kind enum."
          }
        />
        <TopicCard
          href="/start/edge"
          title={isZh ? "Self-host (Edge)" : "Self-host (Edge)"}
          desc={
            isZh
              ? "一行 curl 部署到你自己的 Cloudflare 账号。"
              : "One curl command deploys to your own Cloudflare account."
          }
          external
        />
        <TopicCard
          href="https://github.com/Dachein/huozi"
          title={isZh ? "Source code" : "Source code"}
          desc={
            isZh
              ? "MIT 授权,GitHub 上的 huozi-cloud Worker + Next.js app。"
              : "MIT-licensed huozi-cloud Worker + Next.js app on GitHub."
          }
          external
        />
      </div>

      <H2 id="concepts">{isZh ? "Concepts" : "Concepts"}</H2>
      <Table>
        <thead>
          <tr>
            <Th>{isZh ? "术语" : "Term"}</Th>
            <Th>{isZh ? "含义" : "Meaning"}</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td>Workspace</Td>
            <Td>
              {isZh
                ? "一棵带版本历史的文件树,R2 后端。地址 "
                : "A versioned, R2-backed file tree. Addressed as "}
              <Inline>ws_&lt;slug&gt;</Inline>
              {isZh ? "。" : "."}
            </Td>
          </tr>
          <tr>
            <Td>Connection</Td>
            <Td>
              {isZh
                ? "一个 api_key 发给一个 Agent(你笔电的 Claude Code、CI runner 等)。可独立撤销。"
                : "One api_key issued to one Agent (Claude Code on your laptop, a CI runner, etc.). Revocable independently."}
            </Td>
          </tr>
          <tr>
            <Td>Commit</Td>
            <Td>
              {isZh
                ? "每次 write / edit / delete 都产生一个 commit。通过 "
                : "Every write / edit / delete produces a commit. Queryable per-file via the "}
              <Inline>huozi_history</Inline>
              {isZh ? " 工具按文件查询。" : " tool."}
            </Td>
          </tr>
          <tr>
            <Td>Edition</Td>
            <Td>
              {isZh
                ? "Cloud(huozi.app 托管,多 workspace,OTP 登录)或 Edge(部署到你自己的 Cloudflare,单 workspace,密码登录)。详见 "
                : "Cloud (huozi.app-hosted, multi-workspace, OTP login) or Edge (deployed on your own Cloudflare, single-workspace, password login). See "}
              <Link href="/docs/editions" className="underline">
                /docs/editions
              </Link>
              .
            </Td>
          </tr>
        </tbody>
      </Table>

      <H2 id="tools">{isZh ? "MCP tools" : "MCP tools"}</H2>
      <P>
        {isZh
          ? "16 个工具,分四类。前 5 个与 Claude Code 文件工具方言完全等价;其余是 huozi 扩展(原子批处理、不可变历史、二进制资产、公开分享、身份)。"
          : "Sixteen tools, grouped by capability. The first five mirror Claude Code's file-tool dialect bit-for-bit; the rest are huozi-native extensions that go beyond what a local filesystem can offer (atomic batches, immutable history, binary asset handling, public sharing, identity)."}
      </P>

      <H3 id="tools-dialect">
        {isZh ? "Claude Code 方言 (5)" : "Claude Code dialect (5)"}
      </H3>
      <Table>
        <thead>
          <tr>
            <Th>{isZh ? "工具" : "Tool"}</Th>
            <Th>{isZh ? "用途" : "Purpose"}</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td>
              <Inline>huozi_read</Inline>
            </Td>
            <Td>
              {isZh
                ? "按行读取文件(支持 offset/limit 分页)。返回 cat -n 风格的文本,或会话已缓存时返回 file_unchanged。"
                : "Read a file with line-offset pagination. Returns cat -n style text, or file_unchanged when the session already has it."}
            </Td>
          </tr>
          <tr>
            <Td>
              <Inline>huozi_write</Inline>
            </Td>
            <Td>
              {isZh
                ? "一次 commit 创建或覆盖文件。"
                : "Create or overwrite a file in one commit."}
            </Td>
          </tr>
          <tr>
            <Td>
              <Inline>huozi_edit</Inline>
            </Td>
            <Td>
              {isZh
                ? "字符串替换式精修:old_string → new_string。要求 old_string 在文件内唯一,或加 replace_all。返回 unified diff。"
                : "Surgical string-based edit: old_string → new_string. Required old_string must be unique in the file or use replace_all. Returns a unified patch."}
            </Td>
          </tr>
          <tr>
            <Td>
              <Inline>huozi_glob</Inline>
            </Td>
            <Td>
              {isZh
                ? "快速路径列举,D1 索引后端。"
                : "Fast path listing. Backed by D1 index."}
            </Td>
          </tr>
          <tr>
            <Td>
              <Inline>huozi_grep</Inline>
            </Td>
            <Td>
              {isZh
                ? "正则搜索,FTS5 trigram 预过滤,比遍历快 50 倍。"
                : "Regex search with FTS5 trigram pre-filter — 50× faster than walking the tree."}
            </Td>
          </tr>
        </tbody>
      </Table>

      <H3 id="tools-dirops">
        {isZh ? "目录与版本 (6)" : "Directories & versioning (6)"}
      </H3>
      <Table>
        <thead>
          <tr>
            <Th>{isZh ? "工具" : "Tool"}</Th>
            <Th>{isZh ? "用途" : "Purpose"}</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td>
              <Inline>huozi_list_tree</Inline>
            </Td>
            <Td>
              {isZh
                ? "把一个 prefix 列成目录树。深度有限、可分页;空目录隐式存在(folder 存在 iff 其下有文件)。"
                : "List a prefix as a directory tree. Depth-bounded, paginated; empty dirs are implicit (folders exist iff some file lives under them)."}
            </Td>
          </tr>
          <tr>
            <Td>
              <Inline>huozi_mkdir</Inline>
            </Td>
            <Td>
              {isZh
                ? "用一个隐藏的 .huozi-keep 标记保留空目录名。"
                : "Reserve an empty directory name by writing a hidden .huozi-keep marker."}
            </Td>
          </tr>
          <tr>
            <Td>
              <Inline>huozi_mv</Inline>
            </Td>
            <Td>
              {isZh
                ? "重命名或移动文件。原子 commit;历史链跨重命名保留。"
                : "Rename or move a file. Atomic commit; history chain preserved across the rename."}
            </Td>
          </tr>
          <tr>
            <Td>
              <Inline>huozi_rm</Inline>
            </Td>
            <Td>
              {isZh
                ? "删除文件。记为单独 commit,通过 huozi_history 可见(可恢复)。"
                : "Delete a file. Recorded as a single commit; visible (and reversible) via huozi_history."}
            </Td>
          </tr>
          <tr>
            <Td>
              <Inline>huozi_batch_edit</Inline>
            </Td>
            <Td>
              {isZh
                ? "跨一个或多个文件的 N 个编辑,作为一个 commit 原子应用。每文件独立结果;写入前做 staleness 检查。"
                : "N edits across one or many files, applied atomically as one commit. Per-file results; staleness check before any byte is written."}
            </Td>
          </tr>
          <tr>
            <Td>
              <Inline>huozi_history</Inline>
            </Td>
            <Td>
              {isZh
                ? "文件的 commit 日志:sha、author、操作(create/edit/write/batch)、+/- 行数、message。"
                : "Commit log for a file: sha, author, operation (create/edit/write/batch), +/- lines, message."}
            </Td>
          </tr>
        </tbody>
      </Table>

      <H3 id="tools-binary">
        {isZh ? "二进制 / 资产 (3)" : "Binary & assets (3)"}
      </H3>
      <Table>
        <thead>
          <tr>
            <Th>{isZh ? "工具" : "Tool"}</Th>
            <Th>{isZh ? "用途" : "Purpose"}</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td>
              <Inline>huozi_upload</Inline>
            </Td>
            <Td>
              {isZh
                ? "入站二进制,base64 流式存进 R2。返回 SHA-1 + size;文件出现在 workspace 树中。"
                : "Inbound binary, base64-streamed into R2. Returns SHA-1 + size; the file shows up in the workspace tree."}
            </Td>
          </tr>
          <tr>
            <Td>
              <Inline>huozi_download</Inline>
            </Td>
            <Td>
              {isZh
                ? "拿到一个时限签名 URL 直接从 R2 取二进制 —— 不经 Worker 代理。"
                : "Get a time-limited signed URL to fetch a binary directly from R2 — no proxy hop through the Worker."}
            </Td>
          </tr>
          <tr>
            <Td>
              <Inline>huozi_image_render</Inline>
            </Td>
            <Td>
              {isZh
                ? "服务端 SVG → PNG(resvg-wasm)。给需要像素而不是 markup 的 Agent 用。"
                : "Server-side SVG → PNG via resvg-wasm. For Agents that want pixels, not markup."}
            </Td>
          </tr>
        </tbody>
      </Table>

      <H3 id="tools-publish">
        {isZh ? "发布与身份 (3)" : "Publishing & identity (3)"}
      </H3>
      <Table>
        <thead>
          <tr>
            <Th>{isZh ? "工具" : "Tool"}</Th>
            <Th>{isZh ? "用途" : "Purpose"}</Th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <Td>
              <Inline>huozi_template</Inline>
            </Td>
            <Td>
              {isZh
                ? "拉一个 HTML 脚手架(deck / story / paper / mobile / page 五选一)给 Agent 填。"
                : "Fetch one of five HTML scaffolds (deck / story / paper / mobile / page) for the Agent to fill in."}
            </Td>
          </tr>
          <tr>
            <Td>
              <Inline>huozi_share</Inline>
            </Td>
            <Td>
              {isZh
                ? "把一个文件发布成 huozi.app/p/<slug> 跟踪当前字节的实时 URL。编辑立即生效。"
                : "Publish a file as a live huozi.app/p/<slug> URL that tracks the current bytes. Edits go live immediately."}
            </Td>
          </tr>
          <tr>
            <Td>
              <Inline>huozi_whoami</Inline>
            </Td>
            <Td>
              {isZh
                ? "返回当前 principal、workspace 与 scope prefix。Agent 行动前用于自检。"
                : "Return the current principal, workspace, and scope prefix. For Agent self-checks before acting."}
            </Td>
          </tr>
        </tbody>
      </Table>

      <H2 id="links">{isZh ? "更多" : "See also"}</H2>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1.5">
        <li>
          <Link href="/start" className="underline hover:text-foreground">
            {isZh
              ? "Get started — 安装指引"
              : "Get started — install guide"}
          </Link>
        </li>
        <li>
          <Link
            href="/docs/auth"
            className="underline hover:text-foreground"
          >
            {isZh
              ? "两条 pipeline — OAuth 与 device flow"
              : "Two install pipelines — OAuth and device flow"}
          </Link>
        </li>
        <li>
          <Link href="/cloud" className="underline hover:text-foreground">
            {isZh ? "Cloud edition 概览" : "Cloud edition overview"}
          </Link>
        </li>
        <li>
          <Link href="/edge" className="underline hover:text-foreground">
            {isZh ? "Edge edition (自部署) 概览" : "Edge edition (self-host) overview"}
          </Link>
        </li>
        <li>
          <a
            href="https://github.com/Dachein/huozi"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            {isZh ? "huozi 源码 (MIT)" : "huozi source code (MIT)"}
          </a>
        </li>
      </ul>
    </article>
  );
}

function TopicCard({
  href,
  title,
  desc,
  external,
}: {
  href: string;
  title: string;
  desc: string;
  external?: boolean;
}) {
  const className =
    "block rounded-lg border border-border p-4 hover:border-foreground/30 transition-colors";
  const inner = (
    <>
      <h3 className="font-semibold text-sm mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
    </>
  );
  if (external && href.startsWith("http")) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {inner}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {inner}
    </Link>
  );
}
