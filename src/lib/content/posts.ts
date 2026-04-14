import { getCollection, type CollectionEntry } from "astro:content";
import { legacyUrlToParams } from "./legacy-paths";
import { getCollectionSlugFromId, getPostHref as getPostHrefForPost, isLegacyPost } from "./post-routing";

export type PostEntry = CollectionEntry<"posts">;
export type ResearchEntry = CollectionEntry<"research">;
export type LabEntry = CollectionEntry<"lab">;
export { isLegacyPost } from "./post-routing";

export async function getPosts(): Promise<PostEntry[]> {
  const posts = await getCollection("posts");
  return posts.sort((left: PostEntry, right: PostEntry) => right.data.pubDate.getTime() - left.data.pubDate.getTime());
}

export async function getFeaturedPosts(limit = 3): Promise<PostEntry[]> {
  const posts = await getPosts();
  const featured = posts.filter((post: PostEntry) => post.data.featured);
  const legacyFallback = posts.filter((post: PostEntry) => isLegacyPost(post) && !post.data.featured);

  return [...featured, ...legacyFallback].slice(0, limit);
}

export async function getResearchEntries(): Promise<ResearchEntry[]> {
  const entries = await getCollection("research");
  return entries.sort((left: ResearchEntry, right: ResearchEntry) => left.data.order - right.data.order);
}

export async function getLabEntries(): Promise<LabEntry[]> {
  const entries = await getCollection("lab");
  return entries.sort((left: LabEntry, right: LabEntry) => left.data.order - right.data.order);
}

export function getPostHref(post: PostEntry) {
  return getPostHrefForPost(post);
}

export function getCollectionSlug(entry: ResearchEntry | LabEntry) {
  return getCollectionSlugFromId(entry.id);
}

export function getLegacyStaticPaths(posts: PostEntry[]) {
  return posts.filter(isLegacyPost).map((post) => ({
    params: legacyUrlToParams(post.data.legacyUrl),
    props: { post }
  }));
}

export function getNativeStaticPaths(posts: PostEntry[]) {
  return posts.filter((post) => !isLegacyPost(post)).map((post) => ({
    params: { slug: getCollectionSlugFromId(post.id) },
    props: { post }
  }));
}

export function buildTaxonomyMap(posts: PostEntry[], key: "tags" | "categories") {
  const map = new Map<string, PostEntry[]>();

  posts.forEach((post) => {
    post.data[key].forEach((item: string) => {
      const current = map.get(item) ?? [];
      current.push(post);
      map.set(item, current);
    });
  });

  return [...map.entries()]
    .sort((left, right) => left[0].localeCompare(right[0], "zh-Hans-CN"))
    .map(([name, items]) => ({ name, items }));
}
