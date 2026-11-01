import { Kicker } from "@/components/primitives/Kicker";
import { TypedTerminal } from "@/components/typed-terminal/TypedTerminal";
import type { Shot } from "./types";

export const shot: Shot = {};

const KINDS = [
  { kind: "command", does: "typed key by key, then its comment" },
  { kind: "output", does: "printed whole, whitespace kept" },
  { kind: "secret", does: "a prompt, then masked keystrokes" },
  { kind: "ok", does: "a verdict that holds the beat" },
  { kind: "rule", does: "a dashed break between two parts" },
] as const;

export default function Demo() {
  return (
    <div className="bg-dots bg-night px-6 py-12 [--dot:var(--night-2)] sm:px-12 sm:py-16 lg:px-16">
      <div className="grid items-center gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)]">
        <div>
          <Kicker tone="night" pixel="lime">
            typed-terminal
          </Kicker>
          <h2 className="mt-4 font-display text-[clamp(2rem,4vw,3rem)] leading-[1.02] font-extrabold tracking-[-0.035em] text-balance text-mint-pale">
            A session that types itself.
          </h2>
          <p className="mt-4 max-w-[30rem] text-[16px] leading-relaxed text-pretty text-white/70">
            One script, one fixed timeline. It starts when the window scrolls into view, pauses when it leaves, and the
            badge in the title bar follows the lines that set it.
          </p>
          <dl className="mt-8 grid max-w-[30rem] gap-px border border-night-line bg-night-line font-mono text-[12px]">
            {KINDS.map((k) => (
              <div key={k.kind} className="grid grid-cols-[5rem_minmax(0,1fr)] items-baseline bg-night px-4 py-2.5 sm:grid-cols-[6.5rem_minmax(0,1fr)]">
                <dt className="text-mint">{k.kind}</dt>
                <dd className="text-white/70">{k.does}</dd>
              </div>
            ))}
          </dl>
        </div>
        <TypedTerminal />
      </div>
    </div>
  );
}
