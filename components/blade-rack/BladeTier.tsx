import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { NotchButton } from "@/components/primitives/NotchButton";
import { Cores, Leds, Rail, Vents, keep } from "./art";
import type { BladeColumn, BladeLine, BladePeriod, BladePlan, BladeSpec } from "./types";

const text = (s: BladeSpec | undefined) => (s === undefined ? "—" : typeof s === "string" ? s : s.value);

/**
 * One plan as a tall 1U blade: unit label, LEDs and vents, the name, the specs,
 * the price and its button. Side by side from lg; a stacked card below it, with
 * the price beside the name. A spec with a core map shows the bare count and the
 * map; put the model in `detail`.
 */
export function BladeTier({
  plan,
  line,
  slot,
  place,
  columns,
  currency,
  period,
  labels,
  style,
}: {
  plan: BladePlan;
  line?: BladeLine;
  slot: number;
  place: string;
  columns: BladeColumn[];
  currency: string;
  period: BladePeriod;
  labels: { action: string; inStock: string; soldOut: string };
  style?: CSSProperties;
}) {
  const live = plan.inStock ?? true;
  const per = plan.period ?? period;

  // Phones: strip, then name beside price, specs, button. From lg every part has a
  // fixed cell: strip, name and specs run the full height; price over button at the right.
  return (
    // Every column has a fixed share, so the blades line up like units in one rack.
    <li
      style={style}
      className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-5 border border-night-line bg-night-2 px-5 py-5 sm:px-6 lg:grid-cols-[48px_minmax(0,0.7fr)_minmax(0,2fr)_190px] lg:gap-x-8 lg:gap-y-4 lg:py-6 xl:grid-cols-[48px_minmax(0,0.7fr)_minmax(0,2fr)_210px] xl:gap-x-10"
    >
      <div
        aria-hidden
        className="order-1 col-span-2 flex items-center gap-3 lg:col-span-1 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:flex-col lg:items-start lg:gap-2.5 lg:self-stretch"
      >
        <span className="font-mono text-[11px] tracking-[0.16em] text-white/70">U{slot}</span>
        <Leds
          live={live}
          period={2.6 + slot * 0.55}
          phase={slot * 0.7}
          bezel="bg-night ring-1 ring-night-line"
        />
        <Vents
          count={6}
          tone="bg-night-line"
          className="ml-auto lg:mt-auto lg:ml-0 lg:flex-col lg:[&>span]:h-[3px] lg:[&>span]:w-[18px]"
        />
      </div>

      {/* Below lg the price sits beside the name while both fit, and drops under it when they
          do not, whatever the price's length. From lg the wrapper dissolves into the grid. */}
      <div className="order-2 col-span-2 flex flex-wrap items-center gap-x-6 gap-y-4 lg:contents">
        <div className="min-w-0 flex-1 basis-[7rem] lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <p className="flex flex-wrap items-center gap-2 font-mono text-[11px] leading-none tracking-[0.16em] text-white/70 uppercase">
            {line?.name ?? plan.line}
            {plan.tag ? <span className="bg-lime px-1.5 py-[4px] text-ink">{plan.tag}</span> : null}
          </p>
          <h3 className="mt-2.5 font-display text-[32px] leading-none font-bold tracking-[-0.035em] text-white [font-variation-settings:'opsz'_48] sm:text-[36px]">
            {plan.name}
          </h3>
          <p className="mt-3 flex items-center gap-2 font-mono text-[12px] text-white/80">
            <span aria-hidden className={cn("size-[7px]", live ? "bg-mint" : "bg-pink")} />
            {live ? labels.inStock : labels.soldOut}
          </p>
          {plan.detail ? <p className="mt-1 font-mono text-[12px] text-white/75">{plan.detail}</p> : null}
        </div>

        <p className="flex items-baseline font-display leading-[0.8] font-extrabold tracking-[-0.05em] text-mint-pale [font-variation-settings:'opsz'_96] lg:col-start-4 lg:row-start-1 lg:justify-end lg:self-end">
          <span className="self-start pt-[0.06em] text-[22px] tracking-normal sm:text-[26px]">{currency}</span>
          <span className="text-[46px] sm:text-[56px] xl:text-[60px]">{plan.price.toFixed(2)}</span>
          <span className="ml-1.5 font-mono text-[13px] font-normal tracking-normal text-white/70">
            <span aria-hidden>{per.short}</span>
            <span className="sr-only"> {per.long}</span>
          </span>
        </p>
      </div>

      {/* Phones: one wrapping line of values, labels kept for screen readers. From sm a labelled
          grid; from lg a row that wraps, spread edge to edge. */}
      <dl className="order-4 col-span-2 flex flex-wrap gap-x-5 gap-y-2 border-t border-night-line pt-4 sm:grid sm:grid-cols-3 sm:gap-x-6 sm:gap-y-4 sm:pt-5 lg:col-span-1 lg:col-start-3 lg:row-span-2 lg:row-start-1 lg:flex lg:flex-wrap lg:content-center lg:justify-between lg:gap-x-8 lg:self-stretch lg:border-t-0 lg:border-l lg:pt-0 lg:pl-8 xl:pl-10">
        {columns.map((c) => {
          const s = plan.specs[c.key];
          const cores = typeof s === "object" ? s.cores : undefined;
          const sub = typeof s === "object" ? s.sub : undefined;
          let value: ReactNode = (
            <>
              {keep(text(s))}
              {sub ? <span className="text-[12px] text-white/65">{keep(sub)}</span> : null}
            </>
          );
          if (cores) {
            value = (
              <>
                {cores}
                <span className="-ml-1.5 sm:hidden"> {c.unit ?? c.label}</span>
                <Cores n={cores} tone="bg-mint" big />
              </>
            );
          }
          return (
            <div key={c.key} className="flex min-w-0 items-center gap-2 sm:block lg:self-center">
              <span aria-hidden className="size-[5px] shrink-0 bg-peri sm:hidden" />
              <dt className="font-mono text-[11px] tracking-[0.16em] text-white/65 uppercase max-sm:sr-only">
                {c.label}
              </dt>
              <dd className="flex items-center gap-2.5 font-mono text-[15px] leading-snug whitespace-nowrap text-white sm:mt-1.5 sm:whitespace-normal lg:whitespace-nowrap">
                {value}
              </dd>
            </div>
          );
        })}
      </dl>

      <div className="order-5 col-span-2 lg:col-span-1 lg:col-start-4 lg:row-start-2 lg:self-start">
        {live ? (
          <NotchButton
            href={plan.href ?? "#"}
            tone={plan.tag ? "lime" : "mint"}
            className="w-full justify-between whitespace-nowrap"
          >
            <span>
              {labels.action} {plan.name}
              <span className="sr-only"> in {place}</span>
            </span>
          </NotchButton>
        ) : (
          // An empty slot: hatched, no link, nothing to press.
          <span className="bg-hatch flex h-10 w-full items-center justify-center border border-night-line font-mono text-[11px] tracking-[0.14em] text-white/80 uppercase [--hatch:var(--night-line)]">
            <span className="bg-night-2 px-2 py-1">{labels.soldOut}</span>
          </span>
        )}
      </div>
    </li>
  );
}

/**
 * The slate cabinet the tier blades rack in: a header plate, then the blades
 * between two punched rails.
 */
export function TierBay({
  where,
  tally,
  label,
  children,
}: {
  where: ReactNode;
  tally: ReactNode;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="border border-night-line">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-2 border-b border-night-line bg-night-3 px-5 py-3 font-mono text-[12px] text-white/85 sm:px-6">
        <span className="flex items-center gap-2.5">
          <span aria-hidden className="size-[7px] bg-mint" />
          {where}
        </span>
        <span className="text-white/75">{tally}</span>
      </div>
      <div className="grid grid-cols-[14px_minmax(0,1fr)_14px] bg-night sm:grid-cols-[24px_minmax(0,1fr)_24px]">
        <Rail />
        <ol aria-label={label} className="flex flex-col gap-1.5 px-1.5 py-1.5 sm:gap-2 sm:px-2 sm:py-2">
          {children}
        </ol>
        <Rail />
      </div>
    </div>
  );
}
