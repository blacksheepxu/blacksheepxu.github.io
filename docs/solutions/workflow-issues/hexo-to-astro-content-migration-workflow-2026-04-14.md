---
title: Hexo 发布产物迁移到 Astro 时，分开建模内容、路由与静态资源
date: 2026-04-14
category: workflow-issues
module: astro-site-migration
problem_type: workflow_issue
component: development_workflow
severity: medium
applies_when:
  - when migrating a published Hexo site into Astro
  - when legacy content and native content need to coexist
  - when old posts reference static assets that must keep rendering
  - when migration scripts should reject malformed source data instead of masking it
symptoms:
  - native posts fail validation because legacy-only fields are still required
  - legacy article images render as 404 after the new build
  - homepage featured slots stay dominated by imported legacy posts
  - malformed legacy URLs silently corrupt chronology and sorting
root_cause: missing_workflow_step
resolution_type: workflow_improvement
related_components:
  - tooling
  - testing_framework
tags:
  - astro
  - hexo
  - migration
  - legacy-content
  - static-assets
  - content-schema
  - routing
  - search-xml
---

# Hexo 发布产物迁移到 Astro 时，分开建模内容、路由与静态资源

## Context

这次迁移不是把旧博客“换个主题”这么简单，而是把一个长期以 Hexo 发布产物形式保存的站点，重建成可继续演进的 Astro 研究站。真正的难点不在于把历史文章转成 Markdown，而在于迁移后同时满足两件事：

- 旧内容、旧链接和旧资源继续可用
- 新内容、新路由和新首页叙事可以独立增长

如果继续沿用发布产物时代的隐含假设，这类站点通常不会立刻编译失败，而是会在上线后慢慢暴露结构性退化：新文章写不进去、旧图加载失败、首页一直被历史内容占满，或者坏数据被静默吞掉。

## Guidance

把“生成产物仓”迁到 Astro 这类现代内容框架时，最容易漏掉的不是页面模板，而是三类边界：

1. `native` 内容与 `legacy` 内容是不是被同一套字段规则误伤
2. 旧文章引用的静态资源有没有随新构建一起发布
3. 迁移输入一旦异常，系统会不会直接暴露，而不是静默掩盖

这次迁移真正稳定下来，靠的是把这些边界拆成几个明确职责：`post-schema.ts` 处理内容约束，`sync-legacy-assets.mjs` 处理 year-directory 资源镜像，`extract-legacy.js` 处理 `search.xml` 的 fail-fast 解析，再用测试把这些规则固定住。

## Why This Matters

这类迁移最危险的地方，在于很多问题会“看起来没坏”，但实际上已经阻断了站点后续演进：

- 如果 `posts` schema 仍然要求 `legacyUrl` / `legacySlug`，未来的原生文章根本进不了集合
- 如果旧文章图片没有同步进新构建产物，legacy 页面虽然能打开，正文表达却已经残缺
- 如果 featured 逻辑默认偏向旧内容，新站首页会持续失去“代表现在的你在研究什么”的能力
- 如果坏 URL 被静默改写成默认日期，归档、排序和统计会被悄悄污染

这些都不是“上线后再补一点 CSS”能解决的问题。它们属于迁移策略本身的缺口，必须在站点重建阶段一次性定清边界。

## When to Apply

- 你在把 Hexo、Jekyll、WordPress 导出物或静态 HTML 仓迁移到 Astro 这类内容框架
- 站点需要同时承载历史文章和未来原生内容
- 旧文章依赖图片、附件或嵌入资源，不能只迁正文
- 迁移源数据可能不干净，必须优先暴露坏 URL、坏日期或坏 slug

## Examples

`postSchema` 只在 `source === "legacy"` 时要求 legacy 专用字段，让 native 内容可以正常进入集合。下面是关键约束的节选：

```ts
export const postSchema = z
  .object({
    legacyUrl: z.string().optional(),
    legacySlug: z.string().optional(),
    source: z.enum(["legacy", "native"]).default("native")
  })
  .superRefine((data, context) => {
    if (data.source === "legacy" && !data.legacyUrl) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["legacyUrl"], message: "legacy posts must define a legacyUrl" });
    }

    if (data.source === "legacy" && !data.legacySlug) {
      context.addIssue({ code: z.ZodIssueCode.custom, path: ["legacySlug"], message: "legacy posts must define a legacySlug" });
    }
  });
```

`sync-legacy-assets` 不是按文章粒度解析图片引用，而是把仓库根目录下所有年份目录里的非 HTML 文件整体镜像到 `public/`。这能保证 legacy 正文里相对路径引用的图片仍然可访问，也避免把资源同步变成手工步骤。

legacy URL 解析不要静默兜底，而是直接暴露坏输入：

```js
function extractDate(legacyUrl) {
  const match = legacyUrl.match(/^\/(\d{4})\/(\d{2})\/(\d{2})\//);

  if (!match) {
    throw new Error(`Invalid legacy URL: ${legacyUrl}`);
  }

  return `${match[1]}-${match[2]}-${match[3]}`;
}
```

最后，再用单测和 e2e 把这些边界钉住，而不是只验证首页能否打开。这里最值得固定的断言是：native 内容可以在没有 legacy metadata 的情况下通过 schema；invalid legacy URL 会直接抛错；legacy 路由与 taxonomy 路由在浏览器里仍然可访问。

## Related

- 需求文档：`docs/brainstorms/2026-04-14-astro-ai-research-site-requirements.md`
- 计划文档：`docs/plans/2026-04-14-001-feat-astro-ai-research-site-plan.md`
- 本次实现分支 PR：`feat: rebuild site as Astro research hub`（PR #1）
- 复用时的最小检查表：
  - 区分 `native` / `legacy` 内容 schema
  - 同步旧文章静态资源，而不是只迁正文
  - 对坏 URL、坏日期和坏 slug 使用 fail-fast
  - 验证 schema、legacy 路由、taxonomy 路由和静态资源可访问性
