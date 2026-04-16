import { describe, expect, it } from "vitest";
import { buildSectorGraph } from "../../src/lib/theme-sectors/sector-graph";
import {
  buildSectorHomeLayout,
  buildSectorMapLayout,
  getSectorHeatBand
} from "../../src/lib/theme-sectors/sector-presenters";

function makePost({
  id,
  title,
  description,
  date,
  topic,
  categories = [],
  featured = false
}: {
  id: string;
  title: string;
  description: string;
  date: string;
  topic?: string;
  categories?: string[];
  featured?: boolean;
}) {
  return {
    id,
    data: {
      title,
      description,
      pubDate: new Date(date),
      topic,
      categories,
      tags: [],
      featured,
      source: "native" as const
    }
  };
}

describe("sector map layout", () => {
  it("keeps fixed core sectors on stable anchors", () => {
    const graph = buildSectorGraph({
      posts: [
        makePost({
          id: "tooling",
          title: "Pytorch 记录",
          description: "工具侦察",
          date: "2026-04-05",
          topic: "Pytorch"
        }),
        makePost({
          id: "project",
          title: "项目 Todo",
          description: "项目推进",
          date: "2026-04-10",
          topic: "Todo"
        }),
        makePost({
          id: "cognition",
          title: "论文阅读",
          description: "认知校准",
          date: "2026-04-06",
          topic: "Paper"
        })
      ] as any,
      researchEntries: [] as any,
      labEntries: [] as any
    });

    const mapLayout = buildSectorMapLayout(buildSectorHomeLayout(graph.sectors));
    const positions = new Map(
      mapLayout.nodes
        .filter((node) => node.anchorKind === "fixed")
        .map((node) => [node.sector.slug, { x: node.x, y: node.y, zone: node.zone }])
    );

    expect(positions.get("self-projects-command")).toEqual({ x: 50, y: 44, zone: "capital" });
    expect(positions.get("ai-tools-intel")).toEqual({ x: 20, y: 28, zone: "western-front" });
    expect(positions.get("ai-cognition-calibration")).toEqual({ x: 80, y: 28, zone: "eastern-front" });
  });

  it("places the dynamic sector inside the southern-front slots", () => {
    const graph = buildSectorGraph({
      posts: [
        makePost({
          id: "project",
          title: "项目 Todo",
          description: "项目推进",
          date: "2026-04-16",
          topic: "Todo",
          featured: true
        }),
        makePost({
          id: "recent-hot",
          title: "检索增强观察",
          description: "最近升温的外围主题",
          date: "2026-04-15",
          topic: "检索增强"
        })
      ] as any,
      researchEntries: [] as any,
      labEntries: [] as any
    });

    const mapLayout = buildSectorMapLayout(buildSectorHomeLayout(graph.sectors));
    const dynamicNode = mapLayout.nodes.find((node) => node.anchorKind === "dynamic");

    expect(dynamicNode?.zone).toBe("southern-front");
    expect(dynamicNode?.y).toBeGreaterThanOrEqual(70);
  });

  it("derives stable heat bands from sector heat labels", () => {
    const graph = buildSectorGraph({
      posts: [
        makePost({
          id: "hot-project-1",
          title: "项目推进 1",
          description: "项目推进",
          date: "2026-04-16",
          topic: "Todo",
          featured: true
        }),
        makePost({
          id: "hot-project-2",
          title: "项目推进 2",
          description: "项目推进",
          date: "2026-04-15",
          topic: "Todo",
          featured: true
        }),
        makePost({
          id: "hot-project-3",
          title: "项目推进 3",
          description: "项目推进",
          date: "2026-04-14",
          topic: "Todo",
          featured: true
        }),
        makePost({
          id: "warm-tooling",
          title: "Pytorch 观察",
          description: "工具侦察",
          date: "2026-04-05",
          topic: "Pytorch"
        })
      ] as any,
      researchEntries: [] as any,
      labEntries: [] as any
    });

    const primary = graph.sectors.find((sector) => sector.slug === "self-projects-command");
    const support = graph.sectors.find((sector) => sector.slug === "ai-tools-intel");

    expect(primary && getSectorHeatBand(primary)).toBe("hot");
    expect(support && getSectorHeatBand(support)).toBe("warm");
  });
});
