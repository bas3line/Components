/** A side of a marker a chip can hang on. */
export type Side = "n" | "s" | "e" | "w";

/** A geographic window, in degrees. */
export type Bounds = { west: number; east: number; north: number; south: number };

export type LatLon = { lat: number; lon: number };

export type DotMapPin = {
  id: string;
  /** The place name on its chip and in the list. */
  label: string;
  lat: number;
  lon: number;
  /** A short code in front of the label (an airport or region code). On a narrow inset it stands alone. */
  code?: string;
  /** A pink tag on the chip and a pink frame round the marker, for the one pin that is different. */
  tag?: string;
  /** The sides of its marker the chip tries first; it moves when those are taken. */
  sides?: Side[];
};

export type DotMapInset = {
  /** Names the inset, on its corner and on the tab over its bracket. */
  label: string;
  /** The pins inside these bounds move to the inset, and its window never leaves them. */
  bounds: Bounds;
  /** Where the inset centres; the middle of its pins by default. */
  center?: LatLon;
};
