import rss from "@astrojs/rss";
import { getPosts } from "../lib/content/posts";
import { getPostHref } from "../lib/content/posts";
import { siteMeta } from "../data/site";

import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const posts = await getPosts();

  return rss({
    title: siteMeta.title,
    description: siteMeta.description,
    site: context.site!,
    items: posts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.pubDate,
      description: post.data.description,
      link: getPostHref(post),
    })),
    customData: `<language>zh-CN</language>`,
  });
}
