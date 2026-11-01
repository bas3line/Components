import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

const PIXEL = { mint: "bg-mint", lime: "bg-lime", pink: "bg-pink", peri: "bg-peri" } as const;

/** A small mono label over a heading: one lit pixel, then uppercase, letterspaced text. */
export function Kicker({
  children,
  tone = "paper",
  pixel = "mint",
  className,
}: {
  children: ReactNode;
  /** "night" for slate bands: the text turns mint-pale. */
  tone?: "paper" | "night";
  pixel?: keyof typeof PIXEL;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2.5 font-mono text-[11px] tracking-[0.2em] uppercase",
        tone === "night" ? "text-mint-pale/80" : "text-ink-3",
        className,
      )}
    >
      <span aria-hidden className={cn("size-[7px] shrink-0", PIXEL[pixel])} />
      {children}
    </span>
  );
}
