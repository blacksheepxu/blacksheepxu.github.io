import { describe, expect, it } from "vitest";
import { buildSectorGraph } from "../../src/lib/theme-sectors/sector-graph";
import { resolveAssetSectorContext } from "../../src/lib/theme-sectors/sector-presenters";

function makePost(id: string, title: string, topic: string, date = "2026-04-16") {
  return {
    id,
    data: {
      title,
      description: `${title} 描述`,
      pubDate: new Date(date),
      topic,
      categories: [topic],
      tags: [],
      featured: false,
      source: "native" as const
    }
  };
}

function makeResearch(id: string, title: string, focus: string) {
  return {
    id,
    data: {
      title,
      description: `${title} 描述`,
      focus,
      status: "active",
      relatedPosts: [],
      featured: false,
      order: 1,
      updatedAt: new Date("2026-04-15")
    }
  };
}

function makeLab(id: string, title: string, kind: string) {
  return {
    id,
    data: {
      title,
      description: `${title} 描述`,
      kind,
      status: "prototype",
      featured: false,
      order: 1,
      updatedAt: new Date("2026-04-14")
    }
  };
}

describe("resolveAssetSectorContext", () => {
  it("returns the related sectors for a post route", () => {
    const graph = buildSectorGraph({
      posts: [makePost("todo-post", "项目推进记录", "Todo")] as any,
      researchEntries: [] as any,
      labEntries: [] as any
    });

    const context = resolveAssetSectorContext(graph.sectors, "/blog/todo-post/");

    expect(context.primarySector?.slug).toBe("self-projects-command");
    expect(context.relatedSectors.map((sector) => sector.slug)).toContain("self-projects-command");
  });

  it("returns the related sectors for research and lab routes", () => {
    const graph = buildSectorGraph({
      posts: [] as any,
      researchEntries: [makeResearch("research-map", "当前研究版图", "研究地图")] as any,
      labEntries: [makeLab("cadence-demo", "研究节奏与主题投入", "stats")] as any
    });

    const researchContext = resolveAssetSectorContext(graph.sectors, "/research/research-map/");
    const labContext = resolveAssetSectorContext(graph.sectors, "/lab/cadence-demo/");

    expect(researchContext.primarySector?.slug).toBe("self-projects-command");
    expect(labContext.primarySector?.slug).toBe("self-projects-command");
  });

  it("returns an empty context when the asset is outside all sectors", () => {
    const graph = buildSectorGraph({
      posts: [makePost("tooling-post", "Pytorch 记录", "Pytorch")] as any,
      researchEntries: [] as any,
      labEntries: [] as any
    });

    const context = resolveAssetSectorContext(graph.sectors, "/blog/missing-post/");

    expect(context.primarySector).toBeUndefined();
    expect(context.relatedSectors).toEqual([]);
  });
});
