import { BootChain } from "@/components/boot-chain/BootChain";
import { Kicker } from "@/components/primitives/Kicker";
import type { Shot } from "./types";

export const shot: Shot = {};

export default function Demo() {
  return (
    <div className="bg-night px-5 py-10 [--dot:var(--night-line)] sm:px-8 sm:py-12">
      <Kicker tone="night" pixel="peri">
        Measured boot
      </Kicker>
      <h2 className="mt-4 max-w-[46rem] font-display text-[clamp(1.875rem,3.6vw,2.75rem)] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance text-mint-pale">
        Check the machine before you hand it a secret.
      </h2>
      <p className="mt-4 max-w-[52rem] text-[17px] leading-relaxed text-pretty text-white/72">
        Everything that boots folds into one signed digest, and the key goes out only after you check it.
      </p>
      <BootChain className="mt-9" />
    </div>
  );
}
