"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Chip, HashPixels, Leds, Screws, Tick, Vents } from "./parts";

/** One thing gathered into the first stage: what it is, its file or value, a line on it. */
export type BootChainInput = { label: string; value: string; note?: string };

/**
 * A stage after the inputs. Past the caption every field is optional: the box
 * shows them in this order, and pins the chip, verdict and warning to its foot.
 */
export type BootChainStage = {
  /** Beside the numbered badge. */
  title: string;
  /** Where it happens, in small caps under the title. */
  where: string;
  /** A mono label at the top of the box. */
  label?: string;
  /** Seed for a hash drawn as 64 pixels. Same seed, same picture. */
  hash?: number;
  /** A shell command after a "$". Each " --flag" starts a continued line. */
  command?: string;
  /** What the command printed, one line each. */
  output?: ReactNode[];
  /** A lime success line with a tick. */
  ok?: string;
  /** A muted mono aside. */
  aside?: string;
  body?: ReactNode;
  /** A ticked list. */
  checks?: string[];
  /** A chip drawing with a caption, ruled off at the foot. */
  chip?: { title: string; detail: string };
  /** The lime bar at the foot. */
  verdict?: { label?: string; value: string };
  /** A pink-ruled note at the foot: what to do when it fails. */
  warn?: { title: string; body: ReactNode };
};

export type BootChainProps = {
  /** Gathered onto one bus into the first stage. */
  inputs?: BootChainInput[];
  inputsTitle?: string;
  inputsWhere?: string;
  stages?: BootChainStage[];
  /** Header strip, left: a short tag, then a caption from 576px wide. */
  tag?: string;
  caption?: string;
  /** Names the list of steps for screen readers. */
  label?: string;
  className?: string;
};

const INPUTS: BootChainInput[] = [
  { label: "Firmware", value: "firmware.fd", note: "a pinned, reproducible build" },
  { label: "Kernel", value: "vmlinuz-6.12", note: "the distro kernel, as shipped" },
  { label: "Initrd", value: "initrd.img", note: "the code that opens the disk" },
  { label: "Cmdline", value: "ro ip=dhcp", note: "flags, keys, network setup" },
];

const STAGES: BootChainStage[] = [
  {
    title: "One digest",
    where: "signed by the chip",
    label: "Boot measurement",
    hash: 29,
    body: "Every byte on the left folds into this value, in order. Swap a kernel or a flag and it comes out different.",
    chip: { title: "Signed on-chip", detail: "TPM 2.0 quote" },
  },
  {
    title: "You verify it",
    where: "on a machine you own",
    command: "attest verify --host 192.0.2.10",
    checks: [
      "the quote chains to the vendor's root",
      "the digest equals your own build",
      "the nonce is the one you just sent",
    ],
    verdict: { label: "verdict", value: "PASS" },
  },
  {
    title: "Then the key",
    where: "released on a pass",
    command: "ssh unlock@192.0.2.10",
    output: [
      <>
        Passphrase for nvme0n1p2: <span className="text-lime">********</span>
      </>,
    ],
    ok: "Volume open. Booting.",
    aside: "over SSH, never via the host",
    warn: { title: "If it fails", body: "Keep the key. Assume the machine is not yours." },
  },
];

// One wire's pixel takes STEP_MS end to end; the next wire starts as it lands.
const STEP_MS = 1680;
const cycleMs = (span: number) => span * STEP_MS + 560;

/** The runners' keyframes, timed in ms and written as percentages of one cycle. */
function chainCss(span: number) {
  const cycle = cycleMs(span);
  const p = (ms: number) => `${+((ms / cycle) * 100).toFixed(3)}%`;
  const end = "calc(100% - 6px)";
  const tap = "calc(45% - 3px)";
  return [
    `@keyframes boot-chain-x-${span}{0%{left:0;opacity:0}${p(280)}{opacity:1}${p(1680)}{left:${end};opacity:1}${p(1848)},100%{left:${end};opacity:0}}`,
    `@keyframes boot-chain-y-${span}{0%{top:0;opacity:0}${p(280)}{opacity:1}${p(1680)}{top:${end};opacity:1}${p(1848)},100%{top:${end};opacity:0}}`,
    `@keyframes boot-chain-stub-${span}{0%{left:0;opacity:0}${p(224)}{opacity:1}${p(1232)}{left:${tap};opacity:1}${p(1344)},100%{left:${tap};opacity:0}}`,
    `@keyframes boot-chain-trunk-${span}{0%,${p(1232)}{left:${tap};opacity:0}${p(1344)}{opacity:1}${p(2464)}{left:${end};opacity:1}${p(2632)},100%{left:${end};opacity:0}}`,
    "[data-boot-chain=idle] *{animation-play-state:paused!important}",
  ].join("");
}

/** Puts an element in grid column `n` once the chain lays out side by side. */
const at = (n: number) => ({ "--col": n }) as CSSProperties;

/** A pixel that travels along a connector, one pass per cycle, at its own offset. */
function Runner({ axis, step, span }: { axis: "x" | "y"; step: number; span: number }) {
  return (
    <span
      aria-hidden
      className={cn(
        "absolute size-[6px] bg-mint opacity-0 motion-reduce:hidden",
        axis === "x" ? "top-1/2 -mt-[3px]" : "left-1/2 -ml-[3px]",
      )}
      style={{ animation: `boot-chain-${axis}-${span} ${cycleMs(span)}ms linear ${step * STEP_MS}ms infinite` }}
    />
  );
}

/** Arrowhead, pointing right or down, at the end of a connector. */
function Head({ dir }: { dir: "right" | "down" }) {
  return dir === "right" ? (
    <svg aria-hidden viewBox="0 0 8 10" className="absolute top-1/2 right-0 h-[10px] w-2 -translate-y-1/2 fill-peri">
      <path d="M0 0 8 5 0 10Z" />
    </svg>
  ) : (
    <svg aria-hidden viewBox="0 0 10 8" className="absolute bottom-0 left-1/2 h-2 w-[10px] -translate-x-1/2 fill-peri">
      <path d="M0 0h10L5 8Z" />
    </svg>
  );
}

/**
 * Between two stages: a line down when they stack, a line across when they sit
 * side by side. Given `taps`, it first gathers that many inputs onto a bus.
 */
function Wire({ step, span, col, taps }: { step: number; span: number; col: number; taps?: number }) {
  // The inputs share the box's height equally, so each tap lands on a row's centre.
  const ys = taps ? Array.from({ length: taps }, (_, i) => +(((i + 0.5) * 100) / taps).toFixed(3)) : [];
  const bus = ys.map((y) => `M0 ${y}H45`).join("") + (ys.length ? `M45 ${ys[0]}V${ys[ys.length - 1]}M45 50H97` : "");
  return (
    <li aria-hidden style={at(col)} className="relative h-12 @6xl:col-start-(--col) @6xl:row-start-2 @6xl:h-auto">
      {/* Stacked: one line down the middle. */}
      <div className="absolute inset-0 @6xl:hidden">
        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-peri" />
        <Head dir="down" />
        <Runner axis="y" step={step} span={span} />
      </div>

      <div className="absolute inset-0 hidden @6xl:block">
        {taps ? (
          <>
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 size-full" fill="none">
              <path d={bus} stroke="var(--peri)" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            </svg>
            {ys.map((y) => (
              <span key={y} className="absolute size-[5px] -translate-1/2 bg-peri" style={{ left: "45%", top: `${y}%` }} />
            ))}
            {ys.map((y) => (
              <span
                key={`r${y}`}
                className="absolute -mt-[3px] size-[6px] bg-mint opacity-0 motion-reduce:hidden"
                style={{ top: `${y}%`, animation: `boot-chain-stub-${span} ${cycleMs(span)}ms linear infinite` }}
              />
            ))}
            <span
              className="absolute top-1/2 -mt-[3px] size-[6px] bg-mint opacity-0 motion-reduce:hidden"
              style={{ animation: `boot-chain-trunk-${span} ${cycleMs(span)}ms linear infinite` }}
            />
          </>
        ) : (
          <>
            <span className="absolute inset-x-0 top-1/2 h-px bg-peri" />
            <Runner axis="x" step={step} span={span} />
          </>
        )}
        <Head dir="right" />
      </div>
    </li>
  );
}

/** A stage's caption: a numbered mint badge, a title, and where it happens. */
function Caption({ n, title, where }: { n: number; title: string; where: string }) {
  return (
    <div className="flex items-center gap-3.5 pb-4 @6xl:col-start-(--col) @6xl:row-start-1">
      <span
        aria-hidden
        className="notch flex size-9 shrink-0 items-center justify-center bg-mint font-display text-[19px] leading-none font-extrabold text-ink [--notch:7px]"
      >
        {n}
      </span>
      <span>
        <span className="block font-display text-[20px] leading-tight font-bold tracking-[-0.02em] text-white">{title}</span>
        <span className="mt-1 block font-mono text-[11px] tracking-[0.16em] text-white/70 uppercase">{where}</span>
      </span>
    </div>
  );
}

function Box({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative border border-night-line bg-night-2 @6xl:col-start-(--col) @6xl:row-start-2", className)}>
      {children}
    </div>
  );
}

/** One stage's box: its parts in a fixed order, the foot pinned to the bottom. */
function StageBox({ stage }: { stage: BootChainStage }) {
  const { label, hash, command, output, ok, aside, body, checks, chip, verdict, warn } = stage;
  // A transcript sits tighter than prose.
  const gap = output?.length || ok || aside ? "gap-3" : "gap-4";
  return (
    <Box className={cn("flex flex-col p-5 @6xl:px-4", gap)}>
      {label ? <span className="font-mono text-[11px] tracking-[0.16em] text-white/70 uppercase">{label}</span> : null}
      {hash !== undefined ? <HashPixels seed={hash} cells={64} cols={16} className="w-full max-w-[300px]" /> : null}
      {command ? (
        // Continued with a backslash before each flag, so it never wraps mid-flag.
        <p className="font-mono text-[13px] leading-snug break-words whitespace-pre-wrap text-mint-pale">
          <span className="text-mint">$</span> {command.replace(/ --/g, " \\\n    --")}
        </p>
      ) : null}
      {output?.map((line, i) => (
        <p key={i} className="font-mono text-[13px] leading-snug break-words text-white/85">
          {line}
        </p>
      ))}
      {ok ? (
        <p className="flex items-center gap-2.5 font-mono text-[13px] leading-snug font-semibold text-lime">
          <Tick />
          {ok}
        </p>
      ) : null}
      {aside ? <p className="font-mono text-[12px] leading-snug text-white/70">{aside}</p> : null}
      {body ? <p className="text-[16px] leading-snug text-pretty text-white/80">{body}</p> : null}
      {checks?.length ? (
        <ul className="flex flex-col gap-2.5">
          {checks.map((c, i) => (
            <li key={i} className="flex items-start gap-2.5 text-[15px] leading-snug text-white/85">
              <span className="mt-[4px]">
                <Tick tone="bg-mint" />
              </span>
              {c}
            </li>
          ))}
        </ul>
      ) : null}
      {chip || verdict || warn ? (
        <div className={cn("mt-auto flex flex-col", gap)}>
          {chip ? (
            <div className="flex items-center gap-4 border-t border-night-line pt-4">
              <Chip className="size-12 shrink-0" />
              <p>
                <span className="block font-display text-[18px] leading-tight font-bold text-white">{chip.title}</span>
                <span className="mt-0.5 block font-mono text-[12px] text-white/75">{chip.detail}</span>
              </p>
            </div>
          ) : null}
          {verdict ? (
            <p className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1 bg-lime px-4 py-2.5 text-ink">
              <span className="font-mono text-[11px] tracking-[0.16em] uppercase">{verdict.label ?? "verdict"}</span>
              <span className="font-display text-[26px] leading-none font-extrabold tracking-[-0.02em]">{verdict.value}</span>
            </p>
          ) : null}
          {warn ? (
            <div className="border border-pink/70 px-3.5 py-3">
              <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.16em] text-pink-soft uppercase">
                <span aria-hidden className="size-[7px] bg-pink" />
                {warn.title}
              </p>
              <p className="mt-1.5 text-[15px] leading-snug text-pretty text-white/85">{warn.body}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </Box>
  );
}

/**
 * A chain of trust as a wiring diagram: the inputs gathered onto one bus, then
 * stage after stage to a verdict. Side by side once the chain is 72rem wide,
 * stacked below that. Mint pixels run the wires while it is on screen and
 * pause off it; reduced motion hides them.
 */
export function BootChain({
  inputs = INPUTS,
  inputsTitle = "What loads",
  inputsWhere = "hashed before it runs",
  stages = STAGES,
  tag = "U1",
  caption = "measured boot · remote attestation",
  label = "Boot chain, step by step",
  className,
}: BootChainProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { rootMargin: "0px 0px -10% 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Three wires or fewer keep the original 5.6s cycle; more stretch it.
  const span = Math.max(3, stages.length);
  const cols = ["minmax(0,1.05fr)", ...stages.flatMap((_, i) => [i === 0 ? "56px" : "44px", "minmax(0,1fr)"])].join(" ");

  return (
    <div
      ref={ref}
      data-boot-chain={inView ? "run" : "idle"}
      className={cn(
        "@container relative w-full border border-night-line bg-night bg-dots text-white [--dot:var(--night-line)]",
        className,
      )}
    >
      <style href={`boot-chain-${span}`} precedence="default">
        {chainCss(span)}
      </style>
      <Screws />

      <div
        aria-hidden
        className="flex h-11 items-center justify-between gap-4 border-b border-night-line bg-night-2 px-6 font-mono text-[11px] tracking-[0.16em] text-white/70 uppercase"
      >
        <span className="flex items-center gap-4">
          {tag}
          {caption ? <span className="hidden @xl:inline">{caption}</span> : null}
        </span>
        <span className="flex items-center gap-4">
          <Vents count={9} className="hidden @xl:flex" />
          <Leds slot={1} />
        </span>
      </div>

      <ol
        aria-label={label}
        style={{ "--chain-cols": cols } as CSSProperties}
        className="grid grid-cols-1 px-4 pt-8 pb-8 @xl:px-8 @6xl:grid-cols-(--chain-cols) @6xl:grid-rows-[auto_1fr] @6xl:pt-10 @6xl:pb-10"
      >
        <li className="contents" style={at(1)}>
          <Caption n={1} title={inputsTitle} where={inputsWhere} />
          <Box className="flex flex-col">
            <ul
              style={{ "--rows": inputs.length } as CSSProperties}
              className="grid flex-1 @xl:grid-cols-2 @6xl:grid-cols-1 @6xl:grid-rows-[repeat(var(--rows),minmax(0,1fr))]"
            >
              {inputs.map((input, i) => (
                <li
                  key={i}
                  className={cn(
                    "flex flex-col justify-center gap-1 px-4 py-3.5 @6xl:min-h-[82px]",
                    i > 0 && "border-t border-night-line",
                    i === 1 && "@xl:@max-6xl:border-t-0",
                    i % 2 === 1 && "@xl:@max-6xl:border-l",
                  )}
                >
                  <span className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
                    <span className="font-mono text-[11px] tracking-[0.16em] text-white/70 uppercase">{input.label}</span>
                    <span className="font-mono text-[14px] text-mint-pale">{input.value}</span>
                  </span>
                  {input.note ? <span className="text-[15px] leading-snug text-white/80">{input.note}</span> : null}
                </li>
              ))}
            </ul>
          </Box>
        </li>

        {stages.map((stage, i) => (
          <StageItem key={i} stage={stage} i={i} span={span} taps={i === 0 ? inputs.length : undefined} />
        ))}
      </ol>
    </div>
  );
}

/** The wire into a stage, then the stage: caption over box. */
function StageItem({ stage, i, span, taps }: { stage: BootChainStage; i: number; span: number; taps?: number }) {
  const col = 3 + i * 2;
  return (
    <>
      <Wire step={i} span={span} col={col - 1} taps={taps} />
      <li className="contents" style={at(col)}>
        <Caption n={i + 2} title={stage.title} where={stage.where} />
        <StageBox stage={stage} />
      </li>
    </>
  );
}
