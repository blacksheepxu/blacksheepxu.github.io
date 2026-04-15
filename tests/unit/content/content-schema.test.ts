import { describe, expect, it } from "vitest";
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
