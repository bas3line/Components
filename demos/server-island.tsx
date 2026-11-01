import { Kicker } from "@/components/primitives/Kicker";
import { NotchButton } from "@/components/primitives/NotchButton";
import { ServerIsland } from "@/components/server-island/ServerIsland";
import type { Shot } from "./types";

export const shot: Shot = {};

export default function Demo() {
  return (
    <div className="grid items-center gap-x-10 gap-y-10 bg-bg px-5 py-12 sm:px-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:py-14">
      <div>
        <Kicker>Drawn in code · SVG and CSS</Kicker>
        <h2 className="mt-6 font-display text-[clamp(2.8rem,5.6vw,5rem)] leading-[0.92] font-extrabold tracking-[-0.045em] text-balance text-ink [font-variation-settings:'opsz'_96]">
          A server on an island of its own.
        </h2>
        <p className="mt-6 max-w-[30rem] text-[17px] leading-relaxed text-pretty text-ink-2 sm:text-[18px]">
          Contour rings stacked into terraces, a sea that drifts, a boat in the shallows and a rack on the summit. Each
          chip hangs off its own wire, with a pixel running down it.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <NotchButton href="#" size="lg">
            Copy the component
          </NotchButton>
          <NotchButton href="#" size="lg" tone="ink">
            Read the props
          </NotchButton>
        </div>
      </div>
      <ServerIsland className="mx-auto max-w-[640px]" />
    </div>
  );
}
