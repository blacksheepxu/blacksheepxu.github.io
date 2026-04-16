import { describe, expect, it } from "vitest";
import {
  defaultThemeId,
  getNextThemeId,
  getThemeCapability,
  getThemeMeta,
  themeRegistry
} from "../../src/lib/theme/theme-registry";

describe("theme registry", () => {
  it("exposes a stable default content capability", () => {
    expect(defaultThemeId).toBe("default");
    expect(getThemeCapability(defaultThemeId)).toBe("content");
  });

  it("falls back to the default theme meta for unknown ids", () => {
    const meta = getThemeMeta("unknown-theme");

    expect(meta.id).toBe(defaultThemeId);
    expect(meta.capability).toBe("content");
  });

  it("cycles through the registered themes in order", () => {
    const cycledThemeIds = themeRegistry.map((theme) => theme.id);

    expect(getNextThemeId("default")).toBe(cycledThemeIds[1]);
    expect(getNextThemeId(cycledThemeIds[cycledThemeIds.length - 1])).toBe(defaultThemeId);
  });
});
