import { DotMap } from "@/components/dot-map/DotMap";
import { Kicker } from "@/components/primitives/Kicker";
import type { Shot } from "./types";

export const shot: Shot = {};

export default function Demo() {
  return (
    <div className="bg-night px-4 py-8 sm:px-10 sm:py-10">
      <div className="mb-7 flex flex-wrap items-end justify-between gap-x-12 gap-y-4">
        <div>
          <Kicker tone="night" pixel="lime">
            Dot map
          </Kicker>
          <h2 className="mt-3 font-display text-[28px] leading-[1.05] font-bold tracking-[-0.03em] text-mint-pale sm:text-[36px]">
            Nine cities, drawn in dots.
          </h2>
        </div>
        <p className="max-w-[25rem] border-l-2 border-pink pl-4 text-[15px] leading-relaxed text-white/80">
          Hover a marker or a chip. Your time zone picks the nearest city, right here in the browser.
        </p>
      </div>
      <DotMap />
    </div>
  );
}
