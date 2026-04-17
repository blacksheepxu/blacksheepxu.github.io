# Theme Maintenance

## Purpose

这份手册定义站点在多主题条件下的长期维护方式。它同时服务你自己和未来协作者，目标是确保内容更新、代码改动和未来新增主题时，都不会让某个主题悄悄失真。

## Core Rules

1. 单一内容源
所有文章、研究条目和实验条目只维护一份内容事实。不同主题只能改变呈现方式、结构层级和交互模式，不能复制内容版本。

2. 多主题检查默认启用
内容更新和代码变更都必须检查所有现有主题，而不是只看默认主题或当前正在开发的主题。

3. 代码改动优先防风险
页面、组件、样式和主题逻辑改动是第一优先风险场景。默认要做代码阅读和浏览器/截图验证。

4. 新增主题必须复用同一套规则
后续新增第三、第四个主题时，必须沿用这份手册和对应检查清单，而不是另起一套流程。

5. 主题壳层按 capability 管理
主题切换不能只停留在 theme id 层面。页面壳层显隐、命令面板入口和内容壳层都应由 theme capability 驱动，而不是继续默认只有 `default/strategy` 两种硬编码分支。

6. 默认主题是主产品，策略主题是专家视角
默认主题继续承担“个人 AI 研究网站”的主产品职责。策略主题是帮助判断主题态势与调度资产的专家视角，而不是更高级、更完整的主版本。

7. 地图坐标是策略主题的一部分
首页战区图中的固定核心战区坐标、动态补位区和外围散点槽位都属于长期设计契约。它们不能被随意改成纯视觉摆放，否则会破坏用户的空间记忆。

8. 界面强度必须服从真实内容密度
`research`、`lab` 和 detail pages 在策略主题下可以拥有命令语义，但不能在内容仍然稀薄时摆出比真实内容更厚的系统壳层。优先诚实地承认“紧凑载体 / 子地图 / 阅读优先卷宗”的角色。

## Code Change Workflow

1. 明确改动是否触及高风险区域：
`src/layouts/BaseLayout.astro`
`src/components/site/Header.astro`
`src/styles/global.css`
`src/pages/index.astro`
`src/components/home/*`
`src/pages/sectors/*`
`src/components/sectors/*`
`src/components/site/ArticleShell.astro`
`src/components/site/EntryDetailShell.astro`
`src/components/site/TaxonomyPage.astro`

2. 阅读受影响代码与已有测试。

3. 完成改动后，至少在所有现有主题下检查相关页面的真实结果。

4. 涉及主题交互、首页、战区详情、载体页或共享壳层的改动，默认补充或更新 Playwright 断言。

5. 如需跳过某项检查，必须在变更说明中写明原因。

6. 若改动触及热度、动态补位或 capability-aware 壳层逻辑，默认同时补充对应 unit 或 e2e 断言，避免只靠肉眼确认。

7. 若改动触及共享导航、theme toggle 或 wayfinding，默认同时检查：
- 默认主题是否仍明确服务“研究网站”主产品
- 策略主题是否仍被感知为同站点的专家视角，而不是另一个独立产品
- 频道入口与战区语义是否仍然在互相冲突

8. 若改动触及首页战区地图，默认同时检查：
- 固定核心战区坐标是否仍稳定
- 动态战区是否仍只在预设补位区出现
- 节点热度颜色是否仍与热度 band 对应

9. 若改动触及 research / lab / detail pages 的策略界面，默认同时检查：
- 这些页面当前属于完整指挥界面、紧凑子视图，还是阅读优先卷宗
- 页面语气是否诚实匹配当前内容密度
- 用户是否仍能快速进入真实内容，而不是先被厚重壳层挡住

## Content Update Workflow

1. 保持单一内容源，不为某个主题单独写内容分支。

2. 新增或修改文章、研究、实验内容后，至少确认这份内容在所有现有主题下都能正确显示。

3. 若内容会影响主题战区归属、首页战区网络或 carrier 语义，需要同时检查：
- 首页 strategy 主题
- 相关 `/sectors/[slug]/`
- 对应 carrier page 或 detail page

4. 若内容引入了新的长期主题线索，需要评估是否影响固定核心战区、动态补位或外围散点逻辑。

5. `research` / `lab` 若希望参与“近期活跃”与 timeline 信号，应填写 `updatedAt`；未填写时，它们仍属于战区资产，但不参与近期热度提升。

6. 若内容变化会影响热度排序，应确认首页战区地图中的颜色与补位位置是否仍合理。

7. 若新增内容会显著改变 `research` 或 `lab` 的真实密度，应重新评估对应载体页在策略主题下应处于“紧凑载体 / 子地图 / 更完整索引”哪一层级。

## Theme Expansion Workflow

新增主题前，至少补齐以下治理资产：

1. 主题注册表中的定义
2. 最低浏览器验证入口
3. 主题差异边界说明
4. 对这份维护手册和相关检查清单的更新
5. capability 与页面壳层之间的映射说明

## Verification Baseline

- 代码改动：读代码 + 浏览器/截图验证
- 内容更新：检查所有现有主题
- 高风险页面：优先通过 Playwright 覆盖
- 地图化首页：额外验证坐标稳定性、补位区边界和热度颜色映射
- 产品层级校准：额外验证默认主题仍是研究网站主产品、策略主题仍是专家视角而不是主产品替身

## Related Checklists

- `docs/checklists/theme-code-change-checklist.md`
- `docs/checklists/theme-content-update-checklist.md`
