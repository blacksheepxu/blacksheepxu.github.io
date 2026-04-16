import { getLabEntries, getPosts, getResearchEntries } from "../content/posts";
import { buildSectorGraph, type SectorGraph } from "./sector-graph";

// Memoize the graph for the current production build/runtime process.
// Dev bypasses the cache so content edits are reflected immediately.
let sectorGraphPromise: Promise<SectorGraph> | undefined;

export function getSectorGraph() {
  const loadGraph = () =>
    Promise.all([getPosts(), getResearchEntries(), getLabEntries()]).then(([posts, researchEntries, labEntries]) =>
      buildSectorGraph({ posts, researchEntries, labEntries })
    );

  if (import.meta.env.DEV) {
    return loadGraph();
  }

  sectorGraphPromise ??= loadGraph();

  return sectorGraphPromise;
}
