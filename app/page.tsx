import Link from "next/link";
import type { ComponentType } from "react";
import { Kicker } from "@/components/primitives/Kicker";
import BladeRack from "@/demos/blade-rack";
import BootChain from "@/demos/boot-chain";
import DotMap from "@/demos/dot-map";
import Primitives from "@/demos/primitives";
import RackModules from "@/demos/rack-modules";
import ScanIsland from "@/demos/scan-island";
import ServerIsland from "@/demos/server-island";
import ServerRack from "@/demos/server-rack";
import TypedTerminal from "@/demos/typed-terminal";
import WindowRace from "@/demos/window-race";
import { registry } from "@/registry";

const REPO = "https://github.com/bas3line/Components";

const DEMOS: Record<string, ComponentType> = {
  "server-island": ServerIsland,
  "server-rack": ServerRack,
  "scan-island": ScanIsland,
  "typed-terminal": TypedTerminal,
  "boot-chain": BootChain,
  "blade-rack": BladeRack,
  "dot-map": DotMap,
  "rack-modules": RackModules,
  "window-race": WindowRace,
  primitives: Primitives,
};

/** The gallery: every demo, top to bottom, each with where its source lives. */
export default function Home() {
  return (
    <main className="mx-auto w-full max-w-[1328px] px-0 pb-24 sm:px-6">
      <header className="px-5 pt-14 pb-12 sm:px-0 sm:pt-20">
        <Kicker>
          {registry.length} components · React · Tailwind · MIT
        </Kicker>
        <h1 className="mt-6 font-display text-[clamp(3rem,8vw,6.5rem)] leading-[0.92] font-extrabold tracking-[-0.045em] text-ink [font-variation-settings:'opsz'_96]">
          Components.
        </h1>
        <p className="mt-6 max-w-[40rem] text-[18px] leading-relaxed text-pretty text-ink-2">
          Servers, racks, terminals and maps, drawn in code with SVG and CSS (and a canvas for the map&rsquo;s dots). No
          images, no animation library: copy a folder from <code className="font-mono text-[15px]">components/</code> into
          your project and make it yours.
        </p>
        <a
          href={REPO}
          className="mt-6 inline-flex items-center gap-2 font-mono text-[13px] text-ink-2 underline decoration-line-2 underline-offset-4 hover:text-ink hover:decoration-ink"
        >
          github.com/bas3line/Components →
        </a>
      </header>

      <ol className="flex flex-col gap-16">
        {registry.map((entry, i) => {
          const Demo = DEMOS[entry.slug];
          return (
            <li key={entry.slug} id={entry.slug} className="scroll-mt-6">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2 border-t border-line-2 px-5 pt-4 pb-5 sm:px-0">
                <h2 className="flex items-baseline gap-3 font-mono text-[14px] text-ink">
                  <span className="text-ink-3">{String(i + 1).padStart(2, "0")}</span>
                  {entry.name}
                </h2>
                <p className="flex gap-5 font-mono text-[12px] text-ink-3">
                  {/* Link, so the GitHub Pages base path is added. */}
                  <Link href={`/preview/${entry.slug}`} className="hover:text-ink">
                    on its own →
                  </Link>
                  <a href={`${REPO}/tree/main/components/${entry.slug}`} className="hover:text-ink">
                    source →
                  </a>
                </p>
                <p className="w-full max-w-[52rem] text-[15px] leading-relaxed text-pretty text-ink-2">{entry.summary}</p>
              </div>
              <div className="overflow-hidden border-y border-line sm:border">
                <Demo />
              </div>
            </li>
          );
        })}
      </ol>
    </main>
  );
}
