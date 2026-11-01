"use client";

import { memo, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { cn } from "@/lib/cn";
import { DEFAULT_START, DEFAULT_WINDOWS } from "./content";
import {
  CSS,
  FIELD_MS,
  GEN_MS,
  KEY_MS,
  RUN_AT,
  RUN_MS,
  START,
  TYPE_MS,
  UPLOAD_MS,
  between,
  blink,
  ticks,
  until,
} from "./motion";
import { Bar, Contours, Dot, Halt, Parked, PixelCheck, Screw, Spin, Stack, Tick, Typed, Vents, keyCount } from "./parts";

/* What a window holds ------------------------------------------------------ */

type Pause = {
  /** Milliseconds to hold after the line before the next one starts. */
  pause?: number;
};

/**
 * One line of a transcript. In `text`, `done` and `note`, `**word**` sets a word in
 * bold deep mint.
 */
export type TranscriptLine =
  /** Typed after the prompt, one key at a time; the cursor parks after it until the next line. */
  | ({ kind: "command"; text: string } & Pause)
  /** Printed whole behind a pixel. A `value` prints under it a character at a time; `mask` then hides all but its first four. */
  | ({ kind: "info"; text: string; value?: string; mask?: boolean; note?: string } & Pause)
  /** A spinner while it works (and a progress bar, with `bar`), then a tick and `done`. */
  | ({ kind: "wait"; text: string; done: string; ms?: number; bar?: boolean; note?: string } & Pause)
  /** A tick, printed whole. */
  | ({ kind: "ok"; text: string; note?: string } & Pause)
  /** A label, then `keys` masked keystrokes (8 by default). */
  | ({ kind: "secret"; text: string; keys?: number; note?: string } & Pause)
  /** A labelled rule between two parts of the session. */
  | ({ kind: "rule"; text: string } & Pause);

/** One required box of a form. Values may hold ▒ runs, drawn as redaction bars. */
export type FormField = {
  label: string;
  /** What gets typed in, or the file name once an upload lands. Empty for boxes never reached. */
  value?: string;
  /** Makes it an upload: the label shown beside the progress cells, e.g. "uploading". */
  upload?: string;
  /** A pink tag after the value, shown when the form stops at this field, e.g. "in review". */
  tag?: string;
};

/** The words under a window: a pixel and a name, a big line with one marked phrase, a sentence. */
export type RaceCaption = {
  name: string;
  /** Before the marked phrase, e.g. "stuck at". */
  lead?: string;
  /** Highlighted: lime for the window that finishes, pink for one that stalls. */
  mark: string;
  text: string;
};

/** The footer strip of a window. */
export type RaceFoot = {
  /** Shown while it runs. A form's defaults to "continue →". */
  before?: string;
  /** Shown once it finishes or stalls. A form's defaults to "submitted" or "waiting on review". */
  after?: string;
  /** Pinned to the right of a transcript's footer, from sm up. Forms show their progress there instead. */
  aside?: string;
};

type WindowBase = {
  /** Centred in the title bar. */
  title: string;
  /** The window's own heading, and a small note across from it. */
  heading: string;
  note?: string;
  /**
   * The index of the line or field where it stops for good. Leave it out and the
   * window finishes. A stalled line keeps its spinner until the race is over.
   */
  stallAt?: number;
  /** Shown under the last line or field when it stalls. */
  notice?: string;
  foot?: RaceFoot;
  caption: RaceCaption;
};

/** A session that prints line by line, and ends at a ready prompt on a lime bar. */
export type TranscriptWindow = WindowBase & {
  kind: "transcript";
  lines: TranscriptLine[];
  /** The glyph in front of every command. */
  prompt?: string;
  /** The ready prompt on the lime bar once it finishes. */
  done?: string;
};

/** A form of required boxes, typed into in order. */
export type FormWindow = WindowBase & {
  kind: "form";
  fields: FormField[];
};

export type RaceWindow = TranscriptWindow | FormWindow;

/* Timelines ---------------------------------------------------------------- */

// A transcript starts a beat before the form does, as it did on the stage this came from.
const LEAD = { transcript: 250, form: 300 } as const;
// How long a line holds before the next one starts. A rule takes an extra beat of air above it.
const HOLD: Record<TranscriptLine["kind"], number> = { command: 420, info: 380, wait: 300, ok: 400, secret: 300, rule: 300 };
const RULE_LEAD = 150;
const MASK_AFTER = 900;
const NOTICE_AFTER = 500;
// When something stalls, it keeps spinning at least this long before the race is called.
const STALL_HOLD = 1500;

type Beat = { line: TranscriptLine; at: number; end: number; next: number };
type Slot = { at: number; done: number };

type Plan = {
  /** When the first beat lands. */
  start: number;
  /** When it finishes, or when it stops for good. */
  end: number;
  stalled: boolean;
  beats: Beat[];
  slots: Slot[];
};

const stallIndex = (w: RaceWindow) => {
  const n = w.kind === "form" ? w.fields.length : w.lines.length;
  return w.stallAt !== undefined && w.stallAt >= 0 && w.stallAt < n ? w.stallAt : undefined;
};

function planTranscript(w: TranscriptWindow): Plan {
  const stop = stallIndex(w);
  let t = START + LEAD.transcript;
  const beats = w.lines.slice(0, stop === undefined ? undefined : stop + 1).map((line) => {
    const at = line.kind === "rule" ? t + RULE_LEAD : t;
    let end = at;
    let hold = HOLD[line.kind];
    if (line.kind === "command") end = at + keyCount(line.text) * TYPE_MS;
    if (line.kind === "info" && line.value) {
      end = at + keyCount(line.value) * GEN_MS;
      hold = 350;
    }
    if (line.kind === "secret") end = at + (line.keys ?? 8) * KEY_MS;
    if (line.kind === "wait") end = at + (line.ms ?? (line.bar ? 1700 : 1300));
    t = end + (line.pause ?? hold);
    return { line, at, end, next: t };
  });
  const last = beats[beats.length - 1];
  return {
    start: beats[0]?.at ?? t,
    end: stop === undefined ? t + 100 : last.end,
    stalled: stop !== undefined,
    beats,
    slots: [],
  };
}

function planForm(w: FormWindow): Plan {
  const stop = stallIndex(w);
  // One slot per field, typed (or uploaded) in order, up to the field it stops at.
  let cursor = START + LEAD.form;
  const slots = w.fields.slice(0, stop === undefined ? undefined : stop + 1).map((f) => {
    const at = cursor;
    const done = at + (f.upload ? UPLOAD_MS : 110 + keyCount(f.value ?? "") * FIELD_MS);
    cursor = done + 140;
    return { at, done };
  });
  return {
    start: slots[0]?.at ?? cursor,
    end: stop === undefined ? cursor + 260 : slots[stop].done,
    stalled: stop !== undefined,
    beats: [],
    slots,
  };
}

const plan = (w: RaceWindow) => (w.kind === "form" ? planForm(w) : planTranscript(w));

/** Plays while the figure overlaps the top three quarters of the window; pauses otherwise. */
function usePlaying(target: RefObject<Element | null>) {
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const el = target.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setPlaying(entry.isIntersecting), {
      rootMargin: "0px 0px -25% 0px",
    });
    io.observe(el);
    return () => io.disconnect();
  }, [target]);
  return playing;
}

/** `**word**` in a line, set bold in deep mint. */
function rich(text: string): ReactNode {
  if (!text.includes("**")) return text;
  return text.split("**").map((part, i) =>
    i % 2 ? (
      <span key={i} className="font-semibold text-accent">
        {part}
      </span>
    ) : (
      part
    ),
  );
}

const plain = (text: string) => text.replaceAll("**", "").replace(/▒+/g, "…");

/* Window chrome ------------------------------------------------------------ */

type Led = "mint" | "lime" | "pink";
const LEDS: Led[] = ["mint", "lime", "pink"];
const LED_BG: Record<Led, string> = { mint: "bg-mint", lime: "bg-lime", pink: "bg-pink" };

/** Slate title bar: three square LEDs, one of them lit (and blinking while it works), a mono title, a status. */
function TitleBar({ title, busy, p, raceEnd }: { title: string; busy: string; p: Plan; raceEnd: number }) {
  const lit: Led = p.stalled ? "pink" : "mint";
  const litStyle = p.stalled ? blink(p.end, raceEnd) : blink(p.start, p.end);
  return (
    <div aria-hidden className="flex h-10 items-center gap-3 bg-night px-4 font-mono text-[12px] leading-none">
      <span className="flex shrink-0 gap-[5px]">
        {LEDS.map((led) => (
          <span
            key={led}
            className={cn("size-2", LED_BG[led], led !== lit && "opacity-30")}
            style={led === lit ? litStyle : undefined}
          />
        ))}
      </span>
      <span className="min-w-0 flex-1 truncate text-center text-white/80">{title}</span>
      <Stack className="shrink-0 justify-items-end">
        <span className="invisible text-white/70" style={between(0, p.start)}>
          ready
        </span>
        <span className="invisible text-mint-pale" style={between(p.start, p.end)}>
          {busy}
        </span>
        <span className={p.stalled ? "text-pink" : "text-mint"} style={until(p.end)}>
          {p.stalled ? "stopped" : "done"}
        </span>
      </Stack>
    </div>
  );
}

/** One transcript line: a fixed gutter for the glyph, wrapped text with a hanging indent. */
function Line({
  glyph,
  children,
  className,
  style,
}: {
  glyph?: ReactNode;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div className={cn("grid grid-cols-[1.7em_minmax(0,1fr)]", className)} style={style}>
      <span className="flex h-[1.75em] items-center">{glyph}</span>
      <span className="min-w-0 break-words">{children}</span>
    </div>
  );
}

const Note = ({ text }: { text?: string }) => (text ? <span className="block text-ink-3">{rich(text)}</span> : null);

/** Spins until the race is called, then rests as a pink pixel: where a run stopped. */
function Stalled({ from, to, className, spin }: { from: number; to: number; className?: string; spin?: string }) {
  return (
    <Stack className={cn("place-items-center", className)}>
      <span className="invisible" style={between(from, to)}>
        <Spin to={to} className={spin} />
      </span>
      <span className="flex" style={until(to)}>
        <Halt />
      </span>
    </Stack>
  );
}

// Both windows share the body measure; the two-up layout at lg is the narrowest, so it steps down a size there.
const BODY = "font-mono text-[14px] leading-[1.75] lg:text-[13px] xl:text-[14px]";
const PAD = "px-4 sm:px-6 lg:px-5 xl:px-6";
const HEAD = cn("flex flex-wrap items-baseline justify-between gap-x-3 border-b border-line bg-bg py-3", PAD);
const FOOT = cn(
  "flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-line bg-bg py-3 font-mono text-[12px] text-ink-3",
  PAD,
);
const FRAME = "flex flex-1 flex-col border border-line-2 bg-paper text-ink";

function Head({ w }: { w: RaceWindow }) {
  return (
    <div className={HEAD}>
      <span className="font-sans text-[16px] font-semibold text-ink">{w.heading}</span>
      {w.note ? <span className="text-[12px] text-ink-3">{w.note}</span> : null}
    </div>
  );
}

/* A transcript ------------------------------------------------------------- */

function TranscriptRow({ b, prompt, last, raceEnd }: { b: Beat; prompt: ReactNode; last: boolean; raceEnd: number }) {
  const { line, at, end, next } = b;
  switch (line.kind) {
    case "command":
      return (
        <Line style={until(at)} glyph={prompt}>
          <span className="font-medium">
            <Typed text={line.text} at={at} per={TYPE_MS} cursor="block" />
            <Parked from={end} to={last ? raceEnd : next} />
          </span>
        </Line>
      );
    case "info": {
      const mask = end + MASK_AFTER;
      return (
        <Line style={until(at)} glyph={<Dot />}>
          {rich(line.text)}
          {line.value && line.mask ? (
            <Stack className="font-medium break-all">
              <span className="invisible" style={between(0, mask)}>
                <Typed text={line.value} at={at} per={GEN_MS} cursor="block" loose />
              </span>
              <span style={until(mask)}>
                {Array.from(line.value).slice(0, 4).join("") + "•".repeat(Math.max(0, keyCount(line.value) - 4))}
              </span>
            </Stack>
          ) : line.value ? (
            <span className="block font-medium break-all">
              <Typed text={line.value} at={at} per={GEN_MS} cursor="block" loose />
            </span>
          ) : null}
          <Note text={line.note} />
        </Line>
      );
    }
    case "secret":
      return (
        <Line style={until(at)} glyph={<Dot />}>
          {rich(line.text)} <Typed text={"*".repeat(line.keys ?? 8)} at={at} per={KEY_MS} cursor="block" />
          <Note text={line.note} />
        </Line>
      );
    case "ok":
      return (
        <Line style={until(at)} glyph={<Tick />}>
          {rich(line.text)}
          <Note text={line.note} />
        </Line>
      );
    case "rule":
      return (
        <div className="mt-3 flex items-center gap-3 text-[12px] text-ink-3" style={until(at)}>
          <span className="shrink-0">{line.text}</span>
          <span className="h-px flex-1 bg-line-2" />
        </div>
      );
    case "wait": {
      const bar = line.bar ? (
        <>
          {" "}
          <Bar at={ticks(at, end).map((t, j) => (last && j >= 6 ? null : t))} on="bg-mint" />
        </>
      ) : null;
      // The last line of a stalled run never gets its tick: its spinner holds until the race is called.
      if (last) {
        return (
          <Line className={cn(!line.bar && "text-ink-3")} style={until(at)} glyph={<Stalled from={at} to={raceEnd} spin="text-accent" />}>
            {rich(line.text)}
            {bar}
          </Line>
        );
      }
      return (
        <Stack as="div">
          <Line
            className={cn("invisible", !line.bar && "text-ink-3")}
            style={between(at, end)}
            glyph={<Spin to={end} className="text-accent" />}
          >
            {rich(line.text)}
            {bar}
          </Line>
          <Line style={until(end)} glyph={<Tick />}>
            {rich(line.done)}
            <Note text={line.note} />
          </Line>
        </Stack>
      );
    }
  }
}

const TranscriptPane = memo(function TranscriptPane({ w, p, raceEnd }: { w: TranscriptWindow; p: Plan; raceEnd: number }) {
  const prompt = <span className="font-semibold text-accent">{w.prompt ?? "$"}</span>;
  return (
    <div aria-hidden className={FRAME}>
      <TitleBar title={w.title} busy="running" p={p} raceEnd={raceEnd} />

      <div className={cn("flex flex-1 flex-col", BODY)}>
        <Head w={w} />

        <div className={cn("flex flex-col gap-2.5 pt-6 pb-5", PAD)}>
          {p.beats.map((b, i) => (
            <TranscriptRow key={i} b={b} prompt={prompt} last={p.stalled && i === p.beats.length - 1} raceEnd={raceEnd} />
          ))}
          {p.stalled && w.notice ? (
            <Line className="mt-2" style={until(p.end + NOTICE_AFTER)} glyph={<Halt />}>
              <span className="text-pretty">{w.notice}</span>
            </Line>
          ) : null}
        </div>

        {p.stalled ? null : (
          <div className={cn("mt-auto bg-lime py-3 font-semibold", PAD)} style={until(p.end)}>
            {w.done ?? "$"} <span className="animate-caret bg-ink">{" "}</span>
          </div>
        )}
      </div>

      <div className={FOOT}>
        <Stack>
          <span className="invisible" style={between(0, p.end)}>
            {w.foot?.before}
          </span>
          <span className="text-ink" style={until(p.end)}>
            {w.foot?.after}
          </span>
        </Stack>
        {w.foot?.aside ? <span className="hidden shrink-0 sm:inline">{w.foot.aside}</span> : null}
      </div>
    </div>
  );
});

/* A form ------------------------------------------------------------------- */

const ROW = cn(
  // On phones the label sits over its box, as phone forms do; from sm it's a column at the left.
  "grid grid-cols-[minmax(0,1fr)_14px] items-center gap-x-3 border-b border-line py-1.5",
  "sm:grid-cols-[11.5rem_minmax(0,1fr)_14px] lg:grid-cols-[8.75rem_minmax(0,1fr)_14px] xl:grid-cols-[11.5rem_minmax(0,1fr)_14px]",
  "-mx-2 px-2",
);

function FieldRow({ field, slot, stop, raceEnd }: { field: FormField; slot?: Slot; stop: boolean; raceEnd: number }) {
  // The row under the cursor greys while it's filled; the row it stops at turns pink and stays that way.
  const rowStyle: CSSProperties | undefined = !slot
    ? undefined
    : stop
      ? { animation: `wr-clr ${slot.at}ms linear` }
      : { animation: `wr-row ${slot.done - slot.at}ms linear ${slot.at}ms` };
  const tag =
    stop && field.tag && slot ? (
      <span className="bg-pink px-1.5 text-[12px] leading-[1.6] font-medium text-ink" style={until(slot.done)}>
        {field.tag}
      </span>
    ) : null;

  return (
    <li className={cn(ROW, stop && "bg-pink-soft outline-2 -outline-offset-2 outline-pink")} style={rowStyle}>
      <span className={cn("col-span-2 text-[12px] leading-[1.4] sm:col-span-1", slot ? "text-ink-2" : "text-ink-3")}>
        {field.label}
        <span className="text-ink-3">*</span>
      </span>

      <span className="flex min-h-[26px] min-w-0 items-center">
        {slot && !field.upload ? (
          <span className="flex min-w-0 items-center gap-x-2">
            <span className="truncate">
              <Typed text={field.value ?? ""} at={slot.at} per={FIELD_MS} cursor="bar" block="bg-ink-4" />
            </span>
            {tag}
          </span>
        ) : null}
        {slot && field.upload ? (
          <Stack className="min-w-0 items-center">
            <span className="invisible flex min-w-0 items-center gap-2" style={between(slot.at, slot.done)}>
              <Bar at={Array.from({ length: 8 }, (_, j) => slot.at + ((j + 1) * UPLOAD_MS) / 8)} on="bg-ink-3" size={6} />
              <span className="truncate text-ink-2">{field.upload}…</span>
            </span>
            <span className="flex flex-wrap items-center gap-x-2" style={until(slot.done)}>
              {field.value}
              {tag}
            </span>
          </Stack>
        ) : null}
      </span>

      <span className="flex justify-end text-ink-3">
        {slot && !stop ? (
          <span className="flex" style={until(slot.done)}>
            <PixelCheck />
          </span>
        ) : null}
        {slot && stop ? <Stalled from={slot.done} to={raceEnd} className="text-ink" /> : null}
      </span>
    </li>
  );
}

const FormPane = memo(function FormPane({ w, p, raceEnd }: { w: FormWindow; p: Plan; raceEnd: number }) {
  const n = w.fields.length;
  // Fields filled: all of them, or every one before the field it stops at.
  const filled = p.stalled ? p.slots.length - 1 : n;
  const done = (k: number) => p.slots[k].done;
  return (
    <div aria-hidden className={FRAME}>
      <TitleBar title={w.title} busy="filling" p={p} raceEnd={raceEnd} />

      <div className={cn("flex-1 pb-5", BODY)}>
        <Head w={w} />

        <div className={PAD}>
          <ol className="mt-3">
            {w.fields.map((f, i) => (
              <FieldRow
                key={i}
                field={f}
                slot={p.slots[i]}
                stop={p.stalled && i === p.slots.length - 1}
                raceEnd={raceEnd}
              />
            ))}
          </ol>

          {p.stalled && w.notice ? (
            <p className="mt-4 grid grid-cols-[1.7em_minmax(0,1fr)] text-ink" style={until(p.end + NOTICE_AFTER)}>
              <span className="flex h-[1.75em] items-center">
                <Halt />
              </span>
              <span className="text-pretty">{w.notice}</span>
            </p>
          ) : null}
        </div>
      </div>

      <div className={FOOT}>
        <span className="flex min-w-0 items-center gap-3">
          <Bar
            at={w.fields.map((_, i) => (i < filled ? done(i) : null))}
            on={p.stalled ? "bg-pink" : "bg-mint"}
            size={9}
            gap={3}
          />
          <Stack className="shrink-0 text-ink-2">
            {Array.from({ length: filled }, (_, k) => (
              <span key={k} className="invisible" style={between(k === 0 ? 0 : done(k - 1), done(k))}>
                {k}/{n}
              </span>
            ))}
            <span style={filled ? until(done(filled - 1)) : undefined}>
              {filled}/{n}
            </span>
          </Stack>
        </span>
        <Stack className="shrink-0 justify-items-start sm:justify-items-end">
          <span className="invisible" style={between(0, p.end)}>
            {w.foot?.before ?? "continue →"}
          </span>
          <span className="text-ink-2" style={until(p.end)}>
            {w.foot?.after ?? (p.stalled ? "waiting on review" : "submitted")}
          </span>
        </Stack>
      </div>
    </div>
  );
});

/* Captions under each window ------------------------------------------------- */

const BIG =
  "font-display text-[clamp(2.5rem,4.6vw,4.5rem)] leading-none font-extrabold tracking-[-0.04em] [font-variation-settings:'opsz'_96]";

function Caption({ c, stalled }: { c: RaceCaption; stalled: boolean }) {
  return (
    <div className="mt-6 sm:mt-8">
      <p className="flex items-center gap-2.5 font-mono text-[12px] tracking-[0.16em] text-ink-2 uppercase">
        <span aria-hidden className={cn("size-[9px]", stalled ? "bg-pink" : "bg-mint")} />
        {c.name}
      </p>
      <p className={cn("mt-3 text-ink", BIG)}>
        {c.lead ? `${c.lead} ` : null}
        <span className={cn("px-2 whitespace-nowrap", stalled ? "bg-pink" : "bg-lime")}>{c.mark}</span>
      </p>
      <p className="mt-4 max-w-[30rem] text-[16px] leading-relaxed text-pretty text-ink-2 sm:text-[17px]">{c.text}</p>
    </div>
  );
}

/* The start node and its two dashed runs (two-up layout only) ---------------- */

/** Half of the connector: from the start node along the top, then down into this column's window. */
function Run({ side, stalled }: { side: "left" | "right"; stalled: boolean }) {
  const left = side === "left";
  return (
    <span
      aria-hidden
      className={cn(
        "absolute bottom-full hidden h-[52px] w-[calc(50%+var(--gap)/2)] border-t border-dashed border-ink-3 [container-type:size] lg:block",
        left ? "left-1/2 border-l" : "right-1/2 border-r",
      )}
    >
      <span
        className={cn(
          "invisible absolute -top-[4.5px] size-2",
          left ? "-right-[4px]" : "-left-[4px]",
          stalled ? "bg-pink" : "bg-mint",
        )}
        style={{
          animation: `wr-show ${RUN_MS}ms linear ${RUN_AT}ms, ${left ? "wr-runl" : "wr-runr"} ${RUN_MS}ms linear ${RUN_AT}ms`,
        }}
      />
    </span>
  );
}

/* What a screen reader hears ------------------------------------------------- */

function describe(w: RaceWindow, p: Plan) {
  if (w.kind === "form") {
    const filled = p.stalled ? p.slots.length - 1 : w.fields.length;
    const stop = p.stalled ? w.fields[filled] : undefined;
    const head = `${w.title}, ${w.heading}: a form with ${w.fields.length} required fields, ${w.fields.map((f) => f.label).join(", ")}.`;
    const tail = stop
      ? ` It fills the first ${filled}, then stops at ${stop.label}${stop.tag ? `, ${stop.tag}` : ""}.${w.notice ? ` ${w.notice}` : ""}`
      : " It fills every one and submits.";
    return head + tail;
  }
  const said = p.beats.flatMap(({ line }, i) => {
    const stop = p.stalled && i === p.beats.length - 1;
    const note = "note" in line && line.note ? `, ${line.note}` : "";
    switch (line.kind) {
      case "command":
        return [`${w.prompt ?? "$"} ${line.text}`];
      case "info":
        return [`${line.text}${line.value && !line.mask ? ` ${line.value}` : ""}${note}`];
      case "secret":
        return [`${line.text} ${line.keys ?? 8} masked keys${note}`];
      case "wait":
        return [stop ? `${line.text}, and it never finishes` : `${line.done}${note}`];
      case "ok":
        return [`${line.text}${note}`];
      case "rule":
        return [];
    }
  });
  const tail = p.stalled ? (w.notice ? ` ${w.notice}` : "") : ` It ends at a ready prompt, ${w.done ?? "$"}.`;
  return plain(`${w.title}, ${w.heading}: ${said.join("; ")}.${tail}`);
}

/* The race --------------------------------------------------------------------- */

/**
 * Two app windows side by side on a stage, each playing a scripted session on
 * CSS timelines from the same start: one finishes fast, the other stalls partway
 * through. A transcript prints line by line and ends at a ready prompt; a form
 * fills its required boxes in order and can stop at one for good. Plays while
 * it's on screen, pauses off it, replays on demand; reduced motion shows the
 * finished frame.
 */
export function WindowRace({
  windows = DEFAULT_WINDOWS,
  start = DEFAULT_START,
  label = "U1",
  caption,
  className,
}: {
  /** Left, then right. Two columns from lg, stacked below. */
  windows?: [RaceWindow, RaceWindow];
  /** The chip over the two windows where both runs begin (lg up). `null` drops it and its connectors. */
  start?: string | null;
  /** The small mono mark at the stage's top left. */
  label?: string;
  /** What screen readers hear instead of the animation. Built from the windows by default. */
  caption?: string;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const playing = usePlaying(ref);
  const [run, setRun] = useState(0);

  const plans = useMemo(() => [plan(windows[0]), plan(windows[1])] as const, [windows]);
  // The race is called when the last window to finish does; a stall spins at least a beat before then.
  const raceEnd = Math.max(...plans.map((p) => (p.stalled ? p.end + STALL_HOLD : p.end)));
  const said = caption ?? windows.map((w, i) => describe(w, plans[i])).join(" ");

  return (
    <figure
      ref={ref}
      data-wr={playing ? "run" : "paused"}
      className={cn(
        "relative border border-line-2 bg-bg-2 bg-dots px-3 pt-4 pb-8 sm:px-8 sm:pt-6 sm:pb-12 lg:px-12 lg:pt-[33px] lg:pb-14 xl:px-16",
        className,
      )}
    >
      <style href="window-race" precedence="default">
        {CSS}
      </style>
      <Contours className="pointer-events-none absolute inset-0 hidden size-full lg:block" />
      <Screw className="absolute top-2.5 left-2.5" />
      <Screw className="absolute top-2.5 right-2.5" />
      <Screw className="absolute bottom-2.5 left-2.5" />
      <Screw className="absolute right-2.5 bottom-2.5" />

      <div className="relative flex h-[30px] items-center justify-between gap-3 pl-3 sm:pl-0">
        <span aria-hidden className="flex items-center gap-3 font-mono text-[11px] tracking-[0.16em] text-ink-3">
          {label}
          <Vents />
        </span>
        <button
          type="button"
          onClick={() => setRun((r) => r + 1)}
          aria-label="Replay both sessions"
          className="inline-flex h-[30px] items-center gap-2 border border-line-2 bg-paper px-3 font-mono text-[12px] text-ink-2 transition-colors hover:border-ink hover:text-ink motion-reduce:hidden"
        >
          <span aria-hidden>↺</span>
          replay
        </button>
      </div>

      <div
        key={run}
        className="relative mt-5 grid gap-y-14 [--gap:2.5rem] sm:mt-6 lg:mt-[37px] lg:grid-cols-2 lg:gap-x-(--gap) xl:[--gap:4rem]"
      >
        {start ? (
          <span
            aria-hidden
            className="absolute -top-[67px] left-1/2 z-10 hidden h-[30px] -translate-x-1/2 items-center gap-2.5 bg-night px-3.5 font-mono text-[12px] whitespace-nowrap text-mint-pale lg:flex"
          >
            <span className="size-[7px] bg-mint" />
            {start}
          </span>
        ) : null}

        {windows.map((w, i) => {
          const p = plans[i];
          return (
            <div key={i} className="relative flex min-w-0 flex-col">
              {start ? <Run side={i === 0 ? "left" : "right"} stalled={p.stalled} /> : null}
              {w.kind === "form" ? (
                <FormPane w={w} p={p} raceEnd={raceEnd} />
              ) : (
                <TranscriptPane w={w} p={p} raceEnd={raceEnd} />
              )}
              <Caption c={w.caption} stalled={p.stalled} />
            </div>
          );
        })}
      </div>

      <figcaption className="sr-only">{said}</figcaption>
    </figure>
  );
}
