import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { SPIN_MS, until } from "./motion";

/* Stage furniture: rack screws, a vent grille, and the faint periwinkle
 * contours behind the two windows. All decoration, all aria-hidden. */

/** A rack screw: a 7px head with a slot across it. */
export function Screw({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 7 7" className={cn("size-[7px]", className)}>
      <circle cx="3.5" cy="3.5" r="3" fill="var(--bg-3)" stroke="var(--ink-4)" strokeWidth="1" />
      <path d="M1.9 5.1 5.1 1.9" stroke="var(--ink-3)" strokeWidth="1" />
    </svg>
  );
}

/** A row of vent slots, as punched in a rack panel. */
export function Vents({ count = 8, className }: { count?: number; className?: string }) {
  return (
    <span aria-hidden className={cn("flex gap-[3px]", className)}>
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="h-3.5 w-[3px] bg-ink-4" />
      ))}
    </span>
  );
}

const W = 1200;
const H = 680;
// Rings spread from the start node, which sits at the top centre of the stage.
const CX = W / 2;
const CY = 44;
const RINGS = 34;
const STEPS = 160;

/** One ring, a touch out of true. Fixed maths, rounded, so the server and the browser draw the same path. */
function ring(k: number) {
  const r = 40 + k * 17;
  const pts: string[] = [];
  for (let i = 0; i < STEPS; i++) {
    const t = (i / STEPS) * Math.PI * 2;
    const wob = 1 + 0.022 * Math.sin(3 * t + k * 0.22) + 0.012 * Math.sin(7 * t - k * 0.31);
    const x = CX + Math.cos(t) * r * 2.1 * wob;
    const y = CY + Math.sin(t) * r * wob;
    pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`);
  }
  return `M${pts.join("L")}Z`;
}

const PATHS = Array.from({ length: RINGS }, (_, k) => ring(k));

/** Close-set periwinkle rings, like a sounding from the start node, fading as they spread. Never animated. */
export function Contours({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMin meet"
      fill="none"
      stroke="var(--peri)"
      className={className}
    >
      {PATHS.map((d, k) => (
        <path
          key={k}
          d={d}
          strokeWidth="1"
          vectorEffect="non-scaling-stroke"
          opacity={(0.85 - (k / RINGS) * 0.7).toFixed(2)}
        />
      ))}
    </svg>
  );
}

/* Pixel parts (no icon library) -------------------------------------------- */

// Drawn at 1:1, 7×6 CSS pixels, so every cell lands on a whole pixel.
const CHECK_BITS = ["......#", ".....##", "#...##.", "##.##..", ".###...", "..#...."];
const CHECK_PX = CHECK_BITS.flatMap((row, y) => row.split("").flatMap((c, x) => (c === "#" ? [{ x, y }] : [])));

export function PixelCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 7 6" shapeRendering="crispEdges" aria-hidden className={cn("h-[6px] w-[7px] shrink-0", className)}>
      {CHECK_PX.map(({ x, y }) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />
      ))}
    </svg>
  );
}

/** The done mark: an ink pixel check on a mint cell. */
export function Tick() {
  return (
    <span aria-hidden className="flex size-[13px] bg-mint pt-[4px] pl-[3px] text-ink">
      <PixelCheck />
    </span>
  );
}

/** A plain line of output: one periwinkle pixel. */
export function Dot() {
  return <span aria-hidden className="size-[7px] bg-peri" />;
}

/** Where a run stopped: a pink pixel with an ink rim. */
export function Halt() {
  return <span aria-hidden className="size-2 border border-ink bg-pink" />;
}

// Clockwise through a 2×2 block: top-left, top-right, bottom-right, bottom-left.
const SPIN_ORDER = [0, 1, 3, 2];

/** Four cells lit in turn. Runs a fixed number of turns, enough to reach `to`, then stops. */
export function Spin({ to, className }: { to: number; className?: string }) {
  const turns = Math.ceil(to / SPIN_MS);
  return (
    <span aria-hidden className={cn("grid grid-cols-2 gap-px", className)}>
      {[0, 1, 2, 3].map((cell) => (
        <span
          key={cell}
          className="size-[5px] bg-current opacity-20"
          style={{
            animation: `wr-spin ${SPIN_MS}ms linear ${(SPIN_ORDER.indexOf(cell) * SPIN_MS) / 4}ms ${turns}`,
          }}
        />
      ))}
    </span>
  );
}

/** A row of cells, each lit from its own moment (`null` stays unlit). */
export function Bar({ at, on, size = 7, gap = 2 }: { at: Array<number | null>; on: string; size?: number; gap?: number }) {
  return (
    <span aria-hidden className="inline-flex shrink-0 align-middle" style={{ gap }}>
      {at.map((t, i) => (
        <span
          key={i}
          className={cn("inline-block", t === null ? "bg-line-2" : on)}
          style={{ width: size, height: size, animation: t === null ? undefined : `wr-off ${t}ms linear` }}
        />
      ))}
    </span>
  );
}

/** Children laid over one another in one grid cell, so a change of state never moves the layout. */
export function Stack({ as: As = "span", className, children }: { as?: "span" | "div"; className?: string; children: ReactNode }) {
  return <As className={cn("grid [&>*]:col-start-1 [&>*]:row-start-1", className)}>{children}</As>;
}

/**
 * Text typed one key at a time. Each character is its own span, transparent until its
 * keystroke, so the line wraps where it finally will from the first frame; words are held
 * together so a flag never splits at its hyphens. The cursor is the next character's own
 * box: an ink block in the terminal, an ink bar in the form. Each ▒ run is a solid
 * redaction bar one monospace cell (0.6em) per character, shown whole when its first key
 * lands; the ▒ glyph isn't in most mono faces and would fall back wider.
 */
export function Typed({
  text,
  at,
  per,
  cursor,
  cursorFrom = at,
  block = "",
  loose = false,
}: {
  text: string;
  at: number;
  per: number;
  cursor: "block" | "bar";
  /** When the cursor first shows on the first character; defaults to when typing starts. */
  cursorFrom?: number;
  /** Colour class for redacted runs. */
  block?: string;
  /** Let a word break between any two characters (with `break-all` on the parent), for strings too long for a phone. */
  loose?: boolean;
}) {
  const cur = cursor === "block" ? "wr-cur" : "wr-bar";
  const words: ReactNode[] = [];
  let i = 0;
  // Spaces stay loose between words, so the line can still break there.
  for (const word of text.split(/( )/)) {
    if (!word) continue;
    const keys: ReactNode[] = [];
    for (const part of word.split(/(▒+)/)) {
      if (!part) continue;
      if (part.startsWith("▒")) {
        keys.push(
          <span
            key={i}
            className={cn("inline-block h-[0.9em] align-[-0.12em]", block)}
            style={{ width: `${part.length * 0.6}em`, ...until(at + (i + 1) * per) }}
          />,
        );
        i += part.length;
        continue;
      }
      for (const ch of part) {
        const shown = at + (i + 1) * per;
        const from = i === 0 ? cursorFrom : at + i * per;
        keys.push(
          <span key={i} style={{ animation: `wr-ink ${shown}ms linear, ${cur} ${shown - from}ms linear ${from}ms` }}>
            {ch}
          </span>,
        );
        i++;
      }
    }
    words.push(
      word === " " ? (
        keys[0]
      ) : (
        <span key={`w${i}`} className={loose ? undefined : "whitespace-nowrap"}>
          {keys}
        </span>
      ),
    );
  }
  return <>{words}</>;
}

/** The terminal's cursor parked after a typed line, from `from` to `to`. */
export function Parked({ from, to }: { from: number; to: number }) {
  if (to <= from) return null;
  return <span style={{ animation: `wr-cur ${to - from}ms linear ${from}ms` }}>{" "}</span>;
}

/** Typed length, counting each character once (▒ runs included), as `Typed` does. */
export const keyCount = (text: string) => Array.from(text).length;
