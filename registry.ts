// Every component in the collection, in the order the gallery and the README show them.
// `slug` is its folder under components/, its demo under demos/ and its page under app/preview/.

export type Entry = {
  slug: string;
  /** The main export. */
  name: string;
  summary: string;
};

export const registry: Entry[] = [
  {
    slug: "server-island",
    name: "ServerIsland",
    summary: "An isometric island in contour lines with a server rack on its summit, and label chips hanging off it on dashed wires.",
  },
  {
    slug: "server-rack",
    name: "ServerRack",
    summary: "A rack in isometric line art: one mint server slides out on its rails, with callout cards off it and the roof.",
  },
  {
    slug: "scan-island",
    name: "ScanIsland",
    summary: "A two-unit server on a contour island, with a mint scan that sweeps across it while something is being checked.",
  },
  {
    slug: "typed-terminal",
    name: "TypedTerminal",
    summary: "A terminal that plays a scripted session when it scrolls into view: typed commands, output, a masked passphrase, verdicts.",
  },
  {
    slug: "boot-chain",
    name: "BootChain",
    summary: "A chain of trust as a wiring diagram: inputs onto one bus, then stages with a hash, a chip, a check and a PASS.",
  },
  {
    slug: "blade-rack",
    name: "BladeRack",
    summary: "A pricing table drawn as a rack: every plan is a 1U blade with screws, LEDs, specs, a price and a button.",
  },
  {
    slug: "dot-map",
    name: "DotMap",
    summary: "A world map in dots with labelled pins, an enlarged inset, and a guess at the reader's nearest pin from their time zone.",
  },
  {
    slug: "rack-modules",
    name: "RackModule",
    summary: "Feature cards drawn as rack units, each with a small animated UI mock-up for a face. Six faces come ready.",
  },
  {
    slug: "window-race",
    name: "WindowRace",
    summary: "Two windows racing from the same start: one types its way to a ready prompt, the other stalls in a long form.",
  },
  {
    slug: "primitives",
    name: "NotchButton, Kicker",
    summary: "The notched button and the pixel kicker label the other components are built with.",
  },
];
