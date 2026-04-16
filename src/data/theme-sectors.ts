export interface FixedThemeSector {
  slug: string;
  title: string;
  role: "primary" | "support" | "calibration";
  summary: string;
  topicAliases: string[];
}

export interface SectorMapAnchor {
  x: number;
  y: number;
  zone: "capital" | "western-front" | "eastern-front" | "southern-front" | "outer-ring";
  size: "flagship" | "wing" | "frontier" | "outpost";
}

export interface SectorMapZoneLabel {
  slug: SectorMapAnchor["zone"];
  label: string;
  x: number;
  y: number;
}

export const fixedThemeSectors: FixedThemeSector[] = [
  {
    slug: "self-projects-command",
    title: "自研项目推进",
    role: "primary",
    summary: "把工具侦察和认知校准收束成真正推进中的自研项目与可落地资产。",
    topicAliases: ["Todo", "todo", "研究地图", "研究节奏", "实验", "demo", "stats", "项目", "project"]
  },
  {
    slug: "ai-tools-intel",
    title: "AI 工具侦察",
    role: "support",
    summary: "追踪最新工具、框架和使用路径，判断哪些值得进入长期体系。",
    topicAliases: ["Pytorch", "PyTorch", "工具", "tool", "tooling", "assistant", "agent", "astro"]
  },
  {
    slug: "ai-cognition-calibration",
    title: "AI 认知校准",
    role: "calibration",
    summary: "持续校准对模型、论文、概念和判断框架的理解，而不是只追逐表面热点。",
    topicAliases: ["deeplearning", "deep learning", "CS231n", "Paper", "paper", "论文", "模型", "认知"]
  }
];

export const dynamicThemeSector = {
  slug: "dynamic-frontier",
  title: "机动补位",
  summary: "容纳正在升温但尚未进入长期固定核心的临时战区。"
} as const;

export const fixedSectorMapAnchors: Record<FixedThemeSector["slug"], SectorMapAnchor> = {
  "self-projects-command": {
    x: 50,
    y: 44,
    zone: "capital",
    size: "flagship"
  },
  "ai-tools-intel": {
    x: 20,
    y: 28,
    zone: "western-front",
    size: "wing"
  },
  "ai-cognition-calibration": {
    x: 80,
    y: 28,
    zone: "eastern-front",
    size: "wing"
  }
};

export const dynamicSectorMapSlots: SectorMapAnchor[] = [
  {
    x: 50,
    y: 74,
    zone: "southern-front",
    size: "frontier"
  },
  {
    x: 40,
    y: 77,
    zone: "southern-front",
    size: "frontier"
  },
  {
    x: 60,
    y: 77,
    zone: "southern-front",
    size: "frontier"
  }
];

export const peripheralSectorMapSlots: SectorMapAnchor[] = [
  { x: 10, y: 18, zone: "outer-ring", size: "outpost" },
  { x: 34, y: 12, zone: "outer-ring", size: "outpost" },
  { x: 66, y: 12, zone: "outer-ring", size: "outpost" },
  { x: 90, y: 18, zone: "outer-ring", size: "outpost" },
  { x: 8, y: 58, zone: "outer-ring", size: "outpost" },
  { x: 92, y: 58, zone: "outer-ring", size: "outpost" },
  { x: 18, y: 88, zone: "outer-ring", size: "outpost" },
  { x: 82, y: 88, zone: "outer-ring", size: "outpost" }
];

export const sectorMapZoneLabels: SectorMapZoneLabel[] = [
  { slug: "western-front", label: "WESTERN FRONT", x: 18, y: 13 },
  { slug: "capital", label: "COMMAND CORE", x: 50, y: 18 },
  { slug: "eastern-front", label: "EASTERN FRONT", x: 82, y: 13 },
  { slug: "southern-front", label: "MOBILE FRONT", x: 50, y: 86 }
];
