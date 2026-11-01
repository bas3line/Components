"use client";

import { useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { usePrefersReducedMotion } from "@/lib/hooks";
import { BladeRow, COLS, EARS, PIXEL } from "./BladeRow";
import { BladeTier, TierBay } from "./BladeTier";
import { sampleAllNote, sampleColumns, sampleGroups, sampleLines, sampleTerms } from "./sample";
import type { BladeColumn, BladeGroup, BladeLabels, BladeLine, BladePeriod, BladePlan } from "./types";

export type {
  BladeColumn,
  BladeGroup,
  BladeLabels,
  BladeLine,
  BladePeriod,
  BladePixel,
  BladePlan,
  BladeSpec,
} from "./types";

const LABELS: BladeLabels = {
  groups: "Location",
  groupsNoun: "locations",
  line: "Line",
  all: "All",
  from: "from",
  inStock: "In stock",
  soldOut: "Out of stock",
  action: "Deploy",
  planHeader: "Plan",
  priceHeader: "Per month",
  standard: "Standard line",
};

const MONTH: BladePeriod = { short: "/mo", long: "per month" };

const live = (p: BladePlan) => p.inStock ?? true;

const count = (g: BladeGroup, line: string | null) =>
  line === null ? g.plans.length : g.plans.filter((p) => p.line === line).length;

/** "A, B and C" */
const list = (xs: string[]) => (xs.length < 2 ? xs.join("") : `${xs.slice(0, -1).join(", ")} and ${xs.at(-1)}`);

const plural = (n: number) => `${n} ${n === 1 ? "plan" : "plans"}`;

/** The xl tracks every row and the header strip share: plan, each spec, price, button. */
function rowTracks(columns: BladeColumn[]) {
  const specs = columns.map((c, i) => c.track ?? (i === 0 ? "minmax(11rem,1.15fr)" : "minmax(5.75rem,0.6fr)"));
  return `minmax(9.5rem,1fr) ${specs.join(" ")} 8rem 8.5rem`;
}

/** Between md and xl the specs are their own grid: the first one wider, for its core map. */
const specTracks = (n: number) => (n > 1 ? `minmax(0,1.6fr) repeat(${n - 1},minmax(0,1fr))` : "minmax(0,1fr)");

/** Lines and columns for data that brought neither: one per line id, one per spec key. */
const linesOf = (groups: BladeGroup[]): BladeLine[] =>
  [...new Set(groups.flatMap((g) => g.plans.map((p) => p.line)))].map((id) => ({ id, name: id }));
const columnsOf = (groups: BladeGroup[]): BladeColumn[] =>
  Object.keys(groups[0]?.plans[0]?.specs ?? {}).map((key) => ({ key, label: key }));

export type BladeRackProps = {
  /** One tab each. The tabs hide when there is only one. */
  groups?: BladeGroup[];
  /** One filter chip each. The filter hides when there is only one. */
  lines?: BladeLine[];
  /** The spec columns, in order. The first is the wide one, where a core map fits. */
  columns?: BladeColumn[];
  /**
   * "rows": dense one-line blades on paper, featured lines slate under a lime band.
   * "tiers": every plan a tall slate blade between punched rails.
   */
  variant?: "rows" | "tiers";
  defaultGroup?: string;
  /** A line id to open filtered to. */
  defaultLine?: string;
  /** The line under the filter while it shows every line. */
  allNote?: ReactNode;
  /** The right half of the footer: billing terms, a minimum, a note. */
  terms?: ReactNode;
  currency?: string;
  period?: BladePeriod;
  labels?: Partial<BladeLabels>;
  className?: string;
};

/**
 * Plans racked as 1U server blades in a cabinet: a tab per group, a filter per
 * line, and every plan a blade with its screws, vents, LEDs, unit number, specs,
 * price and button. Featured lines rack first. With no props it shows a sample.
 */
export function BladeRack({
  groups: groupsProp,
  lines: linesProp,
  columns: columnsProp,
  variant = "rows",
  defaultGroup,
  defaultLine,
  allNote,
  terms,
  currency = "$",
  period = MONTH,
  labels: labelsProp,
  className,
}: BladeRackProps) {
  const sample = groupsProp === undefined;
  const groups = groupsProp ?? sampleGroups;
  const lines = linesProp ?? (sample ? sampleLines : linesOf(groups));
  const columns = columnsProp ?? (sample ? sampleColumns : columnsOf(groups));
  const note = allNote ?? (sample ? sampleAllNote : undefined);
  const footnote = terms ?? (sample ? sampleTerms : undefined);
  const labels = { ...LABELS, ...labelsProp };

  const [groupId, setGroupId] = useState(defaultGroup ?? groups[0]?.id);
  const [line, setLine] = useState<string | null>(defaultLine ?? null);
  // Rows slide in only after a choice, never on first paint.
  const [moved, setMoved] = useState(false);
  const reduced = usePrefersReducedMotion();
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const strip = useRef<HTMLDivElement>(null);
  const uid = useId();

  const here = groups.find((g) => g.id === groupId) ?? groups[0];
  if (!here) return null;

  const money = (n: number) => `${currency}${n.toFixed(2)}`;
  const byId = new Map(lines.map((l) => [l.id, l]));
  const shown = line === null ? here.plans : here.plans.filter((p) => p.line === line);

  // Featured lines rack first, each under its own band; the rest follow as one.
  // Unit numbers run on through every section, so `start` is where each picks up.
  const sections: { id: string; line?: BladeLine; plans: BladePlan[]; start: number }[] = [];
  let start = 0;
  for (const l of lines) {
    const plans = l.featured ? shown.filter((p) => p.line === l.id) : [];
    if (plans.length === 0) continue;
    sections.push({ id: l.id, line: l, plans, start });
    start += plans.length;
  }
  const rest = shown.filter((p) => !byId.get(p.line)?.featured);
  if (rest.length > 0) sections.push({ id: "standard", plans: rest, start });

  const chosen = line === null ? undefined : byId.get(line);
  const lineName = chosen?.name ?? line ?? "";
  const elsewhere = line === null ? [] : groups.filter((g) => count(g, line) > 0);
  const total = groups.reduce((n, g) => n + g.plans.length, 0);
  const tabbed = groups.length > 1;
  const filtered = lines.length > 1;
  const explain = line === null ? note : chosen?.note;

  /** The tab's second line: the cheapest plan you can actually order there today. */
  function fromLabel(g: BladeGroup) {
    const stocked = g.plans.filter(live);
    return stocked.length > 0
      ? `${labels.from} ${money(Math.min(...stocked.map((p) => p.price)))}`
      : labels.soldOut.toLowerCase();
  }

  function pick(id: string, focus = false) {
    setGroupId(id);
    setMoved(true);
    const el = tabs.current[groups.findIndex((g) => g.id === id)];
    const box = strip.current;
    if (!el || !box) return;
    if (focus) el.focus({ preventScroll: true });
    // Keep the chosen chip inside its own scroller without moving the page.
    const left = el.offsetLeft - 20;
    const right = el.offsetLeft + el.offsetWidth + 20 - box.clientWidth;
    const behavior = reduced ? "auto" : "smooth";
    if (left < box.scrollLeft) box.scrollTo({ left, behavior });
    else if (right > box.scrollLeft) box.scrollTo({ left: right, behavior });
  }

  function onKey(e: KeyboardEvent<HTMLButtonElement>) {
    const i = groups.findIndex((g) => g.id === here.id);
    const n = groups.length;
    const to: Record<string, number> = { ArrowRight: (i + 1) % n, ArrowLeft: (i - 1 + n) % n, Home: 0, End: n - 1 };
    if (!(e.key in to)) return;
    e.preventDefault();
    pick(groups[to[e.key]].id, true);
  }

  const rise = (i: number): CSSProperties | undefined =>
    moved && !reduced
      ? { animation: `rise 420ms cubic-bezier(0.2, 0.7, 0.2, 1) ${Math.min(i, 8) * 35}ms both` }
      : undefined;

  const row = (p: BladePlan, i: number) => (
    <BladeRow
      key={p.id}
      plan={p}
      line={byId.get(p.line)}
      slot={i + 1}
      place={here.name}
      columns={columns}
      currency={currency}
      period={period}
      action={labels.action}
      soldOut={labels.soldOut}
      style={rise(i)}
    />
  );

  const tier = (p: BladePlan, i: number) => (
    <BladeTier
      key={p.id}
      plan={p}
      line={byId.get(p.line)}
      slot={i + 1}
      place={here.name}
      columns={columns}
      currency={currency}
      period={period}
      labels={labels}
      style={rise(i)}
    />
  );

  const vars = { "--blade-cols": rowTracks(columns), "--blade-specs": specTracks(columns.length) } as CSSProperties;

  return (
    <div className={className} style={vars}>
      {tabbed ? (
        <>
          <p className="font-mono text-[11px] tracking-[0.14em] text-ink-3 uppercase" id={`${uid}-groups`}>
            {labels.groups}
          </p>
          {/* The chips scroll inside this strip on narrow screens; the page never does. */}
          <div ref={strip} className="relative mt-3 overflow-x-auto py-1 [scrollbar-width:thin]">
            <div role="tablist" aria-labelledby={`${uid}-groups`} className="flex w-max min-w-full gap-2">
              {groups.map((g, i) => {
                const on = g.id === here.id;
                return (
                  <button
                    key={g.id}
                    ref={(el) => {
                      tabs.current[i] = el;
                    }}
                    id={`${uid}-tab-${i}`}
                    type="button"
                    role="tab"
                    aria-selected={on}
                    aria-controls={`${uid}-panel`}
                    tabIndex={on ? 0 : -1}
                    onClick={() => pick(g.id)}
                    onKeyDown={onKey}
                    className={cn(
                      "flex flex-1 shrink-0 flex-col items-start gap-2 border px-4 py-3 text-left font-mono whitespace-nowrap transition-colors",
                      // Inset, so the strip's scroller never clips the ring.
                      "focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-mint",
                      on ? "border-ink bg-ink text-paper" : "border-line-2 bg-paper text-ink hover:border-ink",
                    )}
                  >
                    <span className="flex items-center gap-2 text-[14px] leading-none">
                      <span aria-hidden className={cn("size-[6px] shrink-0", on ? "bg-mint" : "bg-line-2")} />
                      {g.name}
                    </span>
                    <span className={cn("pl-[14px] text-[12px] leading-none", on ? "text-mint-pale" : "text-ink-3")}>
                      {fromLabel(g)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : null}

      <div
        id={`${uid}-panel`}
        role={tabbed ? "tabpanel" : undefined}
        aria-labelledby={tabbed ? `${uid}-tab-${groups.indexOf(here)}` : undefined}
        className={cn("border border-line-2 bg-bg-2", tabbed && "mt-3")}
      >
        {/* Cabinet header: where you are, and which line you are looking at. */}
        <div
          className={cn(
            "grid gap-6 border-b border-line-2 bg-paper px-5 py-6 lg:gap-10 lg:px-6",
            filtered && "lg:grid-cols-[minmax(0,1fr)_minmax(0,34rem)]",
          )}
        >
          <div>
            {here.code || here.region ? (
              <p className="mb-4 flex items-center gap-3 font-mono text-[11px] tracking-[0.14em] text-ink-3 uppercase">
                {here.code ? (
                  <span className="border border-line-2 px-1.5 py-[3px] leading-none text-ink">{here.code}</span>
                ) : null}
                {here.region}
              </p>
            ) : null}
            <p className="font-display text-[30px] leading-none font-bold tracking-[-0.035em] text-ink [font-variation-settings:'opsz'_48]">
              {here.name}
            </p>
            {here.note ? (
              <p className="mt-3 max-w-[54ch] text-[16px] leading-[1.45] text-pretty text-ink-2">{here.note}</p>
            ) : null}
          </div>

          {filtered ? (
            <fieldset>
              <legend className="font-mono text-[11px] tracking-[0.14em] text-ink-3 uppercase">{labels.line}</legend>
              <div className="mt-3 flex flex-wrap gap-2">
                {[null, ...lines].map((l) => {
                  const id = l?.id ?? null;
                  const on = id === line;
                  return (
                    <label
                      key={id ?? "*"}
                      className={cn(
                        "flex h-10 cursor-pointer items-center gap-2.5 border pr-1.5 pl-3 font-mono text-[12px] tracking-[0.14em] uppercase transition-colors",
                        "has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink",
                        on
                          ? "border-ink bg-ink text-paper"
                          : "border-line-2 bg-paper text-ink-2 hover:border-ink hover:text-ink",
                      )}
                    >
                      <input
                        type="radio"
                        name={`${uid}-line`}
                        value={id ?? ""}
                        checked={on}
                        onChange={() => {
                          setLine(id);
                          setMoved(true);
                        }}
                        className="sr-only"
                      />
                      {l ? <span aria-hidden className={cn("size-[7px]", PIXEL[l.pixel ?? "peri"])} /> : null}
                      {l ? l.name : labels.all}
                      <span
                        className={cn(
                          "min-w-7 px-1.5 py-[5px] text-center text-[11px] leading-none tracking-normal",
                          on ? "bg-night-3 text-white" : "bg-bg text-ink-3",
                        )}
                      >
                        <span className="sr-only">, </span>
                        {count(here, id)}
                      </span>
                    </label>
                  );
                })}
              </div>
              {explain ? (
                <p className="mt-4 max-w-[50ch] text-[16px] leading-[1.45] text-pretty text-ink-2">{explain}</p>
              ) : null}
            </fieldset>
          ) : null}
        </div>

        {/* Column labels for the one-line rows; below xl each row labels its own specs. */}
        {variant === "rows" && sections.length > 0 ? (
          <div aria-hidden className={cn("hidden border-b border-line-2 px-[9px] xl:grid", EARS)}>
            <span />
            <div className={cn("grid gap-x-3 px-5 py-3 font-mono text-[11px] tracking-[0.14em] text-ink-3 uppercase", COLS)}>
              <span>{labels.planHeader}</span>
              {columns.map((c) => (
                <span key={c.key}>{c.label}</span>
              ))}
              <span>{labels.priceHeader}</span>
              <span />
            </div>
            <span />
          </div>
        ) : null}

        <div key={`${here.id}-${line}`} className="flex flex-col gap-2 p-2">
          {variant === "tiers" && sections.length > 0 ? (
            <TierBay
              where={
                <>
                  {here.name}
                  {here.region ? `, ${here.region}` : null}
                  {chosen ? ` · ${chosen.name}` : null}
                </>
              }
              tally={`${plural(shown.length)} · ${shown.filter(live).length} ${labels.inStock.toLowerCase()}`}
              label={`Plans in ${here.name}`}
            >
              {sections.flatMap((s) => s.plans.map((p, i) => tier(p, s.start + i)))}
            </TierBay>
          ) : null}

          {variant === "rows"
            ? sections.map((s) =>
                s.line ? (
                  <div key={s.id} className="flex flex-col gap-2">
                    {s.line.tagline || s.line.band || s.line.link ? (
                      <div className="grid gap-x-8 gap-y-3 bg-lime px-5 py-4 text-ink lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:px-6">
                        <div>
                          <p className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.14em] uppercase">
                            <span aria-hidden className="size-[7px] bg-ink" />
                            {s.line.name}
                            {s.line.tagline ? ` · ${s.line.tagline}` : null}
                          </p>
                          {s.line.band ? (
                            <p className="mt-2 max-w-[70ch] font-mono text-[13px] leading-relaxed text-ink-2">
                              {s.line.band}
                            </p>
                          ) : null}
                        </div>
                        {s.line.link ? (
                          <a
                            href={s.line.link.href}
                            className="inline-flex items-center gap-2 justify-self-start font-medium text-ink underline decoration-ink/40 underline-offset-4 transition-colors hover:decoration-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                          >
                            {s.line.link.label}
                            <span aria-hidden>→</span>
                          </a>
                        ) : null}
                      </div>
                    ) : null}
                    <ul aria-label={`${s.line.name} plans in ${here.name}`} className="flex flex-col gap-2">
                      {s.plans.map((p, i) => row(p, s.start + i))}
                    </ul>
                  </div>
                ) : (
                  <div key={s.id} className="flex flex-col gap-2">
                    {sections.length > 1 ? (
                      <p className="flex items-center gap-2.5 px-1 pt-4 pb-1 font-mono text-[11px] tracking-[0.14em] text-ink-3 uppercase">
                        <span aria-hidden className="size-[7px] bg-ink-3" />
                        {labels.standard} ·{" "}
                        {list(lines.filter((l) => s.plans.some((p) => p.line === l.id)).map((l) => l.name))}
                      </p>
                    ) : null}
                    <ul aria-label={`Plans in ${here.name}`} className="flex flex-col gap-2">
                      {s.plans.map((p, i) => row(p, s.start + i))}
                    </ul>
                  </div>
                ),
              )
            : null}

          {sections.length === 0 ? (
            // An empty bay: the line is not sold here, so point at where it is.
            <div className="bg-hatch border border-line-2 px-4 py-12 sm:py-16">
              <div className="mx-auto max-w-[30rem] border border-line-2 bg-paper p-6 text-center">
                <p className="font-display text-[24px] leading-tight font-bold tracking-[-0.03em] text-ink">
                  No {lineName} in {here.name}.
                </p>
                {elsewhere.length > 0 ? (
                  <>
                    <p className="mt-2 text-[16px] leading-[1.45] text-ink-2">
                      {lineName} runs in{" "}
                      {elsewhere.length === 1 ? `${elsewhere[0].name} only` : list(elsewhere.map((g) => g.name))}.
                    </p>
                    <div className="mt-5 flex flex-wrap justify-center gap-2">
                      {elsewhere.map((g) => (
                        <button
                          key={g.id}
                          type="button"
                          onClick={() => pick(g.id)}
                          className="inline-flex h-10 items-center gap-2 border border-line-2 bg-paper px-3 font-mono text-[13px] text-ink-2 transition-colors hover:border-ink hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                        >
                          {g.name}
                          <span aria-hidden>→</span>
                        </button>
                      ))}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          ) : null}
        </div>

        <div className="flex flex-col gap-2 border-t border-line-2 bg-paper px-5 py-4 font-mono text-[13px] leading-relaxed text-ink-2 lg:flex-row lg:items-center lg:justify-between lg:gap-8 lg:px-6">
          <p aria-live="polite">
            {plural(here.plans.length)} in {here.name}.
            {tabbed ? ` ${total} across all ${groups.length} ${labels.groupsNoun}.` : null}
            {line === null ? null : <span className="sr-only"> Showing {shown.length}.</span>}
          </p>
          {footnote ? <p>{footnote}</p> : null}
        </div>
      </div>
    </div>
  );
}
