"use client";

import type { ComponentProps } from "react";
import { useInView } from "@/lib/hooks";

/** A div that sets `data-shown` once it scrolls into view, so plain CSS can play the reveal. */
export function InView(props: ComponentProps<"div">) {
  const [ref, shown] = useInView<HTMLDivElement>();
  return <div ref={ref} data-shown={shown} {...props} />;
}
