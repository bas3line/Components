import { Kicker } from "@/components/primitives/Kicker";
import { ServerRack } from "@/components/server-rack/ServerRack";
import type { Shot } from "./types";

export const shot: Shot = {};

export default function Demo() {
  return (
    <div className="grid items-center gap-10 bg-night px-6 py-12 sm:px-12 sm:py-14 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-8 lg:py-12 lg:pr-10 lg:pl-16">
      <div className="min-w-0">
        <Kicker tone="night" pixel="lime">
          Server rack
        </Kicker>
        <h2 className="mt-6 font-display text-[clamp(2.5rem,5vw,4.25rem)] leading-[0.94] font-extrabold tracking-[-0.045em] text-balance text-lime">
          One server, out on its rails.
        </h2>
        <p className="mt-6 max-w-[28rem] text-[17px] leading-relaxed text-pretty text-paper/75">
          Nine units in isometric line art. The LEDs blink on their own clocks, and the mint one slides out when the
          rack scrolls into view.
        </p>
      </div>
      <ServerRack
        server={{ title: "U6 · ci-runner-03", detail: "8 vCPU · 32 GB · NVMe" }}
        rack={{ title: "rack 12 · cage 3", detail: "uplink 203.0.113.1" }}
      />
    </div>
  );
}
