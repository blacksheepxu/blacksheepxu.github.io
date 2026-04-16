---
title: fix: Correct sector signals and graph loading
type: fix
status: completed
date: 2026-04-16
origin: docs/plans/2026-04-16-001-feat-sector-command-theme-governance-plan.md
related:
  - docs/brainstorms/2026-04-15-strategy-interface-theme-requirements.md
  - docs/brainstorms/2026-04-16-theme-maintenance-governance-requirements.md
---

# fix: Correct sector signals and graph loading

## Overview

修复最近 code review 中暴露的两类问题：其一，`research` 与 `lab` 资产使用硬编码时间戳，导致战区热度、近期活跃度和时间推进都带有虚假信号；其二，多个 detail 页面在渲染时重复拉取整站内容并重建 sector graph，使简单页面渲染耦合到最重的聚合逻辑。目标是在不改变当前战区 UI 结构的前提下，让时间信号真实可信，并把 sector graph 的获取方式收束成共享、可缓存的入口。

## Problem Frame

当前 strategy 主题已经把首页和 `/sectors/[slug]/` 升级成战区总控与战区详情体验，但 review 发现其底层模型仍有两处结构性问题。第一，`src/lib/theme-sectors/sector-graph.ts` 将所有 `research` 与 `lab` 资产一律赋予 `2026-04-15` 的合成时间，这会永久放大战区热度和 recentActivity，甚至影响动态补位战区的选择（see origin: `docs/plans/2026-04-16-001-feat-sector-command-theme-governance-plan.md`). 第二，`ArticleShell`、研究详情页和实验详情页都通过整站内容重新构建 sector graph，只是为了拿到当前资产所属战区。这在当前内容量下还能工作，但已经和治理需求中“高风险区域应有更稳定、更可维护的数据入口”的方向冲突（see related: `docs/brainstorms/2026-04-16-theme-maintenance-governance-requirements.md`).

## Requirements Trace

- Preserve truthful sector heat and timeline semantics for all asset types.
- Ensure undated non-post assets do not fabricate recency.
- Reduce redundant whole-site graph recomputation in detail-page rendering paths.
- Keep current carrier routes, single content source, and strategy UI structure intact while fixing the model.

## Scope Boundaries

- 不重做首页或战区详情页的视觉布局。
- 不改变当前固定核心战区、动态补位或战区命名策略。
- 不在本次计划中解决更广义的“第三主题如何接入 UI gating”问题。
- 不引入新的可视化库或客户端状态管理框架。

## Context & Research

### Relevant Code and Patterns

- `src/content.config.ts` 当前对 `research` 和 `lab` 只有 `status`、`featured`、`order` 等字段，没有可表达真实更新时间的字段。
- `src/lib/theme-sectors/sector-graph.ts` 在 `buildResearchAsset` 与 `buildLabAsset` 中写死 `pubDate: new Date("2026-04-15")`，直接制造了虚假时间信号。
- `src/components/site/ArticleShell.astro`、`src/pages/research/[slug].astro`、`src/pages/lab/[slug].astro` 都在渲染时再次拉取 posts / research / lab 并调用 `buildSectorGraph(...)`。
- `tests/unit/theme-sectors.test.ts` 已经提供 sector graph 的纯单测入口，适合继续扩展时间语义测试。
- `tests/unit/content/content-schema.test.ts` 当前只覆盖 posts schema，说明如果要把 research/lab 时间字段变成稳定契约，最好先把对应 schema 抽取成可测试形式。

### Institutional Learnings

- `docs/solutions/workflow-issues/hexo-to-astro-content-migration-workflow-2026-04-14.md` 强调内容 schema 与展示逻辑要分开建模，并优先保证单一内容事实。这意味着修复时间信号时，应该给 shared content model 增加明确字段，而不是继续依靠 UI 层猜测或硬编码。

### External References

- None. 这次修复完全建立在当前 Astro 内容模型和已有 unit/e2e 测试模式之上。

## Key Technical Decisions

- **Introduce an explicit timestamp field for non-post assets**: `research` 和 `lab` 需要拥有自己的时间信号来源，而不是借用合成日期。建议使用可选的 `updatedAt` 字段，因为它比 `pubDate` 更符合“研究条目 / 实验入口持续演化”的语义。
- **Treat missing timestamps as “undated”, not “recent”**: 对于没有 `updatedAt` 的 non-post 资产，仍允许它们进入战区资产集合，但它们不参与 recency/heat 的近期部分，也不应在 timeline 中伪装成最近更新。
- **Expose a cached `getSectorGraph()` helper**: 把整站 graph 计算提升为共享 promise/cache 入口，页面只消费结果，不各自重建。

## Open Questions

### Resolved During Planning

- `research` / `lab` 是否继续使用硬编码时间：否，改为显式字段 + 无值时不参与近期信号。
- detail 页是否继续各自拉全量内容重建 graph：否，改为共享缓存入口。

### Deferred to Implementation

- `updatedAt` 是否需要在所有现有 research/lab 条目中强制补齐，还是先允许部分条目保持 undated，可在执行时根据 UI 观感与内容量决定。
- undated 资产在 timeline 视图中的最终展示文案（例如 `Undated` / `长期条目` / 直接不显示日期）可在实现时根据页面风格微调。

## Implementation Units

- [x] **Unit 1: Add explicit timestamps for research and lab content**

**Goal:** 为 non-post 资产提供真实且可维护的时间信号来源。

**Requirements:** truthful sector heat and timeline semantics; single content source remains intact

**Dependencies:** None

**Files:**
- Create: `src/lib/content/entry-schemas.ts`
- Modify: `src/content.config.ts`
- Modify: `src/content/research/ai-research-station.mdx`
- Modify: `src/content/lab/research-cadence-demo.mdx`
- Modify: `src/pages/update/index.astro`
- Modify: `tests/unit/content/content-schema.test.ts`

**Approach:**
- 将 `research` / `lab` schema 抽出成可单测的共享 schema 定义。
- 为这两类条目增加可选 `updatedAt` 字段，并在现有内容中给出至少一组真实时间样本。
- 同步更新 `/update` 中的模板与维护说明，确保后续内容维护者知道何时填写该字段。

**Execution note:** 先补 schema 级断言，再改内容模型。

**Patterns to follow:**
- `src/lib/content/post-schema.ts`
- `tests/unit/content/content-schema.test.ts`
- `src/pages/update/index.astro`

**Test files:**
- `tests/unit/content/content-schema.test.ts`

**Test scenarios:**
- Happy path: `research` 条目定义 `updatedAt` 时能通过 schema。
- Happy path: `lab` 条目定义 `updatedAt` 时能通过 schema。
- Edge case: `research` / `lab` 条目未定义 `updatedAt` 时仍可通过 schema，以保持向后兼容。
- Error path: 非法日期字符串传入 `updatedAt` 时被 schema 拒绝。

**Verification:**
- `research` / `lab` 内容模型拥有明确的时间字段来源。
- `/update` 模板与维护入口同步反映新字段要求。

- [x] **Unit 2: Make sector graph recency logic truthful and robust**

**Goal:** 让 sector heat、recentActivity 和 timeline 排序反映真实时间，而不是合成信号。

**Requirements:** truthful sector heat and timeline semantics

**Dependencies:** Unit 1

**Files:**
- Modify: `src/lib/theme-sectors/sector-graph.ts`
- Modify: `src/components/sectors/SectorTimelineView.astro`
- Modify: `src/components/sectors/SectorOverviewPanel.astro`
- Modify: `tests/unit/theme-sectors.test.ts`
- Modify: `tests/e2e/sectors.spec.ts`

**Approach:**
- 将 sector asset 的时间字段从“总是存在的 `pubDate`”调整为对不同资产类型更真实的语义。
- posts 继续使用 `pubDate`；research / lab 优先使用 `updatedAt`；无时间值的资产只计入规模，不计入近期信号。
- timeline 视图需要处理 undated 资产，避免出现误导性的“最近更新”排序。

**Patterns to follow:**
- `src/lib/theme-sectors/sector-graph.ts`
- `tests/unit/theme-sectors.test.ts`

**Test files:**
- `tests/unit/theme-sectors.test.ts`
- `tests/e2e/sectors.spec.ts`

**Test scenarios:**
- Happy path: dated `research` / `lab` 资产会影响 recentActivity 与 heat。
- Edge case: undated `research` / `lab` 资产仍出现在资产部署视图，但不增加 recentActivity。
- Edge case: 动态补位位点不会因为 undated non-post 资产而被错误抬高。
- Integration: sector detail timeline 在存在 undated 资产时仍能稳定渲染，不出现排序错乱或误导性最近日期。

**Verification:**
- sector graph 的近期信号不再依赖硬编码日期。
- timeline 与热度展示能区分“有真实时间信号”和“只有长期存在”的资产。

- [x] **Unit 3: Centralize and cache sector graph loading across page renders**

**Goal:** 去掉 detail 页和 carrier 页各自重建 graph 的模式，让 sector context 走统一入口。

**Requirements:** reduce redundant whole-site graph recomputation; high-risk pages get more stable data access

**Dependencies:** Unit 2

**Files:**
- Create: `src/lib/theme-sectors/get-sector-graph.ts`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/sectors/[slug].astro`
- Modify: `src/components/site/ArticleShell.astro`
- Modify: `src/pages/research/[slug].astro`
- Modify: `src/pages/lab/[slug].astro`
- Modify: `src/pages/blog/index.astro`
- Modify: `src/pages/research/index.astro`
- Modify: `src/pages/lab/index.astro`
- Modify: `tests/e2e/theme.spec.ts`
- Modify: `tests/e2e/routes.spec.ts`

**Approach:**
- 新增一个共享的 graph loader，内部负责 collection 获取与 module-level caching。
- 所有需要 sector context 的页面只依赖这个 helper，而不是自行拉取全量内容。
- 统一 helper 也为后续 theme governance 中的“高风险区域”提供单一数据入口。

**Patterns to follow:**
- `src/lib/content/posts.ts`
- `src/lib/theme-sectors/sector-presenters.ts`
- `src/components/site/ArticleShell.astro`

**Test files:**
- `tests/e2e/theme.spec.ts`
- `tests/e2e/routes.spec.ts`

**Test scenarios:**
- Happy path: homepage、sector route 和 detail pages 仍然能拿到正确的 sector context。
- Integration: 从首页进入 sector route，再进入 asset detail 时，sector context 不回归。
- Edge case: 如果某个页面只需要当前资产所属战区，不再重复触发新的全量 graph rebuild 逻辑路径。

**Verification:**
- 不再存在多个页面各自拉全量 collections 并直接调用 `buildSectorGraph(...)` 的模式。
- sector context 的获取方式集中到共享 helper 中。

## System-Wide Impact

- **Data model:** `research` / `lab` 将拥有显式时间字段；这会影响 sector graph、timeline 展示和未来内容更新模板。
- **State lifecycle risks:** 本次不增加新的持久化状态，但会改变 dynamic sector 与 heat 的计算来源，需要避免时间字段缺失时出现误导性提升。
- **Integration coverage:** 需要同时验证 schema、纯 graph 逻辑和页面级战区语义，单一层级测试不足以覆盖回归风险。
- **Unchanged invariants:** 默认主题 UI、固定核心战区结构、carrier route 路径、单一内容事实与现有浏览器覆盖矩阵保持不变。

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| 为 `research` / `lab` 加时间字段后，旧内容维护成本上升 | 字段保持可选，并在 `/update` 中明确填写建议 |
| undated 资产从 recentActivity 中移除后，战区热度视觉上显著变化 | 先用 unit + e2e 固定语义，再在实现中做轻量文案补偿 |
| 缓存 helper 设计不当，导致构建时拿到陈旧数据 | 使用单次构建生命周期内的 promise cache，而不是跨进程持久缓存 |

## Documentation / Operational Notes

- 完成后应在 `docs/theme-maintenance.md` 和 `/update` 中明确：`research` / `lab` 若希望参与“近期活跃”信号，需要提供 `updatedAt`。
- 这是一份 follow-up fix 计划，意在收敛 review 暴露的模型债务，而不是开启下一轮大布局重构。

## Sources & References

- Origin plan: `docs/plans/2026-04-16-001-feat-sector-command-theme-governance-plan.md`
- Related requirements: `docs/brainstorms/2026-04-15-strategy-interface-theme-requirements.md`
- Related governance doc: `docs/brainstorms/2026-04-16-theme-maintenance-governance-requirements.md`
- Related code: `src/lib/theme-sectors/sector-graph.ts`
- Related code: `src/components/site/ArticleShell.astro`
- Related code: `src/pages/research/[slug].astro`
- Related code: `src/pages/lab/[slug].astro`
- Related tests: `tests/unit/theme-sectors.test.ts`
- Related tests: `tests/e2e/sectors.spec.ts`
