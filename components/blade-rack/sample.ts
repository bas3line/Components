import type { BladeColumn, BladeGroup, BladeLine, BladePlan } from "./types";

// What `<BladeRack />` shows with no props: three regions, three lines, made-up
// plans and prices. Replace all of it with your own.

export const sampleColumns: BladeColumn[] = [
  { key: "cpu", label: "CPU", unit: "vCPU" },
  { key: "ram", label: "Memory" },
  { key: "disk", label: "Storage", track: "minmax(6.25rem,0.6fr)" },
  { key: "port", label: "Port", track: "minmax(4.75rem,0.5fr)" },
  { key: "transfer", label: "Transfer" },
];

export const sampleLines: BladeLine[] = [
  {
    id: "gpu",
    name: "GPU",
    pixel: "mint",
    featured: true,
    tagline: "A whole card per machine",
    band: "Each card is passed straight through to one guest: no time-slicing, no shared partitions. Transfer counts the busier direction only.",
    link: { label: "How GPU plans work", href: "#" },
    note: "One accelerator per machine, passed through whole over VFIO. The driver version is yours to pick.",
  },
  {
    id: "dedicated",
    name: "Dedicated",
    pixel: "peri",
    note: "Pinned cores that no other guest is ever scheduled on. Unmetered, with a routed IPv4.",
  },
  {
    id: "shared",
    name: "Shared",
    pixel: "pink",
    note: "Burstable cores on a busy host: the cheap way to keep a small service up. Unmetered.",
  },
];

export const sampleAllNote =
  "Shared plans burst, dedicated ones keep their cores, GPU ones get a whole card. Each has its own IPv4.";

export const sampleTerms = "Billed monthly, prorated to the day. Cancel from the panel whenever you like.";

/** Every made-up plan has a name, a line, its specs and a price; `more` flips stock, tags or a period. */
function plan(
  line: string,
  name: string,
  cores: number,
  cpu: string,
  ram: string,
  disk: string,
  port: string,
  price: number,
  more: Partial<BladePlan> & { badge?: string; transfer?: BladePlan["specs"][string] } = {},
): BladePlan {
  const { badge, transfer = "Unmetered", ...rest } = more;
  return {
    id: `${line}-${name.toLowerCase()}`,
    name,
    line,
    specs: { cpu: { value: `${cores} × ${cpu}`, cores, badge }, ram, disk, port, transfer },
    price,
    detail: badge ? `${cpu} · ${badge}` : cpu,
    ...rest,
  };
}

const ZEN = "EPYC 9354P";
const DESK = "Ryzen 9 7950X";

const G24 = (more: Partial<BladePlan> = {}) =>
  plan("gpu", "G-24", 8, ZEN, "64 GB DDR5", "1 TB NVMe", "10 Gbps", 148, {
    badge: "GPU 24 GB",
    transfer: { value: "20 TB", sub: "per 30 days" },
    ...more,
  });
const G48 = (more: Partial<BladePlan> = {}) =>
  plan("gpu", "G-48", 16, ZEN, "128 GB DDR5", "2 TB NVMe", "10 Gbps", 286, {
    badge: "GPU 48 GB",
    transfer: { value: "40 TB", sub: "per 30 days" },
    ...more,
  });

export const sampleGroups: BladeGroup[] = [
  {
    id: "ams",
    name: "Amsterdam",
    code: "AMS",
    region: "Netherlands",
    note: "Two halls on separate power feeds, a few milliseconds from most of western Europe.",
    plans: [
      G24({ tag: "start here" }),
      plan("shared", "S-4", 4, ZEN, "8 GB DDR5", "120 GB NVMe", "1 Gbps", 12.8),
      plan("dedicated", "D-8", 8, DESK, "32 GB DDR5", "500 GB NVMe", "1 Gbps", 54, { inStock: false }),
    ],
  },
  {
    id: "tyo",
    name: "Tokyo",
    code: "TYO",
    region: "Japan",
    note: "Close to the trans-Pacific cables, so the west coast of the Americas is a short hop as well.",
    plans: [
      plan("shared", "S-2", 2, ZEN, "4 GB DDR5", "60 GB NVMe", "1 Gbps", 6.4),
      plan("shared", "S-4", 4, ZEN, "8 GB DDR5", "120 GB NVMe", "1 Gbps", 12.8),
      plan("shared", "S-8", 8, ZEN, "16 GB DDR5", "240 GB NVMe", "1 Gbps", 24.6),
      plan("dedicated", "D-4", 4, DESK, "16 GB DDR5", "250 GB NVMe", "1 Gbps", 28.5, { inStock: false }),
    ],
  },
  {
    id: "yyz",
    name: "Toronto",
    code: "YYZ",
    region: "Canada",
    note: "Fed by two carriers on separate paths. A fair middle seat between both US coasts and Europe.",
    plans: [
      G24({ tag: "start here" }),
      G48(),
      plan("dedicated", "D-8", 8, DESK, "32 GB DDR5", "500 GB NVMe", "10 Gbps", 54),
      plan("dedicated", "D-16", 16, DESK, "64 GB DDR5", "1 TB NVMe", "10 Gbps", 96),
      plan("shared", "S-2", 2, ZEN, "4 GB DDR5", "60 GB NVMe", "1 Gbps", 6.4),
    ],
  },
];
