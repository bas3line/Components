import { Kicker } from "@/components/primitives/Kicker";
import { ScanIsland } from "@/components/scan-island/ScanIsland";
import type { Shot } from "./types";

// The still frame: the scanning plate shows its finished pass, every contour in deep mint.
export const shot: Shot = {};

export default function Demo() {
  return (
    <div className="bg-bg bg-dots px-5 py-10 sm:px-12 sm:py-12">
      <div className="grid gap-10 lg:grid-cols-2">
        <figure className="flex min-w-0 flex-col gap-4">
          <Kicker pixel="peri">Idle</Kicker>
          <ScanIsland />
          <figcaption className="font-mono text-[11px] leading-relaxed text-ink-3">
            &lt;ScanIsland /&gt; · walkers stroll up, LEDs blink slow
          </figcaption>
        </figure>
        <figure className="flex min-w-0 flex-col gap-4">
          <Kicker>Scanning</Kicker>
          <ScanIsland scanning label="U3–U4" />
          <figcaption className="font-mono text-[11px] leading-relaxed text-accent">
            &lt;ScanIsland scanning /&gt; · one sweep, the contours behind it turn deep mint
          </figcaption>
        </figure>
      </div>
    </div>
  );
}
