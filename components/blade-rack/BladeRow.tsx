import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { NotchButton } from "@/components/primitives/NotchButton";
import { Cores, Leds, Screw, Vents, keep } from "./art";
import type { BladeColumn, BladeLine, BladePeriod, BladePlan, BladeSpec } from "./types";

/** A rack ear either side of the row from md. The header strip uses the same three columns. */
export const EARS = "md:grid-cols-[1.5rem_minmax(0,1fr)_1.5rem]";

/** From xl a row is one line: plan, the specs, price, button. The tracks come in as --blade-cols. */
export const COLS = "xl:grid-cols-(--blade-cols)";

/** One flat colour per line, used on its tag and on the filter chip. */
export const PIXEL = { mint: "bg-mint", lime: "bg-lime", pink: "bg-pink", peri: "bg-peri" } as const;

// Every colour a row uses, once for the paper rows and once for the slate featured ones.
const PAPER = {
  row: "border-line-2 bg-paper",
  ear: "border-line",
  unit: "text-ink-3",
  vent: "bg-line-2",
  screw: "text-ink-4",
  handle: "bg-line-2",
  kind: "border border-line-2 py-[4px] text-ink-2",
  name: "text-ink",
  price: "text-ink",
  per: "text-ink-3",
  rule: "border-line",
  label: "text-ink-3",
  value: "text-ink",
  core: "bg-peri",
  badge: "border border-line-2 text-ink-2",
  bezel: "bg-night",
  blank: "border-line-2 text-ink-2",
  plate: "bg-paper",
};

const NIGHT: typeof PAPER = {
  row: "border-night bg-night",
  ear: "border-night-line",
  unit: "text-mint-pale/80",
  vent: "bg-night-line",
  screw: "text-night-line",
  handle: "bg-night-line",
  kind: "bg-lime py-[5px] text-ink",
  name: "text-white",
  price: "text-mint-pale",
  per: "text-white/70",
  rule: "border-night-line",
  label: "text-white/70",
  value: "text-white",
  core: "bg-mint",
  badge: "border border-mint/60 text-mint-pale",
  bezel: "bg-night-2 ring-1 ring-night-line",
  blank: "border-night-line text-white/80",
  plate: "bg-night",
};

type Theme = typeof PAPER;

/** Each slot blinks on its own rhythm, so a full rack never pulses in step. */
const rhythm = (slot: number) => ({ period: 2.8 + (slot % 5) * 0.6, phase: slot * 0.7 });

function Spec({ label, t, wide, children }: { label: string; t: Theme; wide?: boolean; children: ReactNode }) {
  return (
    <div className={cn("min-w-0", wide && "col-span-2 md:col-span-1")}>
      <dt className={cn("font-mono text-[11px] tracking-[0.14em] uppercase xl:sr-only", t.label)}>{label}</dt>
      <dd className={cn("mt-1.5 font-mono text-[14px] leading-snug xl:mt-0", t.value)}>{children}</dd>
    </div>
  );
}

function SpecValue({ spec, t }: { spec: BladeSpec | undefined; t: Theme }) {
  if (spec === undefined) return <>—</>;
  if (typeof spec === "string") return <>{keep(spec)}</>;
  const { value, sub, cores, badge } = spec;
  if (!cores && !badge) {
    return (
      <>
        {keep(value)}
        {sub ? <span className={cn("block text-[12px]", t.label)}>{keep(sub)}</span> : null}
      </>
    );
  }
  return (
    // Side by side while there is room; stacked in the narrow xl column.
    <span className="flex flex-wrap items-center gap-x-3 gap-y-2 xl:flex-col xl:items-start">
      <span>
        {keep(value)}
        {sub ? <span className={cn("block text-[12px]", t.label)}>{keep(sub)}</span> : null}
      </span>
      <span className="flex items-center gap-2.5">
        {cores ? <Cores n={cores} tone={t.core} /> : null}
        {badge ? (
          <span className={cn("px-1.5 py-[3px] text-[11px] leading-none tracking-[0.08em]", t.badge)}>{badge}</span>
        ) : null}
      </span>
    </span>
  );
}

/**
 * One plan as a 1U blade in the rack: ears with screws and the unit number from md,
 * a faceplate strip on phones. From xl it is one line under the header strip; between
 * md and xl the specs drop to a second tier; on phones it stacks into a card.
 * Featured rows are slate with a lime tag and a mint button.
 */
export function BladeRow({
  plan,
  line,
  slot,
  place,
  columns,
  currency,
  period,
  action,
  soldOut,
  style,
}: {
  plan: BladePlan;
  line?: BladeLine;
  slot: number;
  /** Where it is, for the button's screen-reader label. */
  place: string;
  columns: BladeColumn[];
  currency: string;
  period: BladePeriod;
  action: string;
  soldOut: string;
  style?: CSSProperties;
}) {
  const featured = line?.featured ?? false;
  const t = featured ? NIGHT : PAPER;
  const live = plan.inStock ?? true;
  const unit = `U${String(slot).padStart(2, "0")}`;
  const [whole, cents] = plan.price.toFixed(2).split(".");
  const per = plan.period ?? period;
  const { period: blink, phase } = rhythm(slot);

  return (
    <li style={style} className={cn("grid border", EARS, t.row)}>
      {/* Phones: the faceplate runs across the top. */}
      <div
        aria-hidden
        className={cn(
          "flex h-9 items-center justify-between gap-4 border-b px-5 font-mono text-[11px] tracking-[0.14em] md:hidden",
          t.ear,
          t.unit,
        )}
      >
        <span>{unit}</span>
        <Vents tone={t.vent} />
        <Leds live={live} period={blink} phase={phase} bezel={t.bezel} />
      </div>

      {/* Two 7px screws at the ends, so the unit number between them sits dead centre. */}
      <div aria-hidden className={cn("hidden flex-col items-center justify-between border-r py-2 md:flex", t.ear)}>
        <Screw className={t.screw} turn={20 + slot * 25} />
        <span className={cn("rotate-180 font-mono text-[11px] tracking-[0.14em] [writing-mode:vertical-rl]", t.unit)}>
          {unit}
        </span>
        <Screw className={t.screw} turn={75 + slot * 40} />
      </div>

      <div
        className={cn(
          "grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 gap-y-4 p-5 md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-center md:gap-x-6 md:gap-y-5 xl:gap-x-3 xl:py-4",
          COLS,
        )}
      >
        <div className="col-start-1 row-start-1 min-w-0">
          <p className="flex items-center gap-2.5 font-mono text-[11px] leading-none tracking-[0.14em] uppercase">
            <Leds live={live} period={blink} phase={phase} bezel={t.bezel} className="max-md:hidden" />
            <span className={cn("flex items-center gap-1.5 px-2", t.kind)}>
              {featured ? null : <span aria-hidden className={cn("size-[6px]", PIXEL[line?.pixel ?? "peri"])} />}
              {line?.name ?? plan.line}
            </span>
          </p>
          {/* The tag rides beside the name: the plan column is too narrow for a third chip up top. */}
          <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-2">
            <h3
              className={cn(
                "font-display text-[22px] leading-none font-bold tracking-[-0.03em] [font-variation-settings:'opsz'_48]",
                t.name,
              )}
            >
              {plan.name}
            </h3>
            {plan.tag ? (
              <span className="bg-lime px-1.5 py-[4px] font-mono text-[11px] leading-none tracking-[0.14em] text-ink uppercase">
                {plan.tag}
              </span>
            ) : null}
          </div>
        </div>

        {/* From xl the specs take the tracks between the name and the price, as a subgrid. */}
        <dl
          className={cn(
            "col-span-2 col-start-1 row-start-2 grid grid-cols-2 gap-x-4 gap-y-3.5 border-t pt-4 md:gap-y-4",
            "md:col-span-3 md:grid-cols-(--blade-specs)",
            "xl:col-start-2 xl:col-end-[-3] xl:row-start-1 xl:grid-cols-subgrid xl:items-center xl:gap-x-3 xl:border-t-0 xl:pt-0",
            t.rule,
          )}
        >
          {columns.map((c, i) => (
            <Spec key={c.key} label={c.label} t={t} wide={i === 0}>
              <SpecValue spec={plan.specs[c.key]} t={t} />
            </Spec>
          ))}
        </dl>

        <p
          className={cn(
            "col-start-2 row-start-1 flex items-baseline self-start md:self-center xl:col-start-[-3]",
            t.price,
          )}
        >
          <span className="sr-only">
            {currency}
            {plan.price.toFixed(2)} {per.long}
          </span>
          <span aria-hidden className="flex items-baseline font-display [font-variation-settings:'opsz'_96]">
            <span className="self-start pt-[0.2em] text-[18px] font-bold">{currency}</span>
            <span className="text-[40px] leading-[0.85] font-extrabold tracking-[-0.05em]">{whole}</span>
            <span className="text-[20px] font-bold tracking-[-0.02em]">.{cents}</span>
            <span className={cn("ml-1.5 font-mono text-[13px] font-normal", t.per)}>{per.short}</span>
          </span>
        </p>

        <div className="col-span-2 col-start-1 row-start-3 md:col-span-1 md:col-start-3 md:row-start-1 md:w-[8.5rem] xl:col-start-[-2] xl:w-auto">
          {live ? (
            <NotchButton
              href={plan.href ?? "#"}
              tone={featured ? "mint" : "ink"}
              className="w-full justify-between whitespace-nowrap max-md:h-12 max-md:text-[16px]"
            >
              <span>
                {action}
                <span className="sr-only">
                  {" "}
                  {plan.name} in {place}
                </span>
              </span>
            </NotchButton>
          ) : (
            // An empty slot: hatched, no link, nothing to press.
            <span
              className={cn(
                "bg-hatch flex h-10 w-full items-center justify-center border font-mono text-[11px] tracking-[0.14em] uppercase max-md:h-12",
                t.blank,
              )}
            >
              <span className={cn("px-2 py-1", t.plate)}>{soldOut}</span>
            </span>
          )}
        </div>
      </div>

      <div aria-hidden className={cn("hidden flex-col items-center justify-between border-l py-2 md:flex", t.ear)}>
        <Screw className={t.screw} turn={130 + slot * 15} />
        <span className={cn("h-7 w-[3px]", t.handle)} />
        <Screw className={t.screw} turn={45 + slot * 30} />
      </div>
    </li>
  );
}
