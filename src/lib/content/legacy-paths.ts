export interface LegacyRouteParams {
  year: string;
  month: string;
  day: string;
  slug: string;
}

export function legacyUrlToParams(legacyUrl: string): LegacyRouteParams {
  const match = legacyUrl.match(/^\/(?<year>\d{4})\/(?<month>\d{2})\/(?<day>\d{2})\/(?<slug>.+?)\/?$/);

  if (!match?.groups) {
    throw new Error(`Invalid legacy URL: ${legacyUrl}`);
  }

  return {
    year: match.groups.year,
    month: match.groups.month,
    day: match.groups.day,
    slug: decodeURIComponent(match.groups.slug)
  };
}

export function legacyUrlToPath(legacyUrl: string): string {
  const params = legacyUrlToParams(legacyUrl);
  return `/${params.year}/${params.month}/${params.day}/${params.slug}/`;
}

