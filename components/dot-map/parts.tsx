import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Faceplate strip: unit label, vents and LEDs, in the mono label face. */
export function Strip({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-11 items-center justify-between gap-4 border-b border-night-line bg-night-2 px-5 font-mono text-[11px] tracking-[0.14em] text-white/75 uppercase @xl:px-8">
      {children}
    </div>
  );
}

/** A 7px slotted screw head. Each corner sits at its own angle, as screws do. */
export function Screw({ className, turn }: { className: string; turn: number }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 7 7"
      className={cn("absolute z-10 size-[7px] text-night-line", className)}
      style={{ rotate: `${turn}deg` }}
    >
      <circle cx="3.5" cy="3.5" r="3" fill="none" stroke="currentColor" />
      <path d="M1.2 3.5h4.6" stroke="currentColor" />
    </svg>
  );
}

export function Vents() {
  return (
    <span aria-hidden className="hidden flex-1 justify-center gap-[3px] @2xl:flex">
      {Array.from({ length: 14 }, (_, i) => (
        <span key={i} className="h-[11px] w-[3px] bg-night-line" />
      ))}
    </span>
  );
}

/** One lit pixel per pin, each blinking on its own slow beat. */
export function Leds({ count }: { count: number }) {
  return (
    <span aria-hidden className="flex gap-[3px] bg-night p-[3px] ring-1 ring-night-line">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="relative size-[5px] bg-night-3">
          <span
            className="animate-caret absolute inset-0 bg-mint"
            style={{ animationDuration: `${3.1 + i * 0.47}s`, animationDelay: `${-i * 0.9}s` }}
          />
        </span>
      ))}
    </span>
  );
}
