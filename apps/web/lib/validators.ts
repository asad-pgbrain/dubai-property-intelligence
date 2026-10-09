export function isValidAreaName(name: unknown): name is string {
  if (typeof name !== "string") return false;
  if (name.length === 0 || name.length > 100) return false;
  return /^[a-zA-Z0-9\s\-'&.]+$/.test(name);
}

export function isValidSearchQuery(q: unknown): q is string {
  if (typeof q !== "string") return false;
  if (q.length > 100) return false;
  return q === "" || /^[a-zA-Z0-9\s\-'&.]+$/.test(q);
}

const VALID_PROPERTY_TYPES = ["Unit", "Building", "Land"];
export function isValidPropertyType(type: unknown): boolean {
  if (type == null) return true;
  if (typeof type !== "string") return false;
  return VALID_PROPERTY_TYPES.includes(type);
}

const VALID_ROOMS = [
  "Studio",
  "1 B/R",
  "2 B/R",
  "3 B/R",
  "4 B/R",
  "5 B/R",
  "6 B/R",
  "7 B/R",
  "8 B/R",
  "9 B/R",
  "PENTHOUSE",
  "Office",
  "Shop",
  "Hotel",
];
export function isValidRooms(rooms: unknown): boolean {
  if (rooms == null) return true;
  if (typeof rooms !== "string") return false;
  return VALID_ROOMS.includes(rooms);
}

export function isValidNumber(
  value: unknown,
  min: number,
  max: number
): boolean {
  if (value == null) return true;
  const n = typeof value === "number" ? value : parseFloat(String(value));
  if (isNaN(n)) return false;
  return n >= min && n <= max;
}

export function isValidSizeSqm(size: unknown): boolean {
  return isValidNumber(size, 10, 2000);
}

export function isValidAskingPrice(price: unknown): boolean {
  return isValidNumber(price, 10000, 500000000);
}

export function parseLimit(
  value: string | null,
  defaultVal: number,
  max: number
): number {
  if (!value) return defaultVal;
  const n = parseInt(value, 10);
  if (isNaN(n) || n < 1) return defaultVal;
  return Math.min(n, max);
}

export function isValidSlug(slug: unknown): slug is string {
  if (typeof slug !== "string") return false;
  if (slug.length === 0 || slug.length > 100) return false;
  return /^[a-z0-9\-]+$/.test(slug);
}
