import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

// Rack furniture for the blades: screws, LEDs, vents, core maps and the punched
// rails. Server-safe, all decoration, all aria-hidden.

/** A 7px slotted screw head. Each one sits at its own angle, as screws do. */
export function Screw({ className, turn }: { className?: string; turn: number }) {
  return (
    <svg aria-hidden viewBox="0 0 7 7" className={cn("size-[7px] shrink-0", className)} style={{ rotate: `${turn}deg` }}>
      <circle cx="3.5" cy="3.5" r="3" fill="none" stroke="currentColor" />
      <path d="M1.2 3.5h4.6" stroke="currentColor" />
    </svg>
  );
}

/**
 * Power and activity. Live, power is lit and activity blinks on a rhythm of its
 * own (`period` seconds, `phase` seconds in); otherwise both sit dark, like an
 * empty slot.
 */
export function Leds({
  live,
  period,
  phase,
  bezel,
  className,
}: {
  live: boolean;
  period: number;
  phase: number;
  bezel: string;
  className?: string;
}) {
  return (
    <span aria-hidden className={cn("flex gap-[3px] p-[3px]", bezel, className)}>
      <span className={cn("size-[5px]", live ? "bg-mint" : "bg-night-3")} />
      <span className="size-[5px] bg-night-3">
        {live ? (
          <span
            className="animate-caret block size-full bg-lime"
            style={{ animationDuration: `${period.toFixed(2)}s`, animationDelay: `${(-phase).toFixed(2)}s` }}
          />
        ) : null}
      </span>
    </span>
  );
}

/** A row of punched vent slots. */
export function Vents({ count = 9, tone, className }: { count?: number; tone: string; className?: string }) {
  return (
    <span aria-hidden className={cn("flex gap-[3px]", className)}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className={cn("h-[11px] w-[3px]", tone)} />
      ))}
    </span>
  );
}

/** One lit pixel per core: ten 4px cells to a row, or four 5px cells for the big blades. */
export function Cores({ n, tone, big = false }: { n: number; tone: string; big?: boolean }) {
  return (
    <span aria-hidden className={cn("grid gap-[2px]", big ? "grid-cols-[repeat(4,5px)]" : "grid-cols-[repeat(10,4px)]")}>
      {Array.from({ length: n }, (_, i) => (
        <span key={i} className={cn(big ? "size-[5px]" : "size-[4px]", tone)} />
      ))}
    </span>
  );
}

/** A rack rail: a slate strip punched with square mounting holes. */
const RAIL: CSSProperties = {
  backgroundImage: "linear-gradient(var(--night) 0 6px, transparent 6px)",
  backgroundSize: "6px 18px",
  backgroundRepeat: "repeat-y",
  backgroundPosition: "center 10px",
};

export function Rail() {
  return <div aria-hidden className="bg-night-3" style={RAIL} />;
}

/** Keeps a figure on the line with its unit: "40 GB" breaks as a whole. */
export const keep = (s: string) => s.replace(/(\d) (?=[A-Za-z])/g, "$1 ");
