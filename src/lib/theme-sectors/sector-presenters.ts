import {
  dynamicSectorMapSlots,
  fixedSectorMapAnchors,
  peripheralSectorMapSlots,
  sectorMapZoneLabels,
  type SectorMapAnchor,
  type SectorMapZoneLabel
} from "../../data/theme-sectors";
import type { ThemeSector } from "./sector-graph";

export interface AssetSectorContext {
  relatedSectors: ThemeSector[];
  primarySector?: ThemeSector;
}

export interface SectorHomeLayout {
  primarySector: ThemeSector;
  supportSectors: ThemeSector[];
  dynamicSector: ThemeSector;
  peripheralSectors: ThemeSector[];
}

export type SectorHeatBand = "cool" | "warm" | "hot";

export interface SectorMapNode {
  sector: ThemeSector;
  x: number;
  y: number;
  zone: SectorMapAnchor["zone"];
  size: SectorMapAnchor["size"];
  anchorKind: "fixed" | "dynamic" | "peripheral";
  heatBand: SectorHeatBand;
}

export interface SectorMapRoute {
  id: string;
  from: SectorMapNode;
  to: SectorMapNode;
  emphasis: "primary" | "secondary";
}

export interface SectorMapLayout {
  nodes: SectorMapNode[];
  routes: SectorMapRoute[];
  zoneLabels: SectorMapZoneLabel[];
}

export function buildSectorHomeLayout(sectors: ThemeSector[]): SectorHomeLayout {
  return {
    primarySector: sectors.find((sector) => sector.role === "primary") ?? sectors[0],
    supportSectors: sectors.filter((sector) => sector.role === "support" || sector.role === "calibration"),
    dynamicSector: sectors.find((sector) => sector.role === "dynamic") ?? sectors[0],
    peripheralSectors: sectors.filter((sector) => sector.role === "peripheral")
  };
}

export function getSectorHeatLabel(sector: ThemeSector) {
  if (sector.recentActivity >= 3 || sector.heat >= 12) {
    return "Hot";
  }

  if (sector.recentActivity >= 1 || sector.heat >= 5) {
    return "Warm";
  }

  return "Idle";
}

export function getSectorHeatBand(sector: ThemeSector): SectorHeatBand {
  if (sector.recentActivity >= 3 || sector.heat >= 12) {
    return "hot";
  }

  if (sector.recentActivity >= 1 || sector.heat >= 5) {
    return "warm";
  }

  return "cool";
}

function getDynamicSectorMapSlot(sector: ThemeSector) {
  const heatBand = getSectorHeatBand(sector);

  if (heatBand === "hot") {
    return dynamicSectorMapSlots[0];
  }

  if (heatBand === "warm") {
    return dynamicSectorMapSlots[1];
  }

  return dynamicSectorMapSlots[2];
}

function buildMapNode(
  sector: ThemeSector,
  anchor: SectorMapAnchor,
  anchorKind: SectorMapNode["anchorKind"]
): SectorMapNode {
  return {
    sector,
    x: anchor.x,
    y: anchor.y,
    zone: anchor.zone,
    size: anchor.size,
    anchorKind,
    heatBand: getSectorHeatBand(sector)
  };
}

export function buildSectorMapLayout(layout: SectorHomeLayout): SectorMapLayout {
  const fixedNodes = [
    buildMapNode(layout.primarySector, fixedSectorMapAnchors[layout.primarySector.slug], "fixed"),
    ...layout.supportSectors
      .map((sector) => fixedSectorMapAnchors[sector.slug as keyof typeof fixedSectorMapAnchors] && buildMapNode(
        sector,
        fixedSectorMapAnchors[sector.slug as keyof typeof fixedSectorMapAnchors],
        "fixed"
      ))
      .filter(Boolean)
  ] as SectorMapNode[];

  const dynamicNode = buildMapNode(layout.dynamicSector, getDynamicSectorMapSlot(layout.dynamicSector), "dynamic");

  const peripheralNodes = layout.peripheralSectors.map((sector, index) =>
    buildMapNode(sector, peripheralSectorMapSlots[index % peripheralSectorMapSlots.length], "peripheral")
  );

  const nodes = [...fixedNodes, dynamicNode, ...peripheralNodes];
  const nodesBySlug = new Map(nodes.map((node) => [node.sector.slug, node]));
  const seenRoutes = new Set<string>();

  const routes = nodes.flatMap((node) =>
    node.sector.relatedSlugs
      .map((slug) => {
        const target = nodesBySlug.get(slug);

        if (!target) {
          return null;
        }

        const pairId = [node.sector.slug, target.sector.slug].sort().join("::");

        if (seenRoutes.has(pairId)) {
          return null;
        }

        seenRoutes.add(pairId);

        return {
          id: pairId,
          from: node,
          to: target,
          emphasis:
            node.anchorKind === "fixed" && target.anchorKind === "fixed"
              ? "primary"
              : "secondary"
        } satisfies SectorMapRoute;
      })
      .filter(Boolean)
  ) as SectorMapRoute[];

  return {
    nodes,
    routes,
    zoneLabels: sectorMapZoneLabels
  };
}

export function findSectorsForAsset(sectors: ThemeSector[], href: string) {
  return sectors.filter((sector) => sector.assets.some((asset) => asset.href === href));
}

export function resolveAssetSectorContext(sectors: ThemeSector[], href: string): AssetSectorContext {
  const relatedSectors = findSectorsForAsset(sectors, href);

  return {
    relatedSectors,
    primarySector: relatedSectors[0]
  };
}

export function getCarrierSectors(
  sectors: ThemeSector[],
  kind: "post" | "research" | "lab",
  limit = 3
) {
  return sectors
    .filter((sector) => sector.assets.some((asset) => asset.kind === kind))
    .sort((left, right) => right.assets.filter((asset) => asset.kind === kind).length - left.assets.filter((asset) => asset.kind === kind).length)
    .slice(0, limit);
}
