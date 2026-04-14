import { describe, expect, it } from "vitest";
import { getPostHref, isLegacyPost } from "../../../src/lib/content/post-routing";

interface PostStub {
  id: string;
  data: {
    title: string;
    description: string;
    pubDate: Date;
    legacyUrl?: string;
    legacySlug?: string;
    categories: string[];
    tags: string[];
    source: "legacy" | "native";
    featured: boolean;
  };
}

function makePost(overrides: PostStub): PostStub {
  return {
    ...overrides
  };
}

describe("post hrefs", () => {
  it("preserves legacy article urls", () => {
    const post = makePost({
      id: "legacy/example.md",
      data: {
        title: "旧文章",
        description: "desc",
        pubDate: new Date("2019-11-21"),
        legacyUrl: "/2019/11/21/example/",
        legacySlug: "example",
        categories: [],
        tags: [],
        source: "legacy",
        featured: false
      }
    });

    expect(isLegacyPost(post)).toBe(true);
    expect(getPostHref(post)).toBe("/2019/11/21/example/");
  });

  it("routes native articles under /blog", () => {
    const post = makePost({
      id: "native-article.mdx",
      data: {
        title: "新文章",
        description: "desc",
        pubDate: new Date("2026-04-14"),
        categories: ["研究"],
        tags: ["astro"],
        source: "native",
        featured: true
      }
    });

    expect(isLegacyPost(post)).toBe(false);
    expect(getPostHref(post)).toBe("/blog/native-article/");
  });
});
