export interface ThemeDefinition {
  id: string;
  title: string;
  shortLabel: string;
  capability: "content" | "command";
  default?: boolean;
}

export const themeRegistry = [
  {
    id: "default",
    title: "默认主题",
    shortLabel: "默认",
    capability: "content",
    default: true
  },
  {
    id: "strategy",
    title: "策略主题",
    shortLabel: "策略",
    capability: "command"
  }
] as const satisfies readonly ThemeDefinition[];

export type ThemeId = (typeof themeRegistry)[number]["id"];
export type ThemeCapability = ThemeDefinition["capability"];

export const defaultTheme = themeRegistry.find((theme) => ("default" in theme && theme.default) || theme.id === "default") ?? themeRegistry[0];
export const defaultThemeId: ThemeId = defaultTheme.id;
export const strategyThemeId: ThemeId = "strategy";

export function isKnownTheme(themeId: string): themeId is ThemeId {
  return themeRegistry.some((theme) => theme.id === themeId);
}

export function getThemeById(themeId: string): ThemeDefinition | undefined {
  return themeRegistry.find((theme) => theme.id === themeId);
}

export function getThemeMeta(themeId: string): ThemeDefinition {
  return getThemeById(themeId) ?? defaultTheme;
}

export function getThemeCapability(themeId: string): ThemeCapability {
  return getThemeMeta(themeId).capability;
}

export function getNextThemeId(currentThemeId: string) {
  const currentIndex = themeRegistry.findIndex((theme) => theme.id === currentThemeId);

  if (currentIndex === -1) {
    return defaultThemeId;
  }

  return themeRegistry[(currentIndex + 1) % themeRegistry.length].id;
}
