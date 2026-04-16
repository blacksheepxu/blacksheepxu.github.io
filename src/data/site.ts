import { defaultThemeId, strategyThemeId } from "../lib/theme/theme-registry";

export const siteMeta = {
  title: "Blacksheep",
  description: "博客、研究和实验放在一起的个人 AI 站点。",
  tagline: "记录研究，展示结果。",
  heroSummary: "旧文章保留，新内容继续生长，也能放一些轻量交互。",
  themeStorageKey: "blacksheep-theme",
  defaultTheme: defaultThemeId,
  strategyTheme: strategyThemeId,
  focusAreas: [
    "深度学习与模型理解",
    "研究型笔记与方法归档",
    "可交互的统计与表达实验"
  ]
};
