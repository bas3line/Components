import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

const TONE = {
  mint: "bg-mint text-ink hover:bg-mint-hi",
  ink: "bg-ink text-paper hover:bg-night-3",
  lime: "bg-lime text-ink hover:bg-lime-hi",
} as const;

const SIZE = {
  md: "h-10 pr-5 pl-4 text-sm",
  lg: "h-[52px] pr-7 pl-5 text-[16px]",
} as const;

type Common = {
  children: ReactNode;
  /** Mint is the primary, ink the secondary, lime the primary on night bands. */
  tone?: keyof typeof TONE;
  size?: keyof typeof SIZE;
  /** The arrow that nudges right on hover. On by default. */
  arrow?: boolean;
  className?: string;
};

type AsLink = Common & { href: string } & Omit<ComponentProps<"a">, keyof Common | "href">;
type AsButton = Common & { href?: undefined } & Omit<ComponentProps<"button">, keyof Common>;

/**
 * A flat block with its top-right corner cut: the call to action. Give it an
 * `href` and it is a link; leave it out and it is a button.
 */
export function NotchButton(props: AsLink | AsButton) {
  const { children, tone = "mint", size = "md", arrow = true, className, ...rest } = props;
  const classes = cn(
    "notch group inline-flex items-center gap-3 font-medium transition-colors",
    TONE[tone],
    SIZE[size],
    className,
  );
  const body = (
    <>
      {children}
      {arrow ? (
        <span aria-hidden className="transition-transform group-hover:translate-x-0.5">
          →
        </span>
      ) : null}
    </>
  );
  if (rest.href !== undefined) {
    return (
      <a {...(rest as ComponentProps<"a">)} className={classes}>
        {body}
      </a>
    );
  }
  return (
    <button type="button" {...(rest as ComponentProps<"button">)} className={classes}>
      {body}
    </button>
  );
}
