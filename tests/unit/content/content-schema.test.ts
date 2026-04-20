import { describe, expect, it } from "vitest";
import { labEntrySchema, projectEntrySchema, researchEntrySchema } from "../../../src/lib/content/entry-schemas";
import { postSchema } from "../../../src/lib/content/post-schema";
import { siteMeta } from "../../../src/data/site";

describe("site meta", () => {
  it("defines the high-level research site framing", () => {
    expect(siteMeta.title).toBe("Blacksheep");
    expect(siteMeta.description).toContain("博客");
    expect(siteMeta.focusAreas.length).toBeGreaterThanOrEqual(3);
  });
});

describe("post schema", () => {
  it("accepts native posts without legacy metadata", () => {
    const result = postSchema.safeParse({
      title: "新文章",
      description: "新的研究笔记",
      pubDate: "2026-04-14",
      source: "native",
      categories: ["研究"],
      tags: ["astro"]
    });

    expect(result.success).toBe(true);
  });

  it("requires legacy metadata for imported posts", () => {
    const result = postSchema.safeParse({
      title: "旧文章",
      description: "导入内容",
      pubDate: "2019-11-21",
      source: "legacy"
    });

    expect(result.success).toBe(false);
  });
});

describe("research and lab schemas", () => {
  it("accepts dated research entries", () => {
    const result = researchEntrySchema.safeParse({
      title: "研究主题",
      description: "研究说明",
      focus: "研究地图",
      updatedAt: "2026-04-16"
    });

    expect(result.success).toBe(true);
  });

  it("accepts undated lab entries for backwards compatibility", () => {
    const result = labEntrySchema.safeParse({
      title: "实验标题",
      description: "实验说明"
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid updatedAt values", () => {
    const result = researchEntrySchema.safeParse({
      title: "研究主题",
      description: "研究说明",
      focus: "研究地图",
      updatedAt: "not-a-date"
    });

    expect(result.success).toBe(false);
  });

  it("rejects invalid updatedAt values for lab entries", () => {
    const result = labEntrySchema.safeParse({
      title: "实验标题",
      description: "实验说明",
      updatedAt: "not-a-date"
    });

    expect(result.success).toBe(false);
  });

  it("accepts project entries with related research links", () => {
    const result = projectEntrySchema.safeParse({
      title: "Git to Blog",
      description: "把项目过程发布成项目卷宗。",
      projectId: "git2blog",
      status: "active",
      startedAt: "2026-04-18",
      updatedAt: "2026-04-18",
      sourceRepos: ["/tmp/git2blog"],
      relatedResearch: ["ai-research-station"],
      tags: ["automation"],
      featured: true
    });

    expect(result.success).toBe(true);
  });

  it("rejects invalid project status values", () => {
    const result = projectEntrySchema.safeParse({
      title: "Git to Blog",
      description: "把项目过程发布成项目卷宗。",
      projectId: "git2blog",
      status: "draft",
      startedAt: "2026-04-18",
      updatedAt: "2026-04-18",
      sourceRepos: ["/tmp/git2blog"],
      relatedResearch: [],
      tags: [],
      featured: false
    });

    expect(result.success).toBe(false);
  });
});
