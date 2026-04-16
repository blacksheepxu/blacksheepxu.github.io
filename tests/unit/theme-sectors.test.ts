import { describe, expect, it } from "vitest";
import { buildSectorGraph } from "../../src/lib/theme-sectors/sector-graph";

function makePost({
  id,
  title,
  description,
  date,
  topic,
  categories = [],
  tags = [],
  featured = false,
  source = "native"
}: {
  id: string;
  title: string;
  description: string;
  date: string;
  topic?: string;
  categories?: string[];
  tags?: string[];
  featured?: boolean;
  source?: "legacy" | "native";
}) {
  return {
    id,
    data: {
      title,
      description,
      pubDate: new Date(date),
      topic,
      categories,
      tags,
      featured,
      source,
      legacyUrl: source === "legacy" ? `/${date.replace(/-/g, "/")}/${id}/` : undefined,
      legacySlug: source === "legacy" ? id : undefined
    }
  };
}

function makeResearch({
  id,
  title,
  description,
  focus,
  status = "active",
  featured = false,
  order = 1,
  updatedAt
}: {
  id: string;
  title: string;
  description: string;
  focus: string;
  status?: "active" | "seed" | "archive";
  featured?: boolean;
  order?: number;
  updatedAt?: string;
}) {
  return {
    id,
    data: {
      title,
      description,
      focus,
      status,
      relatedPosts: [],
      featured,
      order,
      updatedAt: updatedAt ? new Date(updatedAt) : undefined
    }
  };
}

function makeLab({
  id,
  title,
  description,
  kind = "demo",
  status = "prototype",
  featured = false,
  order = 1,
  updatedAt
}: {
  id: string;
  title: string;
  description: string;
  kind?: "stats" | "demo" | "tool";
  status?: "ready" | "prototype" | "planned";
  featured?: boolean;
  order?: number;
  updatedAt?: string;
}) {
  return {
    id,
    data: {
      title,
      description,
      kind,
      status,
      featured,
      order,
      updatedAt: updatedAt ? new Date(updatedAt) : undefined
    }
  };
}

describe("buildSectorGraph", () => {
  it("always includes the three fixed sectors and one dynamic slot", () => {
    const graph = buildSectorGraph({
      posts: [
        makePost({
          id: "post-a",
          title: "Pytorch 入门",
          description: "工具侦察",
          date: "2026-04-01",
          topic: "Pytorch",
          categories: ["Pytorch"]
        }),
        makePost({
          id: "post-b",
          title: "论文阅读笔记",
          description: "校准模型理解",
          date: "2026-03-24",
          topic: "Paper",
          categories: ["Paper"]
        }),
        makePost({
          id: "post-c",
          title: "项目 TODO",
          description: "推进自研项目",
          date: "2026-04-10",
          topic: "Todo",
          categories: ["Todo"],
          featured: true
        }),
        makePost({
          id: "post-d",
          title: "x86 汇编复盘",
          description: "外围主题",
          date: "2026-03-01",
          topic: "x86汇编"
        })
      ] as any,
      researchEntries: [
        makeResearch({
          id: "research-1",
          title: "当前研究版图",
          description: "项目中枢",
          focus: "研究地图",
          featured: true,
          updatedAt: "2026-04-15"
        })
      ] as any,
      labEntries: [
        makeLab({
          id: "lab-1",
          title: "研究节奏与主题投入",
          description: "统计看板",
          kind: "stats",
          status: "ready",
          featured: true,
          updatedAt: "2026-04-16"
        })
      ] as any
    });

    expect(graph.coreSectors.map((sector) => sector.title)).toEqual([
      "自研项目推进",
      "AI 工具侦察",
      "AI 认知校准"
    ]);
    expect(graph.dynamicSector.slug).toBe("dynamic-frontier");
    expect(graph.defaultFocusedSlug).toBe("self-projects-command");
  });

  it("builds heat from both asset scale and recency", () => {
    const graph = buildSectorGraph({
      posts: [
        makePost({
          id: "recent-featured",
          title: "项目推进",
          description: "最近更新",
          date: "2026-04-12",
          topic: "Todo",
          featured: true
        }),
        makePost({
          id: "older-one",
          title: "旧项目记录",
          description: "较早记录",
          date: "2025-11-12",
          topic: "Todo"
        })
      ] as any,
      researchEntries: [] as any,
      labEntries: [] as any
    });

    const primary = graph.coreSectors.find((sector) => sector.slug === "self-projects-command");
    expect(primary?.assetCount).toBe(2);
    expect(primary?.heat).toBeGreaterThan(primary?.assetCount ?? 0);
    expect(primary?.recentActivity).toBeGreaterThan(0);
  });

  it("does not count undated non-post assets as recent activity", () => {
    const graph = buildSectorGraph({
      posts: [] as any,
      researchEntries: [
        makeResearch({
          id: "research-undated",
          title: "当前研究版图",
          description: "无时间信号",
          focus: "研究地图",
          featured: true
        })
      ] as any,
      labEntries: [
        makeLab({
          id: "lab-undated",
          title: "研究节奏与主题投入",
          description: "无时间信号",
          kind: "stats",
          featured: true
        })
      ] as any
    });

    const primary = graph.coreSectors.find((sector) => sector.slug === "self-projects-command");
    expect(primary?.assetCount).toBe(2);
    expect(primary?.recentActivity).toBe(0);
  });

  it("never lets the dynamic slot duplicate a fixed core sector", () => {
    const graph = buildSectorGraph({
      posts: [
        makePost({
          id: "deep-learning",
          title: "CS231n",
          description: "认知校准",
          date: "2026-04-01",
          topic: "CS231n"
        }),
        makePost({
          id: "tooling",
          title: "Pytorch",
          description: "工具侦察",
          date: "2026-04-05",
          topic: "Pytorch"
        }),
        makePost({
          id: "project",
          title: "自研 Todo",
          description: "项目推进",
          date: "2026-04-08",
          topic: "Todo"
        }),
        makePost({
          id: "unmatched",
          title: "x86 学习",
          description: "外围散点",
          date: "2026-04-06",
          topic: "x86汇编"
        })
      ] as any,
      researchEntries: [] as any,
      labEntries: [] as any
    });

    expect(graph.dynamicSector.title).toContain("机动补位");
    expect(graph.dynamicSector.title).not.toContain("自研项目推进");
    expect(graph.dynamicSector.title).not.toContain("AI 工具侦察");
    expect(graph.dynamicSector.title).not.toContain("AI 认知校准");
  });

  it("prefers the hottest unmatched cluster for the dynamic slot", () => {
    const graph = buildSectorGraph({
      posts: [
        makePost({
          id: "primary-anchor",
          title: "项目 Todo",
          description: "固定主战区锚点",
          date: "2026-04-16",
          topic: "Todo",
          featured: true
        }),
        makePost({
          id: "older-heavy-1",
          title: "x86 汇编一",
          description: "较老的外围主题",
          date: "2025-08-01",
          topic: "x86汇编",
          featured: true
        }),
        makePost({
          id: "older-heavy-2",
          title: "x86 汇编二",
          description: "较老的外围主题",
          date: "2025-08-02",
          topic: "x86汇编",
          featured: true
        }),
        makePost({
          id: "recent-hot",
          title: "检索增强最新观察",
          description: "最近正在升温的外围主题",
          date: "2026-04-15",
          topic: "检索增强"
        })
      ] as any,
      researchEntries: [] as any,
      labEntries: [] as any
    });

    expect(graph.dynamicSector.title).toContain("检索增强");
    expect(graph.dynamicSector.title).not.toContain("x86汇编");
  });
});
