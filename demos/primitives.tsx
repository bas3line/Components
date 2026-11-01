import { Kicker } from "@/components/primitives/Kicker";
import { NotchButton } from "@/components/primitives/NotchButton";
import type { Shot } from "./types";

export const shot: Shot = {};

export default function Demo() {
  return (
    <div className="grid sm:grid-cols-2">
      <div className="flex flex-col items-start gap-7 bg-bg px-8 py-12 sm:px-12">
        <Kicker>On paper</Kicker>
        <div className="flex flex-wrap gap-3">
          <NotchButton href="#" size="lg">
            Deploy a server
          </NotchButton>
          <NotchButton href="#" size="lg" tone="ink">
            See the plans
          </NotchButton>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <NotchButton>Primary</NotchButton>
          <NotchButton tone="ink">Secondary</NotchButton>
          <Kicker pixel="pink">pink</Kicker>
          <Kicker pixel="peri">peri</Kicker>
        </div>
      </div>
      <div className="flex flex-col items-start gap-7 bg-night px-8 py-12 sm:px-12">
        <Kicker tone="night" pixel="lime">
          On night
        </Kicker>
        <div className="flex flex-wrap gap-3">
          <NotchButton href="#" size="lg" tone="lime">
            Start one now
          </NotchButton>
          <NotchButton href="#" size="lg" tone="mint" arrow={false}>
            No arrow
          </NotchButton>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <NotchButton tone="lime">Primary</NotchButton>
          <Kicker tone="night">mint</Kicker>
          <Kicker tone="night" pixel="pink">
            pink
          </Kicker>
        </div>
      </div>
    </div>
  );
}
