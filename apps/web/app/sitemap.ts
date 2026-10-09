import type { MetadataRoute } from "next";

// Top 20 areas by transaction volume
const TOP_AREAS = [
  "madinat-al-mataar",
  "jumeirah-village-circle",
  "business-bay",
  "dubai-marina",
  "burj-khalifa",
  "al-barsha-south-fourth",
  "jabal-ali-first",
  "dubai-investment-park-first",
  "al-hebiah-first",
  "dubai-hills-estate",
  "al-yelayiss-1",
  "dubai-land-residence-complex",
  "majan",
  "arjan",
  "palm-deira",
  "al-furjan",
  "dubai-sports-city",
  "al-karama",
  "jumeirah-lakes-towers",
  "damac-hills",
];

const BEDROOMS = ["studio", "1br", "2br", "3br"];

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://dubai-property-intelligence-apps.vercel.app";
  const now = new Date();

  const basePages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/market`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/rents`, lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/areas`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/compare`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/calculators/rental-yield`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/reports`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/reports/q3-2026`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/methodology`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/how-we-make-money`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  ];

  const areaPages: MetadataRoute.Sitemap = TOP_AREAS.map((slug) => ({
    url: `${baseUrl}/areas/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  const bedroomPages: MetadataRoute.Sitemap = TOP_AREAS.flatMap((area) =>
    BEDROOMS.map((bed) => ({
      url: `${baseUrl}/areas/${area}/${bed}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    }))
  );

  return [...basePages, ...areaPages, ...bedroomPages];
}
