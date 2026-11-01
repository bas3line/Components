import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { BASE_CSS } from "./motion";

/*
 * The parts the rack-module faces are drawn from: screws, the sunken face, flat
 * UI windows, dashed rails with pixel riders, and two-state labels. No images.
 */

/**
 * Ships a block of CSS with the component. React hoists it into <head> and keeps
 * one copy per `id`, so give each distinct block its own.
 */
export function RackStyle({ id, css }: { id: string; css: string }) {
  return (
    <style href={id} precedence="default">
      {css}
    </style>
  );
}

/** A 7px screw head: a ring with a slot, each turned to its own angle. */
export function Screw({ turn = 0 }: { turn?: number }) {
  return (
    <svg viewBox="0 0 14 14" width={7} height={7} aria-hidden className="block shrink-0">
      <circle cx="7" cy="7" r="6" fill="var(--bg-2)" stroke="var(--ink-3)" strokeWidth="2" />
      <path d="M3 7h8" stroke="var(--ink-3)" strokeWidth="2" transform={`rotate(${turn} 7 7)`} />
    </svg>
  );
}

/**
 * The sunken face a diagram is drawn on: dot lattice, hairline, fixed height.
 * It is a size container, so what's inside lays itself out for the card it sits
 * in, not for the window. A night face is slate; --cap carries a caption colour
 * for either.
 */
export function RackFace({
  label,
  night = false,
  className,
  children,
}: {
  /** What the drawing shows, for screen readers. */
  label: string;
  night?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      role="img"
      aria-label={label}
      data-rack=""
      className={cn(
        "@container relative h-[252px] overflow-hidden border bg-dots",
        night
          ? "border-night bg-night [--cap:rgb(255_255_255/0.72)] [--dot:var(--night-line)]"
          : "border-line bg-bg [--cap:var(--ink-3)]",
        className,
      )}
    >
      <RackStyle id="rack-modules" css={BASE_CSS} />
      {children}
    </div>
  );
}

/** A flat UI window with a mono title bar. */
export function Window({
  title,
  aside,
  night = false,
  className,
  children,
}: {
  title: ReactNode;
  aside?: ReactNode;
  night?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex min-w-0 flex-col border", night ? "border-night bg-night" : "border-line-2 bg-paper", className)}>
      <div
        className={cn(
          "flex h-7 shrink-0 items-center gap-3 border-b px-2.5 font-mono text-[11px] leading-none",
          night ? "border-night-line text-white/70" : "border-line text-ink-3",
        )}
      >
        <span className="flex min-w-0 flex-1 items-center gap-2 truncate">{title}</span>
        {aside ? <span className="shrink-0">{aside}</span> : null}
      </div>
      {children}
    </div>
  );
}

export type Rider = { cls: string; rest?: number; children?: ReactNode };

/**
 * A dashed periwinkle connector. Riders sit on it, each a pixel crossing on its
 * own timeline; at rest (reduced motion) they wait `rest` percent of the way along.
 */
export function Rail({ riders = [], vertical = false, className }: { riders?: Rider[]; vertical?: boolean; className?: string }) {
  return (
    <span className={cn("relative border-dashed border-peri", vertical ? "w-0 border-l" : "h-0 border-t", className)}>
      {riders.map((r) => (
        <span
          key={r.cls}
          className={cn(
            "absolute",
            vertical ? "top-0 bottom-[7px] left-[-4px] w-[7px]" : "top-[-4px] right-[7px] left-0 h-[7px]",
            r.cls,
          )}
          style={{ transform: `translate${vertical ? "Y" : "X"}(${r.rest ?? 50}%)` }}
        >
          {r.children ?? <span className="block size-[7px] bg-mint" />}
        </span>
      ))}
    </span>
  );
}

/** One 7px square: the pixel every face marks things with. */
export function Pixel({ className }: { className: string }) {
  return <span className={cn("block size-[7px] shrink-0", className)} />;
}

/**
 * Two states of one label stacked in a single grid cell, so it is always as wide
 * as the longer. `after` is the resting state; `before` shows until the swap.
 * The classes are `${cls}-b` and `${cls}-a`.
 */
export function Swap({ cls, before, after, className }: { cls: string; before: ReactNode; after: ReactNode; className?: string }) {
  return (
    <span className={cn("inline-grid", className)}>
      <span className={cn("col-start-1 row-start-1 opacity-0", `${cls}-b`)}>{before}</span>
      <span className={cn("col-start-1 row-start-1", `${cls}-a`)}>{after}</span>
    </span>
  );
}
