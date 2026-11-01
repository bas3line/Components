import type { LatLon } from "./types";

/*
 * The nearest pin, guessed from the clock. Nothing leaves the browser: no IP
 * lookup, no geolocation prompt. The time zone puts "you" on the map and
 * great-circle distance picks the pin, except where a rule sends a zone (or a
 * whole tz area, such as "Africa") to a pin by hand.
 */

/** Where the clock puts the reader: `at` is null when the zone says nothing (UTC, say). */
export type Where = { zone: string; at: LatLon | null };
export type Guess = Where & { id: string | null };

/** Zone or tz area → pin id, for places better served than raw distance would say. */
export type GuessRules = Record<string, string>;

// Where a zone's own city is, so "you" lands there rather than on the area's rough latitude.
const HERE: Record<string, [number, number]> = {
  "America/New_York": [40.7, -74.0],
  "America/Detroit": [42.3, -83.0],
  "America/Chicago": [41.9, -87.6],
  "America/Denver": [39.7, -105.0],
  "America/Phoenix": [33.4, -112.1],
  "America/Los_Angeles": [34.1, -118.2],
  "America/Anchorage": [61.2, -149.9],
  "America/Toronto": [43.7, -79.4],
  "America/Halifax": [44.6, -63.6],
  "America/St_Johns": [47.6, -52.7],
  "America/Winnipeg": [49.9, -97.1],
  "America/Regina": [50.4, -104.6],
  "America/Edmonton": [53.5, -113.5],
  "America/Vancouver": [49.3, -123.1],
  "America/Mexico_City": [19.4, -99.1],
  "America/Havana": [23.1, -82.4],
  "America/Panama": [9.0, -79.5],
  "America/Puerto_Rico": [18.5, -66.1],
  "America/Bogota": [4.7, -74.1],
  "America/Caracas": [10.5, -66.9],
  "America/Lima": [-12.0, -77.0],
  "America/Santiago": [-33.4, -70.6],
  "America/Sao_Paulo": [-23.5, -46.6],
  "America/Argentina/Buenos_Aires": [-34.6, -58.4],
  "America/Buenos_Aires": [-34.6, -58.4],
  "Pacific/Honolulu": [21.3, -157.9],
  "Atlantic/Reykjavik": [64.1, -21.9],
  "Atlantic/Azores": [37.7, -25.7],
  "Atlantic/Canary": [28.1, -15.4],
  "Europe/London": [51.5, -0.1],
  "Europe/Dublin": [53.3, -6.3],
  "Europe/Lisbon": [38.7, -9.1],
  "Europe/Madrid": [40.4, -3.7],
  "Europe/Paris": [48.9, 2.4],
  "Europe/Brussels": [50.8, 4.4],
  "Europe/Amsterdam": [52.4, 4.9],
  "Europe/Luxembourg": [49.6, 6.1],
  "Europe/Zurich": [47.4, 8.5],
  "Europe/Berlin": [52.5, 13.4],
  "Europe/Copenhagen": [55.7, 12.6],
  "Europe/Oslo": [59.9, 10.8],
  "Europe/Stockholm": [59.3, 18.1],
  "Europe/Helsinki": [60.2, 24.9],
  "Europe/Rome": [41.9, 12.5],
  "Europe/Vienna": [48.2, 16.4],
  "Europe/Prague": [50.1, 14.4],
  "Europe/Warsaw": [52.2, 21.0],
  "Europe/Budapest": [47.5, 19.0],
  "Europe/Belgrade": [44.8, 20.5],
  "Europe/Bucharest": [44.4, 26.1],
  "Europe/Sofia": [42.7, 23.3],
  "Europe/Athens": [38.0, 23.7],
  "Europe/Istanbul": [41.0, 29.0],
  "Europe/Kyiv": [50.5, 30.5],
  "Europe/Kiev": [50.5, 30.5],
  "Europe/Minsk": [53.9, 27.6],
  "Europe/Moscow": [55.8, 37.6],
  "Africa/Casablanca": [33.6, -7.6],
  "Africa/Lagos": [6.5, 3.4],
  "Africa/Cairo": [30.0, 31.2],
  "Africa/Nairobi": [-1.3, 36.8],
  "Africa/Johannesburg": [-26.2, 28.0],
  "Asia/Jerusalem": [31.8, 35.2],
  "Asia/Riyadh": [24.7, 46.7],
  "Asia/Tehran": [35.7, 51.4],
  "Asia/Dubai": [25.2, 55.3],
  "Asia/Karachi": [24.9, 67.0],
  "Asia/Tashkent": [41.3, 69.2],
  "Asia/Kolkata": [22.6, 88.4],
  "Asia/Calcutta": [22.6, 88.4],
  "Asia/Dhaka": [23.8, 90.4],
  "Asia/Bangkok": [13.8, 100.5],
  "Asia/Ho_Chi_Minh": [10.8, 106.7],
  "Asia/Jakarta": [-6.2, 106.8],
  "Asia/Kuala_Lumpur": [3.1, 101.7],
  "Asia/Singapore": [1.35, 103.8],
  "Asia/Manila": [14.6, 121.0],
  "Asia/Hong_Kong": [22.3, 114.2],
  "Asia/Shanghai": [31.2, 121.5],
  "Asia/Taipei": [25.0, 121.6],
  "Asia/Seoul": [37.6, 127.0],
  "Asia/Tokyo": [35.7, 139.7],
  "Australia/Perth": [-31.95, 115.9],
  "Australia/Brisbane": [-27.5, 153.0],
  "Australia/Sydney": [-33.9, 151.2],
  "Australia/Melbourne": [-37.8, 145.0],
  "Pacific/Auckland": [-36.8, 174.8],
};
// A rough latitude for each tz area; longitude comes from the UTC offset.
const AREA_LAT: Record<string, number> = {
  Europe: 50,
  America: 15,
  Canada: 50,
  Atlantic: 30,
  Africa: 5,
  Asia: 30,
  Indian: -20,
  Australia: -30,
  Pacific: -15,
  Antarctica: -75,
  Arctic: 78,
};

/** Great-circle distance in radians. */
export function arc(lat1: number, lon1: number, lat2: number, lon2: number) {
  const r = Math.PI / 180;
  const a =
    Math.sin(((lat2 - lat1) * r) / 2) ** 2 +
    Math.cos(lat1 * r) * Math.cos(lat2 * r) * Math.sin(((lon2 - lon1) * r) / 2) ** 2;
  return 2 * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** The pin closest to a point. */
export function closest(pins: readonly ({ id: string } & LatLon)[], lat: number, lon: number) {
  let id: string | null = null;
  let reach = Infinity;
  for (const p of pins) {
    const d = arc(lat, lon, p.lat, p.lon);
    if (d < reach) {
      reach = d;
      id = p.id;
    }
  }
  return id;
}

/** A zone's UTC offset in hours on a given day, read from Intl ("GMT+05:30"). */
function offsetOn(zone: string, day: Date) {
  const name =
    new Intl.DateTimeFormat("en-US", { timeZone: zone, timeZoneName: "longOffset" })
      .formatToParts(day)
      .find((p) => p.type === "timeZoneName")?.value ?? "";
  const m = /([+-])(\d{1,2}):?(\d{2})?/.exec(name);
  return m ? (m[1] === "-" ? -1 : 1) * (Number(m[2]) + Number(m[3] ?? 0) / 60) : 0;
}

/**
 * Where the clock puts the reader: the zone's own city when it is a known one,
 * else the area's rough latitude at the longitude of the UTC offset. Pass a
 * zone to guess for it instead of the reader's.
 */
export function guessWhere(timeZone?: string): Where {
  let zone = timeZone ?? "";
  if (!timeZone) {
    try {
      zone = Intl.DateTimeFormat().resolvedOptions().timeZone ?? "";
    } catch {
      zone = "";
    }
  }
  const area = zone.split("/")[0];
  // UTC says nothing about where someone is, and Tor Browser reports it on purpose.
  const lat = AREA_LAT[area];
  const here = HERE[zone];
  if (here) return { zone, at: { lat: here[0], lon: here[1] } };
  if (lat === undefined) return { zone, at: null };
  // The standard offset is the smaller of January's and July's, so summer time doesn't move the guess.
  const y = new Date().getFullYear();
  let off: number;
  try {
    off = timeZone
      ? Math.min(offsetOn(zone, new Date(Date.UTC(y, 0, 1))), offsetOn(zone, new Date(Date.UTC(y, 6, 1))))
      : -Math.max(new Date(y, 0, 1).getTimezoneOffset(), new Date(y, 6, 1).getTimezoneOffset()) / 60;
  } catch {
    return { zone, at: null };
  }
  return { zone, at: { lat, lon: Math.max(-180, Math.min(180, off * 15)) } };
}

/** The pin a rule names for this zone, else the nearest to where the zone puts you. */
export function nearestTo(pins: readonly ({ id: string } & LatLon)[], where: Where, rules?: GuessRules) {
  const rule = rules?.[where.zone] ?? rules?.[where.zone.split("/")[0]];
  if (rule && pins.some((p) => p.id === rule)) return rule;
  return where.at ? closest(pins, where.at.lat, where.at.lon) : null;
}

/**
 * Guesses the reader's nearest pin from the time zone. Browser only: call it
 * after mount (or through useSyncExternalStore), never in a server render.
 */
export function guessNearest(
  pins: readonly ({ id: string } & LatLon)[],
  { rules, timeZone }: { rules?: GuessRules; timeZone?: string } = {},
): Guess {
  const where = guessWhere(timeZone);
  return { ...where, id: nearestTo(pins, where, rules) };
}

// One guess per zone for the page's life, so useSyncExternalStore sees a stable snapshot.
const cache = new Map<string, Where>();
export function readWhere(timeZone?: string) {
  const key = timeZone ?? "";
  let where = cache.get(key);
  if (!where) {
    where = guessWhere(timeZone);
    cache.set(key, where);
  }
  return where;
}
export const noWhere = () => null;
export const subscribe = () => () => {};
