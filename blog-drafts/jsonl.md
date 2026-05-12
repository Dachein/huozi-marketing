---
slug: agent-data-should-be-jsonl
title: "Agent 写的数据，应该是 jsonl"
date: 2026-05-12
status: draft
owner: dachein
---

> 草稿。@dachein 把角度过一遍，然后再走 `/blog/admin` 上线。

## 起点：Agent 把它生成的"状态"扔哪儿？

一个跑了 2 小时的研究 Agent，结束时有一堆要保存的东西：抓到的事实、分析中间态、决策日志、最终结论。

放 **csv**？csv 不支持嵌套、不支持事件、不支持每行结构不同。一个 row 来一个新字段，整张表得重写。

放 **json**？json 是封闭对象。Agent 想追加一条事实，得读出整个 json、合并、写回。多个 Agent 并发写一个 json 文件 = 数据丢失。

放 **sqlite**？人读不了、grep 不了、cat 不了、git diff 看不出问题。可观测性归零。

## jsonl 三个属性正好对上 Agent 工作流

1. **Append-only** — 追加一行 = 一次 IO。不用读旧数据，不用合并，不用担心 race condition（最多就是顺序问题）。
2. **逐行 self-describing** — 每行是一个完整 JSON object。第 5 行的 schema 和第 50 行可以完全不同 —— 中间换字段、加事件类型都行。
3. **纯文本，逐行可读** — 可 grep、可 diff、可 `tail -f`。人和 Agent 读同一份字节序列。

写一份长跑 Agent 的状态，jsonl 是最小阻力路径。

## huozi 在 jsonl 上多做的两步

裸 jsonl 已经够好用了。huozi 在两个点上加了语义：

### 第一行就是 schema

约定第一行写成 `{"op":"schema", "schema": {...}}`，里面声明字段名、字段类型、用哪个字段做标题、哪个做副标题。渲染器读到这条事件就知道怎么画。

```jsonl
{"op":"schema","schema":{"entity":{"title_field":"name"},"fields":{"name":{...},"stage":{"type":"select","options":["lead","won","lost"]}}}}
{"op":"upsert","id":"c1","name":"Acme","stage":"lead"}
{"op":"upsert","id":"c1","stage":"won"}
```

schema 跟数据走在一个文件里 —— 复制、分享、看历史都不丢渲染信息。比 sidecar `.schema.json` 干净。

### 事件折叠：latest-wins per field

后续 `op:upsert` 事件按 `id` 折叠成当前态，**逐字段** latest-wins。上面例子里，`c1` 的最终态是 `{name:"Acme", stage:"won"}`。但 `stage:"lead"` 这条事件留在文件里 —— 你能看到它什么时候变了状态。

每条事件 = 一次值更新。整个文件 = 完整历史。当前态 = 投影。

## JSON / HTML / JSONL 各管什么

| 类型 | 干什么 | 谁渲染 | 适合谁写 |
|---|---|---|---|
| **JSON** | 一次性结构化输出（配置、API 响应） | 看具体场景 | 一次性 Agent 调用 |
| **HTML** | 客户端可执行的呈现（dashboard、deck、报告） | 浏览器 | 一次性内容 + 嵌入活数据 |
| **JSONL** | append-only 事件流（状态、日志、CRM、kanban） | huozi Collection 视图 | 长跑 Agent 的累积状态 |

三者经常配合用：HTML Page 用 `<meta huozi:share-include="data.jsonl">` 把 jsonl 拉进来作为活数据源，inline `<script>` 把它渲染成 dashboard。一份分享链接 = 一个能跑的活报告。

## 实际用过的场景

- **CRM** —— 客户、联系记录、阶段变化都是事件。Agent 跑销售，append 一行就完成了"今天打了第 12 通电话"
- **Kanban / 任务看板** —— 每个任务一个 id，状态变化、计划更新、handoff 全是事件
- **Changelog** —— 每次发布 append 一行。schema 进化也是 append 一行 `op:schema`
- **Agent 的工作日记** —— 跑长任务的 Agent 把"今天看了什么、得出什么结论、下次该做什么"按事件追加

任何"状态会变、变化要留痕、活数据要给人和 Agent 同时看"的场景。

## TL;DR

Agent 写、人读、状态会演化、需要历史 —— 这四个条件凑齐时，jsonl 是合适的载体。huozi 在这之上加了 inline schema 和事件折叠，让一份 `.jsonl` 同时是数据、是渲染配置、是历史日志。

这就是为什么 huozi 把 Collection 单列成"四件套"之一。
