/** The flat colours a line can mark its tag and filter chip with. */
export type BladePixel = "mint" | "lime" | "pink" | "peri";

/** A product line: one filter chip, one pixel colour. */
export type BladeLine = {
  id: string;
  name: string;
  pixel?: BladePixel;
  /** Shown under the filter while this line is picked. */
  note?: string;
  /**
   * Featured lines rack first, as slate blades. In the rows layout they sit
   * under a lime band carrying `tagline`, `band` and `link`.
   */
  featured?: boolean;
  tagline?: string;
  band?: string;
  link?: { label: string; href: string };
};

/** A spec column: its header, and from xl the width of its track in the one-line rows. */
export type BladeColumn = {
  /** Matches the keys of each plan's `specs`. */
  key: string;
  label: string;
  /** A grid track for the xl rows, e.g. "minmax(6rem,0.6fr)". */
  track?: string;
  /** Said after a bare core count on phones in the tiers layout, e.g. "vCPU". Defaults to the label. */
  unit?: string;
};

/**
 * One spec value. A string, or a value with a small second line (`sub`), a
 * core map (`cores`, one lit pixel per core) and a chip (`badge`).
 */
export type BladeSpec = string | { value: string; sub?: string; cores?: number; badge?: string };

export type BladePlan = {
  id: string;
  name: string;
  /** The id of its line. */
  line: string;
  /** Keyed by column key. */
  specs: Record<string, BladeSpec>;
  price: number;
  /** Overrides the rack's period for this plan, e.g. { short: "/hr", long: "per hour" }. */
  period?: BladePeriod;
  href?: string;
  /** Out of stock plans sit dark, with a hatched plate where the button was. Defaults to true. */
  inStock?: boolean;
  /** A lime tag beside the line name, e.g. "start here". In the tiers layout it turns the button lime too. */
  tag?: string;
  /** One line under the name in the tiers layout, e.g. the CPU model. */
  detail?: string;
};

/** A group of plans: one tab. Usually a location. */
export type BladeGroup = {
  id: string;
  name: string;
  /** A short code boxed over the name, e.g. "AMS". */
  code?: string;
  /** Printed beside the code, e.g. the country. */
  region?: string;
  note?: string;
  plans: BladePlan[];
};

export type BladePeriod = { short: string; long: string };

export type BladeLabels = {
  /** Over the tabs. */
  groups: string;
  /** The plural in the footer: "48 across all 3 locations". */
  groupsNoun: string;
  /** The filter's legend. */
  line: string;
  all: string;
  /** "from $6.40" under each tab. */
  from: string;
  inStock: string;
  soldOut: string;
  /** The button. */
  action: string;
  planHeader: string;
  priceHeader: string;
  /** Over the plans that are not featured, when featured ones are racked above them. */
  standard: string;
};
