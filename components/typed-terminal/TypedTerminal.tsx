"use client";

import { memo, useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";

/* The script ------------------------------------------------------------------
 *
 * Lines are typed (commands, a passphrase) or printed whole (output, verdicts),
 * on one fixed timeline worked out at render from the script alone.
 */

export type Tone = "mint" | "lime" | "pink" | "peri";

/** The badge at the right of the title bar. */
export type Badge = { label: string; tone?: Tone };

type Beats = {
  /** Switch the title-bar badge to this one as the line appears. */
  status?: Badge;
  /** Milliseconds to hold after the line before the next one starts. */
  pause?: number;
};

export type TerminalLine =
  /** Typed one key at a time after the prompt, then an optional comment printed whole. */
  | ({ kind: "command"; text: string; comment?: string } & Beats)
  /** Printed whole, whitespace kept. */
  | ({ kind: "output"; text: string } & Beats)
  /** A prompt printed whole, then `keys` masked keystrokes (8 by default). */
  | ({ kind: "secret"; prompt: string; keys?: number } & Beats)
  /** A verdict: bold lime behind a check, and a longer hold. */
  | ({ kind: "ok"; text: string } & Beats)
  /** A dashed rule between two parts of the session. Takes no time. */
  | { kind: "rule" };

type Line = Exclude<TerminalLine, { kind: "rule" }>;

const TYPE_MS = 30; // a command, per character
const KEY_MS = 130; // the passphrase, per key
const LEAD_MS = 520; // the passphrase prompt, before the first key
const START = 450;
// A verdict is a moment: hold on it before the next line.
const HOLD: Record<Line["kind"], number> = { command: 420, secret: 480, ok: 950, output: 300 };

type Beat = { line: Line; text: string; rule: boolean; at: number; typed: number; next: number };

function timeline(script: TerminalLine[]) {
  let t = START;
  let rule = false;
  const beats: Beat[] = [];
  for (const line of script) {
    if (line.kind === "rule") {
      rule = true;
      continue;
    }
    const text = line.kind === "command" ? line.text.replace(/^\$ /, "") : line.kind === "secret" ? line.prompt : line.text;
    const at = t;
    const typed =
      line.kind === "command"
        ? at + Array.from(text).length * TYPE_MS
        : line.kind === "secret"
          ? at + LEAD_MS + (line.keys ?? 8) * KEY_MS
          : at;
    t = typed + (line.pause ?? HOLD[line.kind]);
    beats.push({ line, text, rule, at, typed, next: t });
    rule = false;
  }
  return { beats, end: t };
}

const CSS = [
  "@keyframes tt-hide{from,to{visibility:hidden}}",
  "@keyframes tt-show{from,to{visibility:visible}}",
  "@keyframes tt-ink{from,to{color:transparent}}",
  "@keyframes tt-cur{from,to{background-color:var(--mint-pale)}}",
  "[data-tt]{font-variant-ligatures:none}",
  // Inline `animation` shorthands reset play-state to running, hence !important.
  "[data-tt=paused] *{animation-play-state:paused!important}",
  // Before hydration (and without script) the window shows its last frame.
  "[data-tt=static] *{animation:none!important}",
  "@media (prefers-reduced-motion:reduce){[data-tt] *{animation:none!important}}",
].join("");

/** Hidden for the first `ms` of the run, then as styled. */
const until = (ms: number): CSSProperties => ({ animation: `tt-hide ${ms}ms linear` });

/** Shown only from `a` to `b`. The element also carries `invisible`, which is where it rests. */
const between = (a: number, b: number): CSSProperties => ({ animation: `tt-show ${b - a}ms linear ${a}ms` });

// Drawn at 1:1, 7×6 CSS pixels, so every cell lands on a whole pixel.
const CHECK_BITS = ["......#", ".....##", "#...##.", "##.##..", ".###...", "..#...."];
const CHECK_PX = CHECK_BITS.flatMap((row, y) => row.split("").flatMap((c, x) => (c === "#" ? [{ x, y }] : [])));

/** A pixel check mark in the current colour. */
function Check() {
  return (
    <svg viewBox="0 0 7 6" shapeRendering="crispEdges" aria-hidden className="h-[6px] w-[7px] shrink-0">
      {CHECK_PX.map(({ x, y }) => (
        <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="currentColor" />
      ))}
    </svg>
  );
}

/**
 * Text typed one key at a time. Each character is transparent until its keystroke,
 * so the line wraps where it finally will from the first frame. The cursor is the
 * next character's own box, lit mint-pale while it waits there.
 */
function Typed({ text, at, per }: { text: string; at: number; per: number }) {
  return (
    <>
      {Array.from(text).map((ch, i) => {
        const shown = at + (i + 1) * per;
        const from = at + i * per;
        return (
          <span key={i} style={{ animation: `tt-ink ${shown}ms linear, tt-cur ${shown - from}ms linear ${from}ms` }}>
            {ch}
          </span>
        );
      })}
    </>
  );
}

/** The cursor parked after a typed line, from `from` to `to`. */
function Parked({ from, to }: { from: number; to: number }) {
  if (to <= from) return null;
  return <span style={{ animation: `tt-cur ${to - from}ms linear ${from}ms` }}> </span>;
}

/** One line: a fixed gutter for the glyph, then text with a hanging indent. */
function Row({ glyph, children, style, className }: { glyph?: ReactNode; children: ReactNode; style?: CSSProperties; className?: string }) {
  return (
    <div className={cn("grid grid-cols-[1.5em_minmax(0,1fr)]", className)} style={style}>
      <span className="flex h-[1.7em] items-center">{glyph}</span>
      <span className="min-w-0 break-words whitespace-pre-wrap">{children}</span>
    </div>
  );
}

function BeatRow({ b, prompt }: { b: Beat; prompt: ReactNode }) {
  const { line } = b;
  if (line.kind === "command") {
    return (
      <Row glyph={prompt} style={until(b.at)} className="text-mint-pale">
        <Typed text={b.text} at={b.at} per={TYPE_MS} />
        <Parked from={b.typed} to={b.next} />
        {line.comment ? (
          <span className="text-peri-soft" style={until(b.typed)}>
            {"  "}
            {line.comment}
          </span>
        ) : null}
      </Row>
    );
  }
  if (line.kind === "secret") {
    const k0 = b.at + LEAD_MS;
    return (
      <Row style={until(b.at)} className="text-white/85">
        {b.text}
        {Array.from({ length: line.keys ?? 8 }, (_, i) => (
          <span key={i} className="text-lime" style={until(k0 + (i + 1) * KEY_MS)}>
            *
          </span>
        ))}
        <Parked from={b.at + 200} to={b.next} />
      </Row>
    );
  }
  if (line.kind === "ok") {
    return (
      <Row
        style={until(b.at)}
        className="font-semibold text-lime"
        glyph={
          <span aria-hidden className="flex size-[13px] bg-lime pt-[4px] pl-[3px] text-ink">
            <Check />
          </span>
        }
      >
        {b.text}
      </Row>
    );
  }
  return (
    <Row style={until(b.at)} className="text-white/80">
      {b.text}
    </Row>
  );
}

/** The whole transcript. Memoised: nothing in it re-renders while it plays. */
const Transcript = memo(function Transcript({ beats, end, glyph }: { beats: Beat[]; end: number; glyph: string }) {
  const prompt = <span className="font-semibold text-mint">{glyph}</span>;
  return (
    <div aria-hidden className="flex flex-col gap-1 px-4 py-5 font-mono text-[13px] leading-[1.7] sm:px-6 sm:text-[14px]">
      {beats.map((b, i) => (
        <div key={i} className={cn(b.rule && i > 0 && "mt-4 border-t border-dashed border-night-line pt-4")}>
          <BeatRow b={b} prompt={prompt} />
        </div>
      ))}
      <Row glyph={prompt} style={until(end)} className="mt-1 text-mint-pale">
        <span className="animate-caret bg-mint-pale"> </span>
      </Row>
    </div>
  );
});

const TONE: Record<Tone, { text: string; dot: string }> = {
  mint: { text: "text-mint", dot: "bg-mint" },
  lime: { text: "text-lime", dot: "bg-lime" },
  pink: { text: "text-pink-soft", dot: "bg-pink" },
  peri: { text: "text-peri-soft", dot: "bg-peri" },
};

/** Title-bar status: each badge holds until the line that sets the next one. The last one rests. */
function Status({ steps }: { steps: { badge: Badge; at: number }[] }) {
  if (!steps.length) return null;
  return (
    <span className="grid justify-items-end [&>*]:col-start-1 [&>*]:row-start-1">
      {steps.map(({ badge, at }, i) => {
        const last = i === steps.length - 1;
        if (!last && steps[i + 1].at <= at) return null;
        const tone = TONE[badge.tone ?? "mint"];
        return (
          <span
            key={i}
            className={cn("flex items-center gap-2 whitespace-nowrap", tone.text, !last && "invisible")}
            style={last ? (at > 0 ? until(at) : undefined) : between(at, steps[i + 1].at)}
          >
            <span className={cn("size-[7px] shrink-0", tone.dot)} />
            {badge.label}
          </span>
        );
      })}
    </span>
  );
}

const MOTION_OK = "(prefers-reduced-motion: no-preference)";
function subscribe(onChange: () => void) {
  const mq = window.matchMedia(MOTION_OK);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}
const canMove = () => window.matchMedia(MOTION_OK).matches;
const cannotMove = () => false;

/** A believable default: unlock an encrypted disk over SSH, then check the services it boots. */
export const DEFAULT_SCRIPT: TerminalLine[] = [
  { kind: "command", text: "ssh -p 2222 root@203.0.113.24", comment: "# dropbear, inside the initramfs" },
  { kind: "command", text: "cryptroot-unlock" },
  { kind: "secret", prompt: "Please unlock disk nvme0n1p3_crypt: ", keys: 12 },
  { kind: "ok", text: "nvme0n1p3_crypt: set up successfully", status: { label: "booting", tone: "lime" } },
  { kind: "output", text: "Connection to 203.0.113.24 closed." },
  { kind: "rule" },
  { kind: "command", text: "ssh ops@203.0.113.24", comment: "# same host, off its own disk" },
  { kind: "command", text: "systemctl is-active nginx postgresql" },
  { kind: "output", text: "active\nactive" },
  { kind: "command", text: "curl -s localhost:8080/healthz" },
  { kind: "output", text: '{"status":"ok","db":"up"}' },
  { kind: "ok", text: "all checks passed", status: { label: "online", tone: "mint" } },
];

function describe(line: TerminalLine) {
  switch (line.kind) {
    case "command":
      return `$ ${line.text.replace(/^\$ /, "")}${line.comment ? ` ${line.comment}` : ""}`;
    case "secret":
      return `${line.prompt.trim()} (${line.keys ?? 8} masked keys)`;
    case "rule":
      return null;
    default:
      return line.text.trim().replace(/\s*\n\s*/g, ", ").replace(/\.$/, "");
  }
}

/**
 * A terminal window that plays a scripted session: commands typed, output
 * printed whole, a passphrase typed as masked keys, verdicts that hold, and a
 * status badge in the title bar that follows along. Plays while it is on
 * screen and pauses off it; reduced motion and no-script show the last frame.
 */
export function TypedTerminal({
  script = DEFAULT_SCRIPT,
  title = "laptop — ssh",
  status = { label: "locked", tone: "pink" },
  note = "› unlocked over SSH, never through the host console",
  prompt = "$",
  caption,
  className,
}: {
  script?: TerminalLine[];
  /** Centred in the title bar. */
  title?: string;
  /** The badge before any line changes it. `null` for none. */
  status?: Badge | null;
  /** The footer line beside the replay button. */
  note?: ReactNode;
  /** The glyph in front of every command. */
  prompt?: string;
  /** What screen readers hear instead of the animation. Built from the script by default. */
  caption?: string;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const motion = useSyncExternalStore(subscribe, canMove, cannotMove);
  const [onScreen, setOnScreen] = useState(false);
  const [run, setRun] = useState(0);

  const { beats, end } = useMemo(() => timeline(script), [script]);
  const steps = useMemo(
    () => [
      ...(status ? [{ badge: status, at: 0 }] : []),
      ...beats.flatMap((b) => (b.line.status ? [{ badge: b.line.status, at: b.at }] : [])),
    ],
    [beats, status],
  );

  useEffect(() => {
    const el = ref.current;
    if (!el || !motion) return;
    const io = new IntersectionObserver(([entry]) => setOnScreen(entry.isIntersecting), {
      // Starts as the window's top edge comes in, so typing begins where the eye lands first.
      rootMargin: "0px 0px -6% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [motion]);

  const state = !motion ? "static" : onScreen ? "run" : "paused";
  const said = caption ?? `A terminal session, ${title}: ${script.flatMap((l) => describe(l) ?? []).join("; ")}.`;

  return (
    <figure ref={ref} data-tt={state} className={cn("relative flex flex-col border border-night-line bg-night-2", className)}>
      <style href="typed-terminal" precedence="default">
        {CSS}
      </style>
      <div
        key={`bar${run}`}
        aria-hidden
        className="flex h-10 items-center gap-3 border-b border-night-line bg-night-3 px-4 font-mono text-[12px] leading-none"
      >
        <span className="flex shrink-0 gap-[5px]">
          <span className="size-2 bg-mint" />
          <span className="size-2 bg-lime opacity-30" />
          <span className="size-2 bg-pink opacity-30" />
        </span>
        <span className="min-w-0 flex-1 truncate text-center text-white/80">{title}</span>
        <Status steps={steps} />
      </div>

      <div key={run} className="flex-1">
        <Transcript beats={beats} end={end} glyph={prompt} />
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-night-line px-4 py-3 font-mono text-[12px] text-white/70 sm:px-6">
        <span>{note}</span>
        <button
          type="button"
          onClick={() => setRun((r) => r + 1)}
          aria-label="Replay the session"
          className="inline-flex h-7 shrink-0 items-center gap-2 border border-night-line px-2.5 text-white/80 transition-colors hover:border-mint-pale hover:text-mint-pale motion-reduce:hidden"
        >
          <span aria-hidden>↺</span>
          replay
        </button>
      </div>

      <figcaption className="sr-only">{said}</figcaption>
    </figure>
  );
}
