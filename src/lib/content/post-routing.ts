import { legacyUrlToPath } from "./legacy-paths";

interface PostLike {
  id: string;
  data: {
    source: "legacy" | "native";
    legacyUrl?: string;
  };
}

function stripContentExtension(value: string) {
  return value.replace(/\.(md|mdx)$/, "");
}

export function isLegacyPost(post: PostLike) {
  return post.data.source === "legacy" && Boolean(post.data.legacyUrl);
}

export function getPostHref(post: PostLike) {
  if (isLegacyPost(post)) {
    return legacyUrlToPath(post.data.legacyUrl!);
  }

  return `/blog/${stripContentExtension(post.id)}/`;
}

export function getCollectionSlugFromId(id: string) {
  return stripContentExtension(id);
}
