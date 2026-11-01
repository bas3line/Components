import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { DeployFace } from "./faces";
import { BASE_CSS } from "./motion";
import { RackStyle, Screw } from "./parts";

export { AddressFace, DeployFace, DrainFace, PickerFace, TimelineFace, TokenFace } from "./faces";
export type { PickerOption, TimelineSegment, TokenField } from "./faces";
export { between, lamp, outside, ride, track } from "./motion";
export type { Stop } from "./motion";
export { Pixel, RackFace, RackStyle, Rail, Screw, Swap, Window } from "./parts";
export type { Rider } from "./parts";

// No two screws are ever turned alike.
const turn = (unit: number, corner: number) => (unit * 53 + corner * 71) % 180;

/** The mono spec line in a module's lower ear, parts parted by periwinkle pixels. */
function Spec({ parts }: { parts: string[] }) {
  return (
    <p className="flex min-w-0 flex-1 flex-wrap items-center gap-x-2.5 gap-y-1 font-mono text-[11.5px] leading-snug text-ink-3">
      {parts.map((part, i) => {
        const cut = part.indexOf(": ");
        return (
          <span key={part} className="flex min-w-0 items-center gap-x-2.5">
            {i > 0 ? (
              <>
                <span aria-hidden className="size-[4px] shrink-0 bg-peri" />
                <span className="sr-only">, </span>
              </>
            ) : null}
            {cut > 0 ? (
              <span className="min-w-0 break-words">
                {part.slice(0, cut + 1)} <span className="text-ink-2">{part.slice(cut + 2)}</span>
              </span>
            ) : (
              <span className="text-ink-2">{part}</span>
            )}
          </span>
        );
      })}
    </p>
  );
}

export type RackModuleProps = {
  /** The rack unit number, printed as U1, U2... It also sets the screws' turn and the LED's phase. */
  unit?: number;
  /** The short uppercase tag in the upper ear. */
  tag?: string;
  title?: ReactNode;
  body?: ReactNode;
  /** The lower ear's spec line; "key: value" parts print the value darker. */
  spec?: string[];
  /** The drawing: one of the ready faces, or your own inside a RackFace. */
  face?: ReactNode;
  titleAs?: "h2" | "h3" | "h4";
  className?: string;
} & Omit<ComponentProps<"article">, "title" | "children">;

/**
 * A card drawn as one unit of a server rack: a screw in every ear, the unit
 * number, a status LED, vents and a tag above; a face that draws the idea
 * working; a title and body; and a spec line in the lower ear. No client code:
 * all the motion is CSS, and it ships with the component.
 */
export function RackModule({
  unit = 1,
  tag = "deploy",
  title = "Pushed, built, running",
  body = "A signed push starts the build. Thirty steps later the address is live in your panel.",
  spec = ["build: about 40 s", "rollback: one click"],
  face = <DeployFace />,
  titleAs: Heading = "h3",
  className,
  ...rest
}: RackModuleProps) {
  return (
    <article data-rack="" {...rest} className={cn("flex h-full flex-col border border-line-2 bg-paper", className)}>
      <RackStyle id="rack-modules" css={BASE_CSS} />
      {/* Upper ear: screws, unit number, status LED, vents and the module's tag. */}
      <div aria-hidden className="flex h-10 shrink-0 items-center gap-2.5 px-3">
        <Screw turn={turn(unit, 0)} />
        <span className="font-mono text-[11px] tracking-[0.14em] text-ink-3">U{unit}</span>
        <span className="rk-led size-[6px] bg-mint" style={{ animationDelay: `${unit * -470}ms` }} />
        <span className="ml-auto flex gap-[3px]">
          {Array.from({ length: 6 }, (_, i) => (
            <span key={i} className="h-3 w-[3px] bg-line" />
          ))}
        </span>
        <span className="inline-flex items-center gap-1.5 border border-line-2 px-1.5 py-0.5 font-mono text-[11px] leading-none tracking-[0.12em] text-ink-2 uppercase">
          {tag}
        </span>
        <Screw turn={turn(unit, 1)} />
      </div>
      <div className="px-3">{face}</div>
      <div className="px-4 pt-6 pb-7 sm:px-5">
        <Heading className="font-display text-[26px] leading-[1.08] font-bold tracking-[-0.035em] text-balance text-ink">
          {title}
        </Heading>
        <p className="mt-3 max-w-[54ch] text-[16.5px] leading-[1.55] text-pretty text-ink-2">{body}</p>
      </div>
      {/* Lower ear: the spec, between two more screws. */}
      <div className="mt-auto flex min-h-10 items-center gap-2.5 border-t border-line px-3 py-2">
        <Screw turn={turn(unit, 2)} />
        <Spec parts={spec} />
        <Screw turn={turn(unit, 3)} />
      </div>
    </article>
  );
}
