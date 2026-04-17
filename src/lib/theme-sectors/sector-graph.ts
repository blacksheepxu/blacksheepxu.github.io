import { dynamicThemeSector, fixedThemeSectors } from "../../data/theme-sectors";
import { getCollectionSlugFromId, getPostHref } from "../content/post-routing";

interface PostInput {
  id: string;
  data: {
    title: string;
    description: string;
    pubDate: Date;
    topic?: string;
    categories: string[];
    tags: string[];
    featured: boolean;
    source: "legacy" | "native";
    legacyUrl?: string;
  };
}

interface ResearchInput {
  id: string;
  data: {
    title: string;
    description: string;
    focus: string;
    status: string;
    relatedPosts: string[];
    featured: boolean;
    order: number;
    updatedAt?: Date;
  };
}

interface LabInput {
  id: string;
  data: {
    title: string;
    description: string;
    kind: string;
    status: string;
    featured: boolean;
    order: number;
    updatedAt?: Date;
  };
}

export interface SectorAsset {
  id: string;
  kind: "post" | "research" | "lab";
  title: string;
  description: string;
  href: string;
  timestamp: Date | null;
  topics: string[];
  signalLabel: string;
  featured: boolean;
}

export interface ThemeSector {
  slug: string;
  title: string;
  role: "primary" | "support" | "calibration" | "dynamic" | "peripheral";
  summary: string;
  dominantTopic: string;
  assetCount: number;
  heat: number;
  recentActivity: number;
  relatedSlugs: string[];
  assets: SectorAsset[];
  leadAssets: SectorAsset[];
}

interface TopicCluster {
  slug: string;
  label: string;
  weight: number;
  recentWeight: number;
  assets: SectorAsset[];
}

export interface SectorGraph {
  sectors: ThemeSector[];
  coreSectors: ThemeSector[];
  dynamicSector: ThemeSector;
  peripheralSectors: ThemeSector[];
  defaultFocusedSlug: string;
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "") || "unknown";
}

function normalizeTopics(values: Array<string | undefined>) {
  return [...new Set(values.filter(Boolean).map((value) => value!.trim()).filter(Boolean))];
}

function buildPostAsset(post: PostInput): SectorAsset {
  return {
    id: post.id,
    kind: "post",
    title: post.data.title,
    description: post.data.description,
    href: getPostHref(post),
    timestamp: post.data.pubDate,
    topics: normalizeTopics([post.data.topic, ...post.data.categories, ...post.data.tags]),
    signalLabel: post.data.source === "legacy" ? "归档迁移" : "原生发布",
    featured: post.data.featured
  };
}

function buildResearchAsset(entry: ResearchInput): SectorAsset {
  return {
    id: entry.id,
    kind: "research",
    title: entry.data.title,
    description: entry.data.description,
    href: `/research/${getCollectionSlugFromId(entry.id)}/`,
    timestamp: entry.data.updatedAt ?? null,
    topics: normalizeTopics([entry.data.focus]),
    signalLabel: entry.data.status,
    featured: entry.data.featured
  };
}

function buildLabAsset(entry: LabInput): SectorAsset {
  return {
    id: entry.id,
    kind: "lab",
    title: entry.data.title,
    description: entry.data.description,
    href: `/lab/${getCollectionSlugFromId(entry.id)}/`,
    timestamp: entry.data.updatedAt ?? null,
    topics: normalizeTopics([entry.data.kind, "实验", "交互表达"]),
    signalLabel: entry.data.status,
    featured: entry.data.featured
  };
}

function getAssetWeight(asset: SectorAsset) {
  const base = asset.kind === "post" ? 1 : 2;
  return base + (asset.featured ? 2 : 0);
}

function getRecentCutoff(assets: SectorAsset[]) {
  const latest = assets.reduce((max, asset) => Math.max(max, asset.timestamp?.getTime() ?? 0), 0);

  if (latest === 0) {
    return null;
  }

  return latest - 180 * 24 * 60 * 60 * 1000;
}

function isRecentAsset(asset: SectorAsset, recentCutoff: number | null) {
  return recentCutoff !== null && asset.timestamp !== null && asset.timestamp.getTime() >= recentCutoff;
}

function getSortableTimestamp(asset: SectorAsset) {
  return asset.timestamp?.getTime() ?? -1;
}

function assignFixedSector(asset: SectorAsset) {
  const corpus = [asset.title, asset.description, ...asset.topics].join(" ").toLowerCase();
  return fixedThemeSectors.find((sector) => sector.topicAliases.some((alias) => corpus.includes(alias.toLowerCase())));
}

function buildTopicClusters(assets: SectorAsset[], recentCutoff: number | null) {
  const clusters = new Map<string, TopicCluster>();

  assets.forEach((asset) => {
    const topic = asset.topics[0] ?? "外围主题";
    const slug = slugify(topic);
    const existing = clusters.get(slug) ?? {
      slug,
      label: topic,
      weight: 0,
      recentWeight: 0,
      assets: []
    };
    const weight = getAssetWeight(asset);
    existing.weight += weight;
    if (isRecentAsset(asset, recentCutoff)) {
      existing.recentWeight += weight;
    }
    existing.assets.push(asset);
    clusters.set(slug, existing);
  });

  return [...clusters.values()].sort(
    (left, right) =>
      right.recentWeight - left.recentWeight ||
      right.weight - left.weight ||
      right.assets.length - left.assets.length
  );
}

function buildThemeSectorFromAssets(
  slug: string,
  title: string,
  role: ThemeSector["role"],
  summary: string,
  assets: SectorAsset[],
  recentCutoff: number | null
): ThemeSector {
  const sortedAssets = [...assets].sort(
    (left, right) =>
      Number(right.featured) - Number(left.featured) || getSortableTimestamp(right) - getSortableTimestamp(left)
  );
  const recentActivity = sortedAssets.filter((asset) => isRecentAsset(asset, recentCutoff)).length;

  return {
    slug,
    title,
    role,
    summary,
    dominantTopic: sortedAssets[0]?.topics[0] ?? title,
    assetCount: sortedAssets.length,
    heat: sortedAssets.reduce((total, asset) => total + getAssetWeight(asset), 0) + recentActivity,
    recentActivity,
    relatedSlugs: [],
    assets: sortedAssets,
    leadAssets: sortedAssets.slice(0, 3)
  };
}

function connectSectors(sectors: ThemeSector[]) {
  const sectorBySlug = new Map(sectors.map((sector) => [sector.slug, sector]));

  const setRelations = (slug: string, relatedSlugs: string[]) => {
    const sector = sectorBySlug.get(slug);

    if (!sector) {
      return;
    }

    sector.relatedSlugs = [...new Set(relatedSlugs.filter((related) => related !== slug && sectorBySlug.has(related)))];
  };

  setRelations("self-projects-command", ["ai-tools-intel", "ai-cognition-calibration", dynamicThemeSector.slug]);
  setRelations("ai-tools-intel", ["self-projects-command", "ai-cognition-calibration"]);
  setRelations("ai-cognition-calibration", ["self-projects-command", "ai-tools-intel"]);

  sectors
    .filter((sector) => sector.role === "dynamic" || sector.role === "peripheral")
    .forEach((sector) => {
      if (sector.relatedSlugs.length === 0) {
        sector.relatedSlugs = ["self-projects-command"];
      }
    });
}

export function buildSectorGraph({
  posts,
  researchEntries,
  labEntries
}: {
  posts: PostInput[];
  researchEntries: ResearchInput[];
  labEntries: LabInput[];
}): SectorGraph {
  const assets = [
    ...posts.map(buildPostAsset),
    ...researchEntries.map(buildResearchAsset),
    ...labEntries.map(buildLabAsset)
  ];
  const recentCutoff = getRecentCutoff(assets);

  const fixedAssignments = new Map<string, SectorAsset[]>();
  fixedThemeSectors.forEach((sector) => fixedAssignments.set(sector.slug, []));

  const unmatchedAssets: SectorAsset[] = [];

  assets.forEach((asset) => {
    const sector = assignFixedSector(asset);

    if (sector) {
      fixedAssignments.get(sector.slug)?.push(asset);
      return;
    }

    unmatchedAssets.push(asset);
  });

  const coreSectors = fixedThemeSectors.map((sector) =>
    buildThemeSectorFromAssets(
      sector.slug,
      sector.title,
      sector.role,
      sector.summary,
      fixedAssignments.get(sector.slug) ?? [],
      recentCutoff
    )
  );

  const clusters = buildTopicClusters(unmatchedAssets, recentCutoff);
  const dynamicCluster = clusters[0];

  const dynamicSector = buildThemeSectorFromAssets(
    dynamicThemeSector.slug,
    dynamicCluster ? `${dynamicThemeSector.title}：${dynamicCluster.label}` : dynamicThemeSector.title,
    "dynamic",
    dynamicCluster
      ? `承接当前正在升温但尚未进入长期固定核心的主题，这一轮由 ${dynamicCluster.label} 补位。`
      : dynamicThemeSector.summary,
    dynamicCluster?.assets ?? [],
    recentCutoff
  );

  const peripheralSectors = clusters.slice(1).map((cluster) =>
    buildThemeSectorFromAssets(
      cluster.slug,
      cluster.label,
      "peripheral",
      `外围主题 ${cluster.label}，作为当前版图中的次级散点存在。`,
      cluster.assets,
      recentCutoff
    )
  );

  const sectors = [...coreSectors, dynamicSector, ...peripheralSectors];
  connectSectors(sectors);

  return {
    sectors,
    coreSectors,
    dynamicSector,
    peripheralSectors,
    defaultFocusedSlug: "self-projects-command"
  };
}
