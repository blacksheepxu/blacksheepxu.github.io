# 2026-04-18 Project Handoff

## Current State

This Astro site is no longer just a rebuilt personal blog. The current shipped product is:

- a default theme that acts as the main personal AI research website
- a strategy theme that acts as an expert, sector-first command view
- a multi-theme system with governance rules, checklists, and Playwright coverage

The latest completed work recalibrated the strategy theme so it behaves more like an expert view of the same site, not a louder second product. That calibration shipped:

- shared shell/navigation cues that clarify the current theme role
- homepage command-flow simplification by removing teaching-style protocol steps
- density-aware `research` / `lab` carrier surfaces
- lightweight `Carrier Route` context on detail pages
- updated governance docs and browser coverage

## Source of Truth

Read these in order if you need the shortest accurate picture of the project:

1. `docs/brainstorms/2026-04-14-astro-ai-research-site-requirements.md`
   This is the original product brief for the whole site.

2. `docs/brainstorms/2026-04-15-strategy-interface-theme-requirements.md`
   This defines what the strategy theme is supposed to be at a product level.

3. `docs/brainstorms/2026-04-17-strategy-theme-product-calibration-requirements.md`
   This captures the later correction: strategy theme is an expert view, not the main product.

4. `docs/plans/2026-04-16-001-feat-sector-command-theme-governance-plan.md`
   This is the main strategy-theme execution plan that replaced the earlier lighter plan.

5. `docs/plans/2026-04-17-001-refactor-strategy-theme-product-calibration-plan.md`
   This is the latest completed plan and the best current guide to the most recent changes.

6. `docs/theme-maintenance.md`
   This is the main long-term maintenance contract for multi-theme work.

7. `docs/checklists/theme-code-change-checklist.md`
   Use before code changes touching theme/shell/strategy surfaces.

8. `docs/checklists/theme-content-update-checklist.md`
   Use before content changes that may affect sectors, heat, or carrier density.

## Documents to Treat as Historical

- `docs/plans/2026-04-15-001-feat-strategy-interface-theme-plan.md`
  Historical first-pass strategy plan. Do not use as the execution entrypoint anymore.

- `docs/plans/2026-04-15-002-blog-strategy-visual-plan.md`
  Historical visual exploration doc. Useful for archaeology only, not for current execution.

## Current Code Areas That Matter Most

- `src/layouts/BaseLayout.astro`
- `src/components/site/Header.astro`
- `src/components/home/HomeCommandViews.astro`
- `src/components/home/SectorCommandNetwork.astro`
- `src/components/sectors/SectorModeSwitcher.astro`
- `src/components/research/ResearchModeSwitcher.astro`
- `src/components/research/ResearchMapView.astro`
- `src/pages/lab/index.astro`
- `src/components/site/ArticleShell.astro`
- `src/components/site/EntryDetailShell.astro`
- `src/styles/global.css`

## What Is Actually Shipped

- Strategy homepage is sector-first and map-first.
- Sector pages are the default next step after homepage selection.
- `research` is currently a compact carrier surface with only one true primary track.
- `lab` is currently a compact interaction carrier, not a full experiment control center.
- Detail pages are reading-first dossier shells with light strategy context.

## Open Reality Checks

These are not formal blockers, but they should shape future work:

- `research` and `lab` still have thin real content density.
- The strategy theme should keep getting clearer, not heavier.
- New work should avoid drifting back into “make it more game-like” without checking whether it still serves the research-site product.

## Recommended Starting Point for a New Session

If you are continuing strategy-theme work, start by saying:

“Use `docs/handoffs/2026-04-18-project-handoff.md` as the session entrypoint. Treat `docs/brainstorms/2026-04-17-strategy-theme-product-calibration-requirements.md`, `docs/plans/2026-04-17-001-refactor-strategy-theme-product-calibration-plan.md`, and `docs/theme-maintenance.md` as the current source of truth. Ignore superseded or archived strategy docs unless needed for archaeology.”

## Suggested Next Work Themes

- Add or refine strategy-aware wayfinding without breaking route stability
- Reassess `research` / `lab` surfaces as real content density grows
- Improve detail-page strategy context only if it still preserves reading priority
- Keep governance docs and Playwright coverage in sync with any shell or strategy changes
