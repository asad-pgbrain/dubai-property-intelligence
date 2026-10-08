/**
 * Area name aliases — maps common search names to official DLD names.
 *
 * Why: Users search "Dubai South" but DLD calls it "MADINAT AL MATAAR".
 * Without aliases, we don't rank for the search terms people actually use.
 */

// DLD name (uppercase) → array of common aliases (lowercase for matching)
export const AREA_ALIASES: Record<string, string[]> = {
  "MADINAT AL MATAAR": ["dubai south", "dubai south city", "expo city", "expo 2020"],
  "BURJ KHALIFA": ["downtown dubai", "downtown", "burj area"],
  "JUMEIRAH BEACH RESIDENCE": ["jbr", "jumeirah beach resid"],
  "JUMEIRAH LAKES TOWERS": ["jlt", "jumeirah lake towers"],
  "DUBAI INTERNATIONAL FINANCIAL CENTRE": ["difc"],
  "DUBAI SILICON OASIS": ["dso", "silicon oasis"],
  "DUBAI MOTOR CITY": ["motor city"],
  "DUBAI SPORTS CITY": ["sports city", "dsc"],
  "DUBAI INTERNET CITY": ["internet city", "dic"],
  "DUBAI MEDIA CITY": ["media city", "dmc"],
  "MARSA DUBAI": ["dubai marina", "marina", "marsa dubai", "dubai marina mall area"],
  "PALM JUMEIRAH": ["palm", "the palm", "palm islands"],
  "BUSINESS BAY": ["business bay"],
  "JUMEIRAH VILLAGE CIRCLE": ["jvc", "village circle"],
  "JUMEIRAH VILLAGE TRIANGLE": ["jvt", "village triangle"],
  "ARJAN": ["arjan"],
  "AL BARSHA": ["barsha", "al barsha 1", "al barsha south"],
  "DEIRA": ["deira"],
  "BUR DUBAI": ["bur dubai"],
  "DUBAI LAND RESIDENCE COMPLEX": ["dubailand", "dubai land", "dlrc"],
  "AL FURJAN": ["furjan", "al furjan"],
  "DUBAI HILLS ESTATE": ["dubai hills", "dhe"],
  "DUBAI CREEK HARBOUR": ["creek harbour", "dch"],
  "MOHAMMED BIN RASHID CITY": ["mbc", "mbr city"],
  "TOWN SQUARE": ["town square"],
  "DUBAI PRODUCTION CITY": ["production city", "impz"],
  "INTERNATIONAL CITY": ["international city", "ic"],
  "DUBAI HEALTHCARE CITY": ["healthcare city", "dhcc"],
  "DUBAI MARITIME CITY": ["maritime city"],
  "DUBAI INDUSTRIAL CITY": ["industrial city"],
  "AL KHAIL HEIGHTS": ["al khail", "akh"],
  "DUBAI SCIENCE PARK": ["science park"],
  "DUBAI DESIGN DISTRICT": ["d3", "design district"],
};

/**
 * Reverse lookup: given a search query (lowercase), return matching DLD names.
 */
export function findAreasByAlias(query: string): string[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  const matches: string[] = [];

  for (const [dldName, aliases] of Object.entries(AREA_ALIASES)) {
    // Match against DLD name itself
    if (dldName.toLowerCase().includes(q)) {
      matches.push(dldName);
      continue;
    }
    // Match against aliases
    if (aliases.some((a) => a.includes(q) || q.includes(a))) {
      matches.push(dldName);
    }
  }

  return matches;
}

/**
 * Get all aliases for a given DLD name (for display purposes).
 */
export function getAliasesForArea(dldName: string): string[] {
  const upper = dldName.toUpperCase();
  return AREA_ALIASES[upper] || [];
}

/**
 * Get display name for an area — includes primary alias if exists.
 * Example: "MADINAT AL MATAAR" → "Dubai South (Madinat Al Mataar)"
 */
export function getDisplayNameWithAlias(dldName: string): {
  primary: string;
  alias: string | null;
  display: string;
} {
  const upper = dldName.toUpperCase();
  const aliases = AREA_ALIASES[upper];

  const titleCase = (s: string) =>
    s.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());

  if (!aliases || aliases.length === 0) {
    return {
      primary: titleCase(dldName),
      alias: null,
      display: titleCase(dldName),
    };
  }

  const primaryAlias = titleCase(aliases[0]);
  const dldTitle = titleCase(dldName);

  return {
    primary: primaryAlias,
    alias: dldTitle,
    display: `${primaryAlias} (${dldTitle})`,
  };
}
