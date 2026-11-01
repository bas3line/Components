import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { between, lamp, outside, ride, track } from "./motion";
import { Pixel, RackFace, RackStyle, Rail, Swap, Window } from "./parts";

/*
 * Six ready faces for rack modules: small UI mock-ups drawn in code, with
 * periwinkle line art and pixel squares. Each is a size container, so it lays
 * itself out for the card it sits in (a wide bento cell, a phone column).
 * Every prop has a default, so each renders a full example on its own.
 *
 * Addresses are from the documentation ranges, and every token is made up.
 */

/* Token · a form folds into one generated value ------------------------------ */

export type TokenField = { label: string; value: string };

const TOKEN_FIELDS: TokenField[] = [
  { label: "host", value: "db.example.net" },
  { label: "port", value: "5432" },
  { label: "user", value: "deploy" },
  { label: "key file", value: "id_ed25519" },
];

const L1 = 10_000;
const strikeAt = (i: number) => 600 + i * 450;

/** The token face's loop, for `n` fields: they strike out one by one, then the token arrives and later masks itself. */
function tokenCss(k: string, n: number) {
  const go = strikeAt(n - 1) + 300;
  const show = go + 450;
  const bg = (c: string) => `background-color:${c}`;
  const s = (x: number, o: number) => `transform:scaleX(${x});opacity:${o}`;
  return [
    ...Array.from({ length: n }, (_, i) => {
      const t = strikeAt(i);
      return [
        track(`${k}-r${i}`, L1, [
          [0, bg("transparent")],
          [t, bg("transparent")],
          [t + 300, bg("var(--pink-soft)")],
          [9300, bg("var(--pink-soft)")],
          [9800, bg("transparent")],
          [L1, bg("transparent")],
        ]),
        track(`${k}-s${i}`, L1, [
          [0, s(0, 1)],
          [t, s(0, 1)],
          [t + 300, s(1, 1)],
          [9300, s(1, 1)],
          [9800, s(1, 0)],
          [L1, s(0, 0)],
        ]),
        between(`${k}-m${i}`, L1, t, 9300),
      ];
    }).flat(),
    ride(`${k}-go`, L1, go, 450),
    between(`${k}-row`, L1, show, 9300),
    between(`${k}-val`, L1, show, 7200),
    // The mask is the inverse: whenever the token isn't showing, the mask is.
    track(`${k}-mask`, L1, [
      [0, "opacity:1"],
      [show, "opacity:1"],
      [show + 300, "opacity:0"],
      [7200, "opacity:0"],
      [7500, "opacity:1"],
      [L1, "opacity:1"],
    ]),
  ].join("");
}

/** The token, which later masks itself like any secret, on one line or split over two. */
function TokenValue({ k, token, rows, className }: { k: string; token: string; rows: 1 | 2; className: string }) {
  const half = Math.ceil(token.length / 2);
  const cut = (s: string) => (rows === 1 ? [s] : [s.slice(0, half), s.slice(half)]);
  return (
    <span className={cn("relative block min-w-0 font-mono whitespace-nowrap", className)}>
      <span className={cn("block", `${k}-val`)}>
        {cut(token).map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </span>
      <span className={cn("absolute inset-0 opacity-0", `${k}-mask`)}>
        {cut("•".repeat(token.length)).map((line, i) => (
          <span key={i} className="block">
            {line}
          </span>
        ))}
      </span>
    </span>
  );
}

/**
 * A form whose fields strike out one by one; a pixel rides across and one
 * generated token takes their place. Narrow cards add it as the form's last
 * row; wide ones print it in a slate window beside. Up to about a dozen fields.
 */
export function TokenFace({
  title = "connect",
  aside = "all required",
  fields = TOKEN_FIELDS,
  token = "example-token-0123456789abcdefgh",
  name = "token",
  tokenTitle = "your token",
  note = "the only setting you need.",
  label,
}: {
  title?: string;
  aside?: string;
  fields?: TokenField[];
  /** Shown in the clear, then masked. Use a made-up value. */
  token?: string;
  /** What the token is called on the form's added row. */
  name?: string;
  tokenTitle?: string;
  note?: string;
  label?: string;
}) {
  const n = Math.max(1, fields.length);
  const k = `rk-tok${n}`;
  return (
    <RackFace
      label={
        label ??
        `A ${title} form with its ${fields.map((f) => f.label).join(", ")} fields struck out one by one. In their place, one generated ${token.length}-character ${name}.`
      }
    >
      <RackStyle id={`rack-modules-token-${n}`} css={tokenCss(k, n)} />
      <div className="absolute inset-0 flex items-center justify-center px-3 @md:px-6">
        <Window title={title} aside={aside} className="w-full max-w-[340px] @2xl:w-[300px] @2xl:shrink-0 @3xl:w-[330px]">
          <ul className="flex flex-col gap-1 p-2">
            {fields.map((f, i) => (
              <li key={f.label} className={cn("flex h-[28px] items-center gap-2 bg-pink-soft px-1.5 @2xl:h-[30px]", `${k}-r${i}`)}>
                <span className={cn("w-2.5 shrink-0 font-mono text-[13px] text-ink", `${k}-m${i}`)}>-</span>
                <span className="w-[62px] shrink-0 font-mono text-[11px] text-ink-3">{f.label}</span>
                <span className="relative font-mono text-[12.5px] whitespace-nowrap text-ink-2">
                  {f.value}
                  <span className={cn("absolute inset-x-[-3px] top-[calc(50%-1px)] h-[2px] origin-left bg-ink", `${k}-s${i}`)} />
                </span>
              </li>
            ))}
            {/* Narrow cards: the token is the form's one added row. Wide cards print it beside. */}
            <li className={cn("flex flex-col gap-1 bg-mint px-1.5 py-1.5 @2xl:hidden", `${k}-row`)}>
              <span className="flex items-center gap-2 font-mono text-[11px] leading-none text-ink">
                <span className="w-2.5 shrink-0 text-[13px]">+</span>
                {name}
                <span className="ml-auto">{token.length} chars</span>
              </span>
              <TokenValue k={k} token={token} rows={1} className="pl-[18px] text-[12px] text-ink" />
            </li>
          </ul>
        </Window>
        {/* Widths sum to under each breakpoint's container, padding included. */}
        <Rail className="hidden w-12 shrink-0 @2xl:block @3xl:w-16" riders={[{ cls: `${k}-go` }]} />
        <Window
          night
          title={tokenTitle}
          aside={<span className="text-mint">{token.length} characters</span>}
          className="hidden w-[264px] shrink-0 @2xl:flex @3xl:w-[310px]"
        >
          <div className="px-3.5 pt-3.5 pb-3.5">
            <TokenValue k={k} token={token} rows={2} className="text-[17px] leading-[1.5] text-mint-pale @3xl:text-[19px]" />
          </div>
          <p className="border-t border-night-line px-3.5 py-2.5 font-mono text-[11px] text-white/70">{note}</p>
        </Window>
      </div>
    </RackFace>
  );
}

/* Deploy · request, thirty pixels of build, then running --------------------- */

const L2 = 8000;
const PAID = 600;
const BAR = [1300, 4300] as const;
const UP = 5000;
const DONE2 = 7500;
const DEPLOY_CSS = [
  lamp("rk-dp-in", L2, "background-color", "var(--line-2)", "var(--mint)", PAID, DONE2),
  between("rk-dp-s-a", L2, PAID, DONE2, 200),
  outside("rk-dp-s-b", L2, PAID, DONE2, 200),
  ride("rk-dp-go0", L2, PAID + 200, 500, "Y"),
  // Thirty pixels, revealed in thirty hard steps.
  track("rk-dp-bar", L2, [
    [0, "clip-path:inset(0 100% 0 0)"],
    [BAR[0], "clip-path:inset(0 100% 0 0);animation-timing-function:steps(30,end)"],
    [BAR[1], "clip-path:inset(0 0 0 0)"],
    [DONE2, "clip-path:inset(0 0 0 0);opacity:1"],
    [DONE2 + 300, "clip-path:inset(0 0 0 0);opacity:0"],
    [L2, "clip-path:inset(0 100% 0 0);opacity:0"],
  ]),
  ride("rk-dp-go1", L2, BAR[1] + 100, 500, "Y"),
  lamp("rk-dp-run", L2, "background-color", "var(--line-2)", "var(--mint)", UP, DONE2),
  between("rk-dp-r-a", L2, UP, DONE2, 200),
  outside("rk-dp-r-b", L2, UP, DONE2, 200),
  between("rk-dp-out", L2, UP, DONE2),
].join("");

const PIXELS = Array.from({ length: 30 }, (_, i) => i);

function PixelRow({ className }: { className: string }) {
  return (
    <span className="grid grid-cols-[repeat(30,minmax(0,1fr))] gap-[3px]">
      {PIXELS.map((i) => (
        <span key={i} className={cn("aspect-square", className)} />
      ))}
    </span>
  );
}

/**
 * A request is accepted, thirty pixels of progress fill in hard steps, and a
 * panel comes up running with its details. Pixels ride the rails between.
 */
export function DeployFace({
  requestTitle = "push",
  request = "main @ 4f1c2a9, signed",
  waiting = "waiting",
  accepted = "accepted",
  progress = "building",
  estimate = "about 40 s",
  panelTitle = "app",
  building = "building",
  running = "running",
  rows = [
    ["ipv4", "192.0.2.24"],
    ["url", "app.example.com"],
  ],
  label,
}: {
  requestTitle?: string;
  request?: string;
  waiting?: string;
  accepted?: string;
  progress?: string;
  estimate?: string;
  panelTitle?: string;
  building?: string;
  running?: string;
  /** The panel's details, revealed once it runs. */
  rows?: [term: string, value: string][];
  label?: string;
}) {
  return (
    <RackFace
      label={
        label ??
        `A ${requestTitle} is ${accepted}, thirty pixels of ${progress} fill in, then the ${panelTitle} panel shows it ${running}: ${rows.map(([t, v]) => `${t} ${v}`).join(", ")}.`
      }
    >
      <RackStyle id="rack-modules-deploy" css={DEPLOY_CSS} />
      <div className="absolute inset-0 flex flex-col justify-center px-4 @md:px-6">
        <Window
          title={
            <>
              <Pixel className="rk-dp-in bg-mint" />
              {requestTitle}
            </>
          }
          aside={<Swap cls="rk-dp-s" before={waiting} after={accepted} className="justify-items-end" />}
        >
          <p className="truncate px-2.5 py-2 font-mono text-[12px] text-ink-2">{request}</p>
        </Window>
        <Rail vertical className="h-4 shrink-0 self-center" riders={[{ cls: "rk-dp-go0" }]} />
        <div className="flex flex-col gap-1.5">
          <span className="flex justify-between font-mono text-[11px] text-ink-3">
            <span>{progress}</span>
            <span>{estimate}</span>
          </span>
          <span className="relative block">
            <PixelRow className="bg-line-2" />
            <span className="rk-dp-bar absolute inset-0">
              <PixelRow className="bg-mint" />
            </span>
          </span>
        </div>
        <Rail vertical className="h-4 shrink-0 self-center" riders={[{ cls: "rk-dp-go1" }]} />
        <Window
          title={panelTitle}
          aside={
            <span className="flex items-center gap-2">
              <Pixel className="rk-dp-run bg-mint" />
              <Swap cls="rk-dp-r" before={building} after={running} />
            </span>
          }
        >
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 px-2.5 py-2 font-mono text-[12px]">
            {rows.map(([term, value]) => (
              <div key={term} className="contents">
                <dt className="text-ink-3">{term}</dt>
                <dd className="rk-dp-out text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </Window>
      </div>
    </RackFace>
  );
}

/* Picker · a list that cycles through a few choices -------------------------- */

export type PickerOption = { name: string; detail?: string; access?: string };

const PICKER_OPTIONS: PickerOption[] = [
  { name: "Debian", detail: "versions: 12 · 13", access: "root" },
  { name: "Ubuntu", detail: "versions: 24.04 · 26.04", access: "root" },
  { name: "Fedora", detail: "versions: 43 · 44", access: "root" },
  { name: "Alpine", detail: "versions: 3.22 · 3.23", access: "root" },
  { name: "Arch Linux", detail: "versions: rolling", access: "root" },
  { name: "FreeBSD", detail: "versions: 14 · 15", access: "root" },
  { name: "NixOS", detail: "versions: 25.11 · 26.05", access: "root" },
  { name: "Windows Server", detail: "versions: 2022 · 2025", access: "RDP" },
];

/** Each pick holds the highlight for an equal share of a loop of 2.4 s per pick. */
function pickerCss(k: string, picks: number) {
  const loop = 2400 * picks;
  const share = 100 / picks;
  return [
    `@keyframes ${k}{0%,${share.toFixed(2)}%{opacity:1}${(share + 0.01).toFixed(2)}%,100%{opacity:0}}`,
    ...Array.from(
      { length: picks },
      (_, f) => `.${k}-${f}{animation:${k} ${loop}ms linear ${f ? f * (loop / picks) - loop : 0}ms infinite}`,
    ),
  ].join("");
}

/**
 * A picker in a two-column grid. The highlight cycles through `picks`, and the
 * footer shows the highlighted option's details beside an action button.
 */
export function PickerFace({
  title = "base image",
  aside = "panel",
  options = PICKER_OPTIONS,
  picks = ["Debian", "Alpine", "Windows Server"],
  action = "rebuild",
  label,
}: {
  title?: string;
  aside?: string;
  options?: PickerOption[];
  /** Names from `options` the highlight cycles through, first to last. */
  picks?: string[];
  action?: string;
  label?: string;
}) {
  const picked = picks.flatMap((name) => options.filter((o) => o.name === name));
  const k = `rk-pk${picked.length}`;
  return (
    <RackFace
      label={
        label ??
        `A ${title} picker listing ${options.map((o) => o.name).join(", ")}, its highlight moving through ${picked.map((o) => o.name).join(", ")}.`
      }
    >
      {picked.length ? <RackStyle id={`rack-modules-picker-${picked.length}`} css={pickerCss(k, picked.length)} /> : null}
      <div className="absolute inset-0 flex flex-col justify-center px-4 @md:px-6">
        <Window title={title} aside={aside}>
          <ul className="grid grid-cols-2 gap-0.5 p-1.5">
            {options.map((o) => {
              const f = picked.findIndex((p) => p.name === o.name);
              return (
                <li
                  key={o.name}
                  className="relative flex h-[26px] min-w-0 items-center gap-2 px-2 font-mono text-[12px] text-ink-2"
                >
                  {f >= 0 ? (
                    <span className={cn("absolute inset-0 bg-mint", f > 0 && "opacity-0", `${k}-${f}`)}>
                      <span className="absolute top-[calc(50%-3.5px)] left-2 size-[7px] bg-ink" />
                    </span>
                  ) : null}
                  <span className="relative size-[7px] shrink-0 border border-ink-3" />
                  <span className="relative truncate">{o.name}</span>
                </li>
              );
            })}
          </ul>
          <div className="flex items-center gap-3 border-t border-line px-2.5 py-2">
            <span className="grid min-w-0 flex-1">
              {picked.map((o, f) => (
                <span
                  key={o.name}
                  className={cn(
                    "col-start-1 row-start-1 min-w-0 font-mono text-[11px] leading-[16px]",
                    f > 0 && "opacity-0",
                    `${k}-${f}`,
                  )}
                >
                  <span className="block truncate text-ink-2">{o.detail ?? o.name}</span>
                  {o.access ? (
                    <span className="block truncate text-ink-3">
                      access: <span className="text-ink">{o.access}</span>
                    </span>
                  ) : null}
                </span>
              ))}
            </span>
            <span className="notch flex h-8 shrink-0 items-center bg-mint pr-4 pl-3 font-mono text-[12px] text-ink">
              {action}
            </span>
          </div>
        </Window>
      </div>
    </RackFace>
  );
}

/* Timeline · a strip of days, and today walking along it -------------------- */

export type TimelineSegment = {
  days: number;
  label: string;
  note?: string;
  /** The legend line on narrow cards. Defaults to the label. */
  short?: string;
  /** "gone" is drawn empty and dashed; today stops where the first one starts. */
  tone: "hatch" | "mint" | "peri" | "gone";
};

const CELL: Record<TimelineSegment["tone"], string> = {
  hatch: "bg-pink-soft bg-hatch [--hatch:var(--pink)]",
  mint: "bg-mint-pale",
  peri: "bg-peri-soft",
  gone: "border border-dashed border-ink-3",
};

const TIMELINE_SEGMENTS: TimelineSegment[] = [
  { days: 7, tone: "hatch", label: "hourly", note: "kept 7 days", short: "hourly, kept 7 days" },
  { days: 14, tone: "mint", label: "daily for 14 days", note: "or any window you set", short: "daily for 14 days, or any window" },
  { days: 5, tone: "peri", label: "weekly" },
  { days: 9, tone: "gone", label: "pruned", note: "once the window closed", short: "pruned once the window closed" },
];

const L4 = 9000;
const ARRIVE = 6000;
const TIMELINE_CSS = [
  track("rk-tl-now", L4, [
    [0, "transform:translateX(0);opacity:0"],
    [300, "transform:translateX(0);opacity:1;animation-timing-function:linear"],
    [ARRIVE, "transform:translateX(100%);opacity:1"],
    [8500, "transform:translateX(100%);opacity:1"],
    [8800, "transform:translateX(100%);opacity:0"],
    [L4, "transform:translateX(0);opacity:0"],
  ]),
  lamp("rk-tl-act", L4, "background-color", "var(--pink-soft)", "var(--pink)", ARRIVE, ARRIVE + 900),
  between("rk-tl-gone", L4, ARRIVE + 100, 8600),
].join("");

/**
 * A settings row with a typed value and an action, over a strip of days split
 * into segments. Today walks the strip to where the first "gone" segment
 * starts, and the action lights as it arrives. Wide cards bracket each
 * segment; narrow ones show a legend.
 */
export function TimelineFace({
  title = "snapshots",
  aside = "panel",
  field = "keep dailies for",
  value = "14 days",
  action = "prune",
  segments = TIMELINE_SEGMENTS,
  tick = 7,
  label,
}: {
  title?: string;
  aside?: string;
  field?: string;
  value?: string;
  action?: string;
  segments?: TimelineSegment[];
  /** Days between the ruler's numbers. */
  tick?: number;
  label?: string;
}) {
  const placed = segments.map((s, i) => {
    const from = segments.slice(0, i).reduce((sum, p) => sum + p.days, 0);
    return { ...s, from, to: from + s.days };
  });
  const days = placed.length ? placed[placed.length - 1].to : 1;
  const end = placed.find((s) => s.tone === "gone")?.from ?? days;
  const cols: CSSProperties = { gridTemplateColumns: `repeat(${days},minmax(0,1fr))` };
  const span = (from: number, to: number): CSSProperties => ({ gridColumn: `${from + 1} / ${to + 1}` });
  const ticks = Array.from({ length: Math.ceil(days / tick) }, (_, i) => i * tick);
  return (
    <RackFace
      label={
        label ??
        `A ${days}-day strip: ${placed.map((s) => `${s.label}${s.note ? `, ${s.note}` : ""}`).join("; then ")}. Today walks it to ${end < days ? `day ${end + 1}` : "its end"}.`
      }
    >
      <RackStyle id="rack-modules-timeline" css={TIMELINE_CSS} />
      <div className="absolute inset-0 flex flex-col justify-center px-4 @md:px-6 @2xl:px-8">
        <Window title={title} aside={aside}>
          <div className="flex items-center gap-2.5 p-2.5 font-mono text-[12px] text-ink-2">
            <span className="whitespace-nowrap">{field}</span>
            <span className="flex h-7 shrink-0 items-center gap-1 border border-line-2 bg-bg px-2 text-[12.5px] text-ink">
              {value}
              <span className="animate-caret h-3.5 w-[2px] shrink-0 bg-ink" />
            </span>
            <span className="rk-tl-act notch ml-auto flex h-7 shrink-0 items-center border border-ink bg-pink-soft pr-3.5 pl-2.5 text-ink">
              {action}
            </span>
          </div>
        </Window>

        <div className="mt-4 @2xl:mt-5">
          {/* The ruler: day numbers, a tick apart. */}
          <div className="grid gap-x-[2px] font-mono text-[11px] leading-none text-ink-3" style={cols}>
            {ticks.map((d) => (
              <span key={d} style={span(d, Math.min(d + tick, days))} className="pb-1.5">
                {d === 0 ? "day 1" : d + 1}
              </span>
            ))}
          </div>
          <div className="relative">
            <div className="grid h-5 gap-x-[2px] @2xl:h-7" style={cols}>
              {placed.flatMap((s) =>
                Array.from({ length: s.days }, (_, i) => <span key={s.from + i} className={CELL[s.tone]} />),
              )}
            </div>
            {/* Today: walks the strip to the first day that is gone. */}
            <span
              aria-hidden
              className="pointer-events-none absolute inset-y-[-5px] left-0"
              style={{ width: `${(end / days) * 100}%` }}
            >
              <span className="rk-tl-now absolute inset-0" style={{ transform: "translateX(100%)" }}>
                <span className="absolute inset-y-0 left-[-2px] w-[2px] bg-ink" />
                <span className="absolute top-[-3px] left-[-5px] size-[8px] bg-ink" />
              </span>
            </span>
          </div>

          {/* Wide: a bracket under each stretch of the strip. */}
          <div className="mt-2 hidden gap-x-[2px] @2xl:grid" style={cols}>
            {placed.map((s) => (
              <div key={s.from} style={span(s.from, s.to)} className={cn("min-w-0", s.tone === "gone" && "rk-tl-gone")}>
                <span className="block h-1.5 border-x border-b border-ink-3" />
                <span className="mt-1.5 block truncate font-mono text-[11px] leading-[15px] text-ink-2">{s.label}</span>
                {s.note ? (
                  <span className="block truncate font-mono text-[11px] leading-[15px] text-ink-3">{s.note}</span>
                ) : null}
              </div>
            ))}
          </div>

          {/* Narrow: a legend. */}
          <ul className="mt-3 flex flex-col gap-1.5 font-mono text-[11px] leading-[14px] text-ink-2 @2xl:hidden">
            {placed.map((s) => (
              <li key={s.from} className={cn("flex items-center gap-2", s.tone === "gone" && "rk-tl-gone")}>
                <span className={cn("size-[10px] shrink-0", CELL[s.tone])} />
                <span className="truncate">{s.short ?? s.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </RackFace>
  );
}

/* Drain · a log sliding down into a sink ------------------------------------- */

const DRAIN_LINES: [source: string, line: string][] = [
  ["192.0.2.51", "GET /health 200"],
  ["192.0.2.8", "POST /api/jobs 201"],
  ["192.0.2.97", "GET /assets/app.css 200"],
  ["192.0.2.23", "PUT /api/jobs/7 204"],
  ["192.0.2.140", "GET /metrics 200"],
  ["192.0.2.66", "DELETE /api/cache 204"],
];

const DRAIN_CSS = "@keyframes rk-drain{from{transform:translateY(-50%)}to{transform:none}}.rk-drain{animation:rk-drain 15s linear infinite}";

/**
 * A slate log window whose lines drift down, steadily and without a seam, into
 * a hatched sink at its foot. Chips under it say what is kept.
 */
export function DrainFace({
  title = "requests.log",
  status = "retention 0",
  lines = DRAIN_LINES,
  sink = "/dev/null",
  chips = [
    ["stored", "none"],
    ["shipped", "none"],
  ],
  label,
}: {
  title?: string;
  status?: ReactNode;
  /** Source and line; the source column fits 13 characters, an address like 192.0.2.140. */
  lines?: [source: string, line: string][];
  sink?: string;
  chips?: [term: string, value: string][];
  label?: string;
}) {
  return (
    <RackFace
      label={
        label ??
        `The ${title} file, ${lines.length} lines scrolling down into ${sink}. ${chips.map(([t, v]) => `${t}: ${v}`).join(", ")}.`
      }
    >
      <RackStyle id="rack-modules-drain" css={DRAIN_CSS} />
      <div className="absolute inset-3 flex flex-col gap-2">
        <Window
          night
          title={title}
          aside={
            <span className="flex items-center gap-2">
              <span className="rk-led size-[6px] bg-mint" />
              {status}
            </span>
          }
          className="min-h-0 flex-1"
        >
          <div className="relative flex-1 overflow-hidden">
            {/* Two copies, sliding down by one: the loop has no seam. Speed stays the same for any length. */}
            <ul className="rk-drain absolute inset-x-0 top-0" style={{ animationDuration: `${lines.length * 2500}ms` }}>
              {[...lines, ...lines].map(([source, line], i) => (
                <li key={i} className="flex h-[26px] items-center gap-3 px-3 font-mono text-[12px] whitespace-nowrap">
                  <span className="w-[98px] shrink-0 text-mint-pale/80">{source}</span>
                  <span className="text-white/85">{line}</span>
                </li>
              ))}
            </ul>
            <div className="absolute inset-x-0 bottom-0 flex h-11 items-center justify-center border-t border-dashed border-night-line bg-night bg-hatch [--hatch:var(--night-line)]">
              <span className="bg-night px-2 py-0.5 font-mono text-[12px] text-mint">{sink}</span>
            </div>
          </div>
        </Window>
        <ul className="flex flex-wrap gap-2">
          {chips.map(([term, value]) => (
            <li
              key={term}
              className="flex h-7 items-center gap-2 border border-line-2 bg-paper px-2 font-mono text-[11.5px] whitespace-nowrap text-ink-2"
            >
              <Pixel className="bg-pink" />
              {term}: <span className="text-ink">{value}</span>
            </li>
          ))}
        </ul>
      </div>
    </RackFace>
  );
}

/* Address · one lit cell in a /24, and a meter ------------------------------- */

const BLOCK = Array.from({ length: 256 }, (_, i) => i);

const L6 = 6400;
const ADDRESS_CSS = track("rk-ad-flow", L6, [
  [0, "transform:scaleX(.38)"],
  [1400, "transform:scaleX(.74)"],
  [2600, "transform:scaleX(.52)"],
  [4200, "transform:scaleX(.9)"],
  [5400, "transform:scaleX(.6)"],
  [L6, "transform:scaleX(.38)"],
]);

/**
 * A /24 drawn as 32 × 8 cells with one address lit, beside a window whose
 * meter breathes. Side by side on wide cards, stacked on narrow ones.
 */
export function AddressFace({
  network = "198.51.100",
  host = 42,
  blockNote = "1 of 256",
  hostNote = "reserved for this box",
  meterTitle = "throughput",
  meterAside = "eth0",
  meterValue = "1 Gbps",
  meterNote = "shaping: off",
  label,
}: {
  /** The first three octets; use a documentation range in examples. */
  network?: string;
  /** The lit address's last octet, 0 to 255. */
  host?: number;
  blockNote?: string;
  hostNote?: string;
  meterTitle?: string;
  meterAside?: string;
  meterValue?: string;
  meterNote?: string;
  label?: string;
}) {
  return (
    <RackFace
      label={
        label ??
        `The block ${network}.0/24 with one address, ${network}.${host}, lit: ${hostNote}. Beside it a ${meterTitle} meter, ${meterValue}.`
      }
    >
      <RackStyle id="rack-modules-address" css={ADDRESS_CSS} />
      <div className="absolute inset-0 flex flex-col justify-center gap-3.5 px-4 @md:px-6 @xl:flex-row @xl:items-center @xl:gap-6">
        <div className="w-full max-w-[300px] @xl:w-[300px] @xl:shrink-0">
          <div className="mb-1.5 flex justify-between gap-3 font-mono text-[11px] text-ink-3">
            <span>{network}.0/24</span>
            <span>{blockNote}</span>
          </div>
          <div className="grid grid-cols-[repeat(32,minmax(0,1fr))] gap-[2px]">
            {BLOCK.map((i) => (
              <span key={i} className={cn("aspect-square", i === host ? "rk-led bg-mint" : "bg-line-2")} />
            ))}
          </div>
          <div className="mt-1.5 flex items-center gap-2 font-mono text-[11px] text-ink">
            <Pixel className="bg-mint" />
            {network}.{host}
            <span className="text-ink-3">· {hostNote}</span>
          </div>
        </div>
        <Window title={meterTitle} aside={meterAside} className="w-full max-w-[300px] @xl:max-w-none @xl:flex-1">
          <div className="px-2.5 pt-2.5 pb-3">
            <div className="flex items-baseline justify-between gap-3 font-mono">
              <span className="text-[15px] text-ink">{meterValue}</span>
              <span className="text-[11px] text-ink-3">{meterNote}</span>
            </div>
            <div className="relative mt-2 h-3 overflow-hidden border border-line-2 bg-bg">
              <span
                className="rk-ad-flow absolute inset-y-0 left-0 w-full origin-left bg-peri"
                style={{ transform: "scaleX(.62)" }}
              />
            </div>
          </div>
        </Window>
      </div>
    </RackFace>
  );
}
