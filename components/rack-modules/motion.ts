/*
 * Motion for the rack modules is CSS, one loop per face, built from millisecond
 * timelines with the helpers below. An animated element's own style is the
 * face's finished state, so with reduced motion (animation: none) every face
 * still reads, stopped at its telling moment.
 */

export type Stop = [ms: number, css: string];

/** Keyframes for one element on a loop, from millisecond stops, and the class that plays them. */
export function track(name: string, loop: number, stops: Stop[]) {
  const frames = stops.map(([ms, css]) => `${+((ms / loop) * 100).toFixed(3)}%{${css}}`).join("");
  return `@keyframes ${name}{${frames}}.${name}{animation:${name} ${loop}ms ease-in-out infinite}`;
}

/** Opacity 0 outside [from, to], fading over `fade` ms at each end. */
export function between(name: string, loop: number, from: number, to: number, fade = 300) {
  return track(name, loop, [
    [0, "opacity:0"],
    [from, "opacity:0"],
    [from + fade, "opacity:1"],
    [to, "opacity:1"],
    [to + fade, "opacity:0"],
    [loop, "opacity:0"],
  ]);
}

/** The inverse of `between`: opacity 1 outside [from, to], 0 inside it. */
export function outside(name: string, loop: number, from: number, to: number, fade = 300) {
  return track(name, loop, [
    [0, "opacity:1"],
    [from, "opacity:1"],
    [from + fade, "opacity:0"],
    [to, "opacity:0"],
    [to + fade, "opacity:1"],
    [loop, "opacity:1"],
  ]);
}

/** A rider: it appears at the start of its rail at `at`, reaches the end `dur` later, and is gone. */
export function ride(name: string, loop: number, at: number, dur: number, axis: "X" | "Y" = "X") {
  const p = (pc: number, o: number) => `transform:translate${axis}(${pc}%);opacity:${o}`;
  return track(name, loop, [
    [0, p(0, 0)],
    [at, p(0, 0)],
    [at + 1, p(0, 1)],
    [at + dur, p(100, 1)],
    [at + dur + 1, p(100, 0)],
    [loop, p(100, 0)],
  ]);
}

/** A colour that sits at `off` until `on` arrives at `at`, holds until `until`, then eases back. */
export function lamp(name: string, loop: number, prop: string, off: string, on: string, at: number, until: number) {
  return track(name, loop, [
    [0, `${prop}:${off}`],
    [at, `${prop}:${off}`],
    [at + 120, `${prop}:${on}`],
    [until, `${prop}:${on}`],
    [loop, `${prop}:${off}`],
  ]);
}

/** Shared by every module and face: the status LED, and the stop for reduced motion. */
export const BASE_CSS = [
  "@keyframes rk-led{0%,100%{opacity:1}50%{opacity:.3}}.rk-led{animation:rk-led 2.8s ease-in-out infinite}",
  "@media (prefers-reduced-motion:reduce){[data-rack],[data-rack] *{animation:none!important}}",
].join("");
