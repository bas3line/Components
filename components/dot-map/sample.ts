import type { DotMapInset, DotMapPin } from "./types";

/** Nine cities: five across the world, and four close together in Europe that the inset enlarges. */
export const SAMPLE_PINS: DotMapPin[] = [
  { id: "yyz", code: "YYZ", label: "Toronto", lat: 43.65, lon: -79.38, sides: ["n", "w"] },
  { id: "bog", code: "BOG", label: "Bogotá", lat: 4.71, lon: -74.07, sides: ["e", "s"] },
  { id: "ams", code: "AMS", label: "Amsterdam", lat: 52.37, lon: 4.9, sides: ["w", "n"] },
  { id: "cph", code: "CPH", label: "Copenhagen", lat: 55.68, lon: 12.57, sides: ["e", "n"] },
  { id: "zrh", code: "ZRH", label: "Zurich", lat: 47.37, lon: 8.54, sides: ["s", "w"] },
  { id: "vie", code: "VIE", label: "Vienna", lat: 48.21, lon: 16.37, sides: ["e", "s"] },
  { id: "nbo", code: "NBO", label: "Nairobi", lat: -1.29, lon: 36.82, tag: "New", sides: ["w", "s"] },
  { id: "bom", code: "BOM", label: "Mumbai", lat: 19.08, lon: 72.88, sides: ["w", "s"] },
  { id: "hnd", code: "HND", label: "Tokyo", lat: 35.68, lon: 139.69, sides: ["w", "n"] },
];

/** The four European cities sit about 20px apart at world scale; the inset gives them room. */
export const SAMPLE_INSET: DotMapInset = {
  label: "Central Europe",
  bounds: { west: -12, east: 32, north: 62, south: 40 },
};
