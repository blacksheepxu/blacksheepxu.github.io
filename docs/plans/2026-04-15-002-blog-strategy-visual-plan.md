---
title: design: Blog strategy-theme visual plan
type: design
status: archived
date: 2026-04-15
related:
  - docs/brainstorms/2026-04-15-strategy-interface-theme-requirements.md
  - docs/plans/2026-04-15-001-feat-strategy-interface-theme-plan.md
superseded_by: docs/plans/2026-04-17-001-refactor-strategy-theme-product-calibration-plan.md
---

# design: Blog strategy-theme visual plan

> Historical note: this blog-focused visual refinement doc is no longer the recommended execution source. Its useful visual ideas have been absorbed into the shipped strategy surfaces and the later product-calibration work.

## Why This Exists

首页和研究页的策略主题已经进入“战术终端”阶段，但博客频道仍然主要停留在“统一壳层 + 归档卡片”的完成度。它已经不脱节，却还没有形成与博客内容属性相匹配的强记忆点。

这一份方案的目标不是把博客做成和首页、研究页同级的交互系统，而是在不损害阅读体验的前提下，把博客频道升级成更明确的“情报档案库 / 作战记录库”。

## Context Mode

- Mode: Existing system
- Existing signals:
  - `src/styles/global.css` 已有完整主题 token 与策略主题视觉语言
  - `src/pages/blog/index.astro` 已有 `archive-hero`、`archive-grid` 与指标区
  - `src/components/site/TaxonomyPage.astro` 已有频道级 hero + 归档网格
  - `src/components/site/ArticleShell.astro` 已有详情 hero、brief、taxonomy 区与正文容器
  - 首页与研究页已经确立“战术终端 / 卷宗 / 扇区”语言
- Implication:
  - 博客视觉方案应复用现有 token、栅格、hero、chip、panel 和 motion 体系
  - 不引入第三套审美，不回退成普通内容站，也不做赛博朋克霓虹 HUD

## Pre-Build Planning

### Visual Thesis

博客频道在策略主题下应呈现为“情报档案库”：像一面记录长期行动日志的战情墙，强调卷宗编号、来源、优先级与阅读路径，而不是普通文章列表。

### Content Plan

1. 博客首页首屏：频道身份、当前归档状态、主要筛选入口、一个显著的情报总览区
2. 博客首页正文：由纯文章网格转为“主档案列 + 次级档案列”或“重点卷宗 + 全量档案”结构
3. Taxonomy 页：从“相关内容列表”升级为“单主题分卷档案页”
4. 文章详情：首屏继续克制，但要更像“卷宗封面 + 阅读指令”，正文区保持稳定可读

### Interaction Plan

1. 首屏情报总览区加入轻量扫描线与编号标签，让频道识别更强
2. 档案卡 hover 时突出“卷宗锁定”感，而不是普通卡片抬升
3. 详情页 taxonomy / brief 区在策略主题下加入更明确的卷宗边界与状态高亮，但正文滚动行为保持安静

## Design Direction

### 1. Blog Index

#### Current Read

- 当前问题不是信息缺失，而是首屏和列表都过于平均
- `archive-hero` 与下面的 `archive-grid` 之间没有明确主次
- 所有文章卡权重接近，导致“博客频道为什么值得看”不够突出

#### Proposed Direction

- 把博客首页定义为“写作情报总库”，而不是“全部文章页”
- 首屏保留频道 hero，但加入一个更强的“Archive Status / Reading Routes / Current Focus”区块
- 列表区不再让所有文章权重相同，而是分成两层：
  - 一层是“重点卷宗”或“最新情报”
  - 一层是“全量归档”

#### Hero Composition

- 左侧:
  - 频道标题
  - 一句更明确的角色说明，例如“研究日志、归档旧文与原生笔记都在这里入库”
  - 高价值 taxonomy chip
- 右侧:
  - 现有指标区继续保留
  - 但改成更像“Archive Status Board”，不是普通数字卡
- Hero 下方新增一条横向 briefing:
  - 当前写作状态
  - 原生 / legacy 比例
  - 最近更新时间
  - 建议阅读路径

#### Body Composition

- Option A:
  - 上方一行 `Priority Dossiers`
  - 下方一块 `All Records`
- Option B:
  - 左列 `Priority Dossiers`
  - 右列 `Record Feed`
- 推荐 Option A:
  - 更适合当前博客条目较少
  - 对移动端更友好
  - 实现复杂度更低

#### Card Language

- 重点卷宗卡:
  - 更大的标题、更明显的卷宗编号和来源标签
  - 可以显示“为什么先看”的一句短解释
- 全量档案卡:
  - 保持现有摘要密度
  - 但要加入更明确的来源、日期、分类层次
- 视觉上区分:
  - `Native Note` 更偏现役记录
  - `Legacy Entry` 更偏归档文献

### 2. Taxonomy Page

#### Current Read

- 现在 taxonomy 页是“频道 hero + 相关内容列表”
- 它可用，但还没有“这是单主题卷宗”的感觉

#### Proposed Direction

- 将 taxonomy 页定义成“主题分卷页”
- 页面首屏突出三件事:
  - 这个主题是什么
  - 它在博客体系里的权重
  - 从哪里继续往下读

#### Composition

- Hero 里除现有 metrics 外，加入一个小型主题定位块:
  - `Theme Role`
  - `Recent Activity`
  - `Related Routes`
- 列表区可以维持现有 `archive-grid`
- 但视觉上需要更像“同一主题下的档案批次”，比如:
  - 编号更连续
  - 标签更克制
  - 卡片 source 语义更强

### 3. Article Detail

#### Current Read

- 当前详情页已经守住了阅读性，这是对的
- 但首屏仍偏“文章页标准头图 + metadata”
- 它缺少一点“卷宗封面”的进入仪式

#### Proposed Direction

- 详情页继续保持克制，不引入复杂交互
- 重点强化 hero 与 brief 的“封面”感，而不是正文花哨化

#### Hero Structure

- 左侧:
  - 面包屑
  - 主题标签
  - 标题
  - 一句简洁 summary
- 右侧:
  - `Article Brief` 改得更像卷宗信息面板
  - 强调：
    - 发布日期
    - 阅读时长
    - 来源状态
    - 研究主题
- Hero 底部 taxonomy:
  - 改成“关联路径”而不是单纯标签堆叠

#### Body Rules

- 正文区继续把可读性放在第一位
- 不增加大型背景纹理
- 不引入影响阅读节奏的浮层或 sticky inspector
- 代码块、表格、公式继续保持高对比清晰度

## Visual Details

### Tone

- 关键词:
  - 情报库
  - 作战记录
  - 卷宗封面
  - 长期归档
- 避免:
  - 霓虹 HUD
  - 过多警报红
  - 满屏状态徽章
  - 拟真军事风

### Typography

- 保持现有 display + body + mono 三层关系
- 博客首页和 taxonomy 页标题可以再强调“档案标题”感
- 详情页标题不需要继续加戏，维持当前阅读优先的尺度

### Color Usage

- 延续现有深色战术主题
- 博客频道建议更强调琥珀色作为“档案 / 文献”信号
- 青绿色继续作为系统反馈色，不要与琥珀抢主导

### Motion

- 首屏 briefing 区块轻量浮入
- 卡片 hover 更像“锁定卷宗”
- taxonomy chip hover 用颜色切换，不做夸张位移

## Copy Guidance

- 博客首页文案应更明确说明“这里是写作档案库”
- 避免继续使用过于泛的“这里更像研究目录”式表述
- 更好的方向:
  - “原生笔记、迁移旧文和研究日志都在这里归档”
  - “先看重点卷宗，再进入完整档案”
  - “按主题、来源和时间继续推进阅读”

## Recommended Scope For Next Implementation

### Must Do

- 重构 `/blog` 首屏与列表主次关系
- 让 taxonomy 页具有明确的“分卷”感
- 强化文章详情 hero 的卷宗信息面板

### Nice To Have

- 为 blog index 增加一个“建议阅读路径”条
- 为 legacy / native 内容增加更细的视觉区分
- 为 taxonomy 页增加主题角色说明

### Not For This Pass

- 不为博客增加像首页/研究页那样的多视图切换
- 不做复杂筛选器
- 不做客户端排序或搜索系统
- 不在正文中加入花哨装饰

## Acceptance Checks

- 博客首页首屏是否一眼能看出“写作档案库”而不只是文章列表？
- 是否存在一个明确的视觉主角，而不是所有卡片权重相同？
- taxonomy 页是否已经像“主题分卷”而非普通分类列表？
- 详情页是否更像卷宗封面，同时仍然适合长文阅读？
- 即使拿掉重阴影，博客频道是否仍然成立？

## Implementation Note

建议下一步直接基于这个方案进入实现，优先改动：

- `src/pages/blog/index.astro`
- `src/components/site/TaxonomyPage.astro`
- `src/components/site/ArticleShell.astro`
- `src/styles/global.css`

同时把 `tests/e2e/theme.spec.ts` 的旧文案断言更新到当前策略主题文案，并补一条博客频道在策略主题下的基本可见性断言。
