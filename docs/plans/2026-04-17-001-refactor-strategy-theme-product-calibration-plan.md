---
title: refactor: recalibrate strategy theme product hierarchy
type: refactor
status: completed
date: 2026-04-17
origin: docs/brainstorms/2026-04-17-strategy-theme-product-calibration-requirements.md
related:
  - docs/brainstorms/2026-04-14-astro-ai-research-site-requirements.md
  - docs/brainstorms/2026-04-15-strategy-interface-theme-requirements.md
  - docs/plans/2026-04-15-001-feat-strategy-interface-theme-plan.md
  - docs/plans/2026-04-16-004-feat-sector-map-coordinate-ui-plan.md
  - docs/theme-maintenance.md
---

# refactor: recalibrate strategy theme product hierarchy

## Overview

将策略主题从“越来越强的游戏化壳层”重新校准成“研究网站的专家操作视角”。这一轮不是继续加码地图、扫描盘或战区文案，而是修正更底层的产品层级问题：默认主题与策略主题的职责边界、频道导航与战区心智的冲突、策略首页对协议式说明的依赖，以及 `research` / `lab` 在当前真实内容密度下是否被包上了过厚的指挥界面。

## Problem Frame

原始站点目标是一个首先服务你自己的个人 AI 研究网站（see origin: `docs/brainstorms/2026-04-17-strategy-theme-product-calibration-requirements.md`; see related: `docs/brainstorms/2026-04-14-astro-ai-research-site-requirements.md`）。策略主题后来被重定向为“内容资产指挥中心”，这个方向本身成立，但当前实现已经出现三类产品性偏差：

1. 策略主题拥有整站最强的叙事和交互层，默认主题开始显得像基础版。
2. 策略首页已经是战区优先，但全局导航仍然是频道优先，导致用户在同一主题中面对两套信息架构。
3. 当前内容密度仍然偏薄，`src/content/research/` 和 `src/content/lab/` 目前都只有 1 个核心 entry，而策略主题已经在 carrier pages 上承载较重的系统语义。

这份计划的目标是做一次结构性校准：保住策略主题已经建立起来的游戏化识别度，但不让它继续脱离“真实研究网站”的产品重心。

## Requirements Trace

- **Theme roles remain distinct and comprehensible** — R1-R3: 默认主题继续承担研究网站基本盘；策略主题是专家视角，不是隐性主产品。
- **Strategy IA aligns with sector-first mental model** — R4-R6: 全局 wayfinding、首页交互和频道路由要减少彼此冲突。
- **Command surface scales with real content density** — R7-R9: research / lab / detail pages 需要进入明确的强弱分层，而不是统一堆重。
- **Clarity outranks extra spectacle** — R10-R12: 交互应越来越不需要解释自己，且始终保留快速进入真实内容的路径。

## Scope Boundaries

- 不移除默认主题，不把策略主题升级为唯一入口。
- 不推翻现有首页战区地图与 `/sectors/[slug]/` 的核心结构。
- 不增加任何积分、等级、任务链或显式 gamification 系统。
- 不一次性重写整站 URL 或废弃 `blog` / `research` / `lab` 路由。
- 不把这轮校准建立在“先补很多新内容”这个前提上。

## Context & Research

### Relevant Code and Patterns

- `src/layouts/BaseLayout.astro` 和 `src/components/site/Header.astro` 控制全站共享 shell、导航和主题切换；当前这里仍然是频道优先导航，是策略心智冲突的主来源。
- `src/pages/index.astro` 同时渲染默认内容首页和 `src/components/home/HomeCommandViews.astro`，说明策略主题目前更像叠加层，而不是独立 IA。
- `src/components/home/HomeCommandViews.astro`、`src/components/home/SectorCommandNetwork.astro`、`src/components/home/SectorInspectorPanel.astro` 组成策略首页完整链路，其中 `sector-command__protocol` 代表当前仍依赖说明文案引导用户操作。
- `src/components/sectors/SectorModeSwitcher.astro` 是当前最完整、最稳的 sector-first 交互模式：总览 -> 资产部署 -> 时间推进。
- `src/components/research/ResearchModeSwitcher.astro` 与 `src/components/research/ResearchMapView.astro` 已经拥有较强 command 语义，但 `src/content/research/ai-research-station.mdx` 说明目前 research 实际只有 1 个核心条目。
- `src/pages/lab/index.astro` 目前主要仍是 channel hero + card list，语气已经转向 carrier，但 command 语义还没有和 research / sectors 形成稳定分层。
- `src/components/site/ArticleShell.astro`、`src/components/site/EntryDetailShell.astro` 代表策略主题在叶子页上的 dossier 语气，是把“阅读优先”与“command context”做兼容的主要入口。
- `tests/e2e/theme.spec.ts`、`tests/e2e/sectors.spec.ts`、`tests/e2e/lab.spec.ts`、`tests/e2e/routes.spec.ts`、`tests/e2e/theme-governance.spec.ts` 是这轮回归保护的主测试面。

### Institutional Learnings

- `docs/theme-maintenance.md` 已经把首页战区地图、共享壳层和多主题变更视为长期契约；这轮校准应延续“共享 shell 变更默认补 Playwright 断言”的治理方式。
- 当前没有更直接的 `docs/solutions/` 经验文档覆盖“多主题产品层级校准”问题，因此这次计划需要把产品判断显式写入治理与检查清单，而不是只留在讨论中。

### External References

- None. 当前问题主要是本站的产品层级与信息架构校准，不依赖外部框架最佳实践来决定方向。

## Key Technical Decisions

- **Use a tiered strategy-surface model instead of one command UI intensity everywhere**: 首页和战区页继续承担完整指挥语义；carrier index pages 采用紧凑 briefing / sub-map；detail pages 保持阅读优先的 dossier shell。
- **Resolve shell-level semantic conflict before adding more spectacle**: 共享导航和 wayfinding 必须先对齐战区心智，否则后续任何更强视觉都会继续放大冲突。
- **Treat current content density as a first-class product constraint**: research 和 lab 的 strategy surface 需要承认当前内容规模，而不是假装它们已经具备战区级复杂度。
- **Replace instruction copy with interaction affordances where possible**: 协议文案不应再成为核心交互的必要说明，后续优先用 CTA、焦点状态和 route cue 来表达下一步。
- **Keep route structure and content facts stable**: 这轮只校准语义和层级，不另起新路由体系，不引入新的伪信号模型。

## Open Questions

### Resolved During Planning

- 策略主题是否应取代默认主题作为主产品：否。
- 频道路由是否应被废弃：否，继续保留，但在策略主题下调整其角色表达。
- 是否必须等研究 / 实验内容扩充后再做校准：否，校准本身就是为当前内容密度服务。

### Deferred to Implementation

- strategy mode 顶部导航最终采用“新增战区入口 + 保留频道路由”还是“强调当前 command surface”的哪种组合，需要在实现时结合真实页面密度定稿。
- `src/pages/lab/index.astro` 是否需要像 research 一样引入紧凑 sub-map，还是更适合维持较轻的 carrier briefing，需要根据实际视觉验收决定。
- detail pages 上的 sector context 最终更适合 route panel、breadcrumb 强化，还是 compact dossier meta，需要在不伤阅读体验的前提下试装确认。

## High-Level Technical Design

> *This illustrates the intended approach and is directional guidance for review, not implementation specification. The implementing agent should treat it as context, not code to reproduce.*

| Theme capability | Page type | Target surface | Primary job |
|---|---|---|---|
| `content` | any | research website content shell | 浏览、阅读、沉淀 |
| `command` | homepage / sector pages | full command deck | 判断战区态势与调度方向 |
| `command` | `research` / `lab` index pages | compact carrier briefing or sub-map | 理解载体角色，不夸大系统规模 |
| `command` | article / research / lab detail pages | dossier shell with compact command context | 阅读具体资产，同时保留战区归属感 |

## Implementation Units

- [x] **Unit 1: Align shared shell and navigation with strategy role**

**Goal:** 让共享 shell 在策略主题下不再与战区优先叙事冲突。

**Requirements:** R1, R2, R3, R4, R6

**Dependencies:** None

**Files:**
- Modify: `src/layouts/BaseLayout.astro`
- Modify: `src/components/site/Header.astro`
- Modify: `src/lib/theme/theme-registry.ts`
- Modify: `src/data/site.ts`
- Test: `tests/e2e/theme.spec.ts`
- Test: `tests/e2e/routes.spec.ts`

**Approach:**
- 为 strategy mode 引入更明确的 theme-role / command-surface wayfinding，而不是只保留统一频道导航。
- 保持 `blog` / `research` / `lab` 路由入口可达，但降低它们在 strategy shell 中与“战区总控”竞争顶层心智的程度。
- 确保 theme toggle 继续传达“模式切换”而不是“切换到另一个站点”。

**Patterns to follow:**
- `src/layouts/BaseLayout.astro`
- `src/components/site/Header.astro`
- `src/components/sectors/SectorModeSwitcher.astro` 中已有的 command path 表达

**Test scenarios:**
- Happy path: 在 strategy mode 下，全局壳层会暴露更明确的战区优先 cue，同时仍可进入 `blog`、`research`、`lab`。
- Happy path: 在 default mode 下，现有频道优先导航与主题切换行为保持稳定。
- Edge case: 从深层页面切换主题并刷新后，当前路由仍保持正确高亮与可识别 path context。
- Integration: 在 `/research`、`/lab`、`/sectors/[slug]` 等页面切换主题时，不会丢失当前页面且壳层语义同步变化。

**Verification:**
- 共享 header 与 theme toggle 不再持续讲述与策略首页相反的产品故事。

- [x] **Unit 2: Rebalance the homepage command deck around intuitive sector selection**

**Goal:** 让首页 strategy flow 不再依赖协议式说明文案，也能自然推进到“选战区 -> 看简报 -> 进入战区”。

**Requirements:** R4, R5, R8, R10, R11

**Dependencies:** Unit 1

**Files:**
- Modify: `src/components/home/HomeCommandViews.astro`
- Modify: `src/components/home/SectorCommandNetwork.astro`
- Modify: `src/components/home/SectorInspectorPanel.astro`
- Modify: `src/styles/global.css`
- Test: `tests/e2e/theme.spec.ts`
- Test: `tests/e2e/sectors.spec.ts`

**Approach:**
- 收缩或移除首页当前 `sector-command__protocol` 这类教学式块，改用更直接的焦点反馈、按钮层级和 inspector CTA 表达下一步。
- 让首页主舞台与情报面板之间的主从关系更清楚，保证“地图是主角、进入战区是明确动作、协议文案不是必需品”。
- 保持首页不直跳资产详情的现有边界，继续把“战区页”作为下一步。

**Patterns to follow:**
- `src/components/home/HomeCommandViews.astro`
- `src/components/home/SectorInspectorPanel.astro`
- 现有 strategy homepage 的 focus shell 行为

**Test scenarios:**
- Happy path: strategy 首页仍默认聚焦当前主战区，并且主 CTA 可以直接进入战区页。
- Happy path: 切换不同战区节点时，inspector 内容仍然联动且不会丢失全局上下文。
- Edge case: 在移除或弱化协议块后，首页仍保留清晰的下一步动作，不出现“只剩氛围、没有路由”的状态。
- Integration: 首页仍然不会重新引入直接跳资产详情的捷径，保持 sector-first 导航链路。

**Verification:**
- 首次看到 strategy 首页的用户，不需要阅读三步说明也能知道应该先点哪里。

- [x] **Unit 3: Apply density-aware command surfaces to research and lab carriers**

**Goal:** 让 `research` 与 `lab` 在 strategy mode 下的界面强度与真实内容密度匹配。

**Requirements:** R6, R7, R8, R9, R11

**Dependencies:** Unit 1

**Files:**
- Modify: `src/pages/research/index.astro`
- Modify: `src/components/research/ResearchModeSwitcher.astro`
- Modify: `src/components/research/ResearchMapView.astro`
- Modify: `src/components/research/ResearchArchiveView.astro`
- Modify: `src/pages/lab/index.astro`
- Modify: `src/components/site/ChannelHero.astro`
- Test: `tests/e2e/theme.spec.ts`
- Test: `tests/e2e/lab.spec.ts`

**Approach:**
- 将 research 和 lab 明确视为“carrier surfaces”，而不是都去追求完整 command theater。
- 对 research 保留已经建立起来的扫描盘语气，但把它明确定位为紧凑子地图 / 主卷宗入口，而不是更大系统的伪预演。
- 对 lab 评估是否需要更轻的 briefing shell，让其更诚实地承接“交互表达载体”角色。
- 通过 copy、layout density 和 CTA hierarchy 明确这些页面是在承接某个主题战区，而不是单独构成完整游戏层。

**Patterns to follow:**
- `src/components/sectors/SectorModeSwitcher.astro`
- `src/components/research/ResearchModeSwitcher.astro`
- `src/pages/lab/index.astro`

**Test scenarios:**
- Happy path: strategy research 页仍可切换地图 / 档案 / 轨迹，并且地图语气与当前 research 内容规模相匹配。
- Happy path: strategy lab 页继续服务于 carrier 角色，不会在只有极少实验条目时表现得像大型实验中控区。
- Edge case: 当 research 或 lab 只有 1 个核心条目时，页面仍然显得完整而诚实，不会因为缺少节点而显得空洞或过度夸大。
- Integration: research 和 lab 入口仍能正确跳入各自详情页，并保持 strategy route context。

**Verification:**
- `research` 和 `lab` 在 strategy mode 下不再比真实内容本身更重、更厚。

- [x] **Unit 4: Carry compact command context into detail shells without hurting reading**

**Goal:** 让 strategy theme 在叶子页上保持一致语义，但不压过正文阅读。

**Requirements:** R3, R9, R10, R11

**Dependencies:** Unit 1

**Files:**
- Modify: `src/components/site/ArticleShell.astro`
- Modify: `src/components/site/EntryDetailShell.astro`
- Modify: `src/pages/research/[slug].astro`
- Modify: `src/pages/lab/[slug].astro`
- Test: `tests/e2e/theme.spec.ts`
- Test: `tests/e2e/routes.spec.ts`

**Approach:**
- 让 detail pages 明确落在“阅读优先 dossier shell”层级，而不是继续漂在 command / content 中间态。
- 用 compact route panel、related sector context、carrier role meta 等轻量方式保留 command 语义，不把 full command deck 带进正文页。
- 兼顾 legacy post 与 native entry 两类 detail shell，避免只在部分内容类型上成立。

**Patterns to follow:**
- `src/components/site/ArticleShell.astro`
- `src/components/site/EntryDetailShell.astro`
- 现有 dossier / route panel / sector context 模式

**Test scenarios:**
- Happy path: strategy mode 下的文章、研究详情和实验详情都能看见清晰但轻量的 sector/carrier context。
- Edge case: legacy post 与原生 research / lab entry 的 strategy shell 语义保持等价，不出现一类内容有 command context、另一类完全没有的断裂。
- Integration: 从 sector、research、lab 页面进入 detail page 后，用户仍能理解自己来自哪个 carrier / sector，不会失去上层态势感。

**Verification:**
- strategy 语义可以延伸到 detail 层，但不会牺牲正文可读性和快速进入内容的能力。

- [x] **Unit 5: Lock product calibration rules into governance and regression coverage**

**Goal:** 把这次校准沉淀成长期约束，避免后续视觉迭代再次偏回“更炫但更失真”。

**Requirements:** R1-R12

**Dependencies:** Unit 1, Unit 2, Unit 3, Unit 4

**Files:**
- Modify: `docs/theme-maintenance.md`
- Modify: `docs/checklists/theme-code-change-checklist.md`
- Modify: `docs/checklists/theme-content-update-checklist.md`
- Modify: `tests/e2e/theme-governance.spec.ts`
- Modify: `tests/e2e/theme.spec.ts`
- Modify: `tests/e2e/lab.spec.ts`

**Approach:**
- 将“默认主题是主产品、strategy 是专家视角”“内容密度约束界面强度”“共享导航不得持续和战区心智冲突”等规则写进治理文档。
- 为共享壳层、首页 strategy flow、research / lab carrier density honesty、detail route context 增加浏览器回归保护。
- 让未来的视觉修改必须同时回答产品层级问题，而不是只回答“更不像游戏还是更像游戏”。

**Patterns to follow:**
- `docs/theme-maintenance.md`
- `tests/e2e/theme-governance.spec.ts`
- 现有多主题 Playwright 回归覆盖方式

**Test scenarios:**
- Happy path: strategy shell 的全局 wayfinding、首页 flow、research / lab carrier 层级都拥有持续可执行的断言。
- Integration: 改动共享 header、theme toggle、homepage command deck 时，能通过 e2e 发现再次出现的产品层级回归。
- Edge case: 内容数量仍然稀薄时，strategy 页面对 density honesty 的规则不会被新视觉改动绕过。

**Verification:**
- 这轮校准会成为文档和测试共同约束的长期产品契约，而不是一次性的口头判断。

## System-Wide Impact

- **Interaction graph:** 共享壳层、首页 command deck、carrier index pages 和 detail shells 都会被纳入同一套“surface tier”语义中；这会影响 theme toggle 后的全站感知一致性。
- **Error propagation:** 本轮主要是界面层与文案层重排，没有新增外部 I/O 或数据写入路径，主要风险来自交互断链与语义不一致，而不是运行时错误传播。
- **State lifecycle risks:** 主题切换仍依赖 `localStorage` 中的主题状态，任何 shared shell 改动都需要保证切换后当前路径和当前主题能力标识仍稳定。
- **API surface parity:** 既有 `blog` / `research` / `lab` / `sectors/[slug]` 路由继续保留；校准不应让已有入口失效。
- **Integration coverage:** 首页战区 -> 战区页 -> carrier page -> detail page 的链路需要用浏览器测试覆盖，单测不足以证明语义层级已对齐。
- **Unchanged invariants:** 默认主题的研究网站角色、现有 sector graph 事实来源、稳定频道路由和首页地图基础表达都保持不变；本计划只校准层级、语义和入口组织。

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| 过度校准导致策略主题失去已经建立起来的游戏化记忆点 | 只削弱语义冲突和过度承诺，不回退首页地图与战区节奏本身 |
| strategy-aware 导航改动让现有用户短期迷失 | 采用增量式 wayfinding，加强战区 cue，而不是直接删除频道路由 |
| 内容密度规则写得太死，未来内容扩张后又需要大改 | 采用粗粒度的 page-tier 模型，而不是基于精确数量写死视觉规则 |
| detail shell 为了保留 strategy 语义又重新压过正文阅读 | 明确将 detail pages 归类为“阅读优先 dossier shell”，并为其加专门的阅读回归断言 |

## Documentation / Operational Notes

- 这轮实现完成后，应更新 `docs/theme-maintenance.md` 与两份 checklist，使未来在做策略主题视觉迭代时默认先检查产品层级是否失真。
- 视觉验收不应只看“像不像游戏”，还应明确回答“它是否仍然像一个真实研究网站的专家视角”。

## Sources & References

- **Origin document:** `docs/brainstorms/2026-04-17-strategy-theme-product-calibration-requirements.md`
- Related requirements: `docs/brainstorms/2026-04-14-astro-ai-research-site-requirements.md`
- Related requirements: `docs/brainstorms/2026-04-15-strategy-interface-theme-requirements.md`
- Related plan: `docs/plans/2026-04-15-001-feat-strategy-interface-theme-plan.md`
- Related plan: `docs/plans/2026-04-16-004-feat-sector-map-coordinate-ui-plan.md`
- Governance: `docs/theme-maintenance.md`
