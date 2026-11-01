import type { CSSProperties } from "react";

/* One timeline, in milliseconds after the figure comes into view -------------
 *
 * Nothing re-renders while it plays. Every beat is a CSS animation with a
 * fixed delay, set once at mount: lines are hidden until their moment, states
 * show only inside their window, each typed character is transparent until its
 * keystroke. Off screen the figure pauses them all with animation-play-state,
 * and under reduced motion they're dropped, which leaves the finished state.
 */

export const TYPE_MS = 30; // a command in the terminal, per character
export const GEN_MS = 20; // a generated value printing, per character
export const KEY_MS = 80; // a masked secret, per key
export const FIELD_MS = 22; // the form's typing, per character
export const UPLOAD_MS = 950;
export const SPIN_MS = 480;
export const BLINK_MS = 900;

// First a pixel runs from the start node down into each window; both sessions begin as it lands.
export const RUN_AT = 150;
export const RUN_MS = 1000;
export const START = RUN_AT + RUN_MS;

export const CSS = [
  "@keyframes wr-hide{from,to{visibility:hidden}}",
  "@keyframes wr-show{from,to{visibility:visible}}",
  "@keyframes wr-ink{from,to{color:transparent}}",
  "@keyframes wr-cur{from,to{background-color:var(--ink)}}",
  // The form's caret: a hairline inside the next character's box, so nothing reflows.
  "@keyframes wr-bar{from,to{box-shadow:inset 2px 0 0 var(--ink)}}",
  "@keyframes wr-off{from,to{background-color:var(--line-2)}}",
  "@keyframes wr-row{from,to{background-color:var(--bg)}}",
  "@keyframes wr-clr{from,to{background-color:transparent;outline-color:transparent}}",
  "@keyframes wr-spin{0%,24.9%{opacity:1}25%,100%{opacity:.2}}",
  "@keyframes wr-blink{0%,49.9%{opacity:1}50%,100%{opacity:.25}}",
  // The start pixels: along the dashed line, then down into the window. cq units read the connector's own box.
  "@keyframes wr-runl{0%{transform:none}55%{transform:translateX(-100cqw)}100%{transform:translate(-100cqw,100cqh)}}",
  "@keyframes wr-runr{0%{transform:none}55%{transform:translateX(100cqw)}100%{transform:translate(100cqw,100cqh)}}",
  "[data-wr] .font-mono{font-variant-ligatures:none}",
  // Inline `animation` shorthands reset play-state to running, hence !important.
  "[data-wr=paused] *{animation-play-state:paused!important}",
  "@media (prefers-reduced-motion:reduce){[data-wr] *{animation:none!important}}",
].join("");

/** Hidden for the first `ms` of the run, then as styled. */
export const until = (ms: number): CSSProperties => ({ animation: `wr-hide ${ms}ms linear` });

/** Shown only from `a` to `b`. The element also carries `invisible`, which is where it rests. */
export const between = (a: number, b: number): CSSProperties => ({ animation: `wr-show ${b - a}ms linear ${a}ms` });

/** Blinks from `a` to `b`, a whole number of times, then holds lit. */
export const blink = (a: number, b: number): CSSProperties => ({
  animation: `wr-blink ${BLINK_MS}ms steps(1) ${a}ms ${Math.max(1, Math.floor((b - a) / BLINK_MS))}`,
});

/** Ten cells lit evenly from `a` to `b`: a progress bar for one beat. */
export const ticks = (a: number, b: number) => Array.from({ length: 10 }, (_, j) => a + ((j + 1) * (b - a)) / 10);
