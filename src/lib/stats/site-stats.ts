import type { PostEntry } from "../content/posts";

export interface CadenceBucket {
  label: string;
  count: number;
}

export interface TopicBucket {
  label: string;
  count: number;
}

export interface SiteStats {
  totalPosts: number;
  totalTopics: number;
  totalLegacyYears: number;
  cadence: CadenceBucket[];
  topics: TopicBucket[];
}

function toMonthLabel(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function buildSiteStats(posts: PostEntry[]): SiteStats {
  const cadenceMap = new Map<string, number>();
  const topicMap = new Map<string, number>();
  const years = new Set<number>();

  posts.forEach((post) => {
    years.add(post.data.pubDate.getFullYear());

    const month = toMonthLabel(post.data.pubDate);
    cadenceMap.set(month, (cadenceMap.get(month) ?? 0) + 1);

    const topic = post.data.topic ?? post.data.categories[0] ?? post.data.tags[0] ?? "未分类研究";
    topicMap.set(topic, (topicMap.get(topic) ?? 0) + 1);
  });

  const cadence = [...cadenceMap.entries()]
    .sort((left, right) => left[0].localeCompare(right[0]))
    .map(([label, count]) => ({ label, count }));

  const topics = [...topicMap.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([label, count]) => ({ label, count }));

  return {
    totalPosts: posts.length,
    totalTopics: topics.length,
    totalLegacyYears: years.size,
    cadence,
    topics
  };
}

