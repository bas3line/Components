import type { ReactNode } from "react";
import type { Shot } from "@/demos/types";

/**
 * One demo alone on the page, at most 1280 px wide. `npm run shots` photographs
 * the `data-shot` box, so the demo brings its own background and padding.
 */
export function Frame({ shot, children }: { shot: Shot; children: ReactNode }) {
  return (
    <main className="min-h-dvh">
      <div data-shot data-wait={shot.wait} className="mx-auto w-full max-w-[1280px]">
        {children}
      </div>
    </main>
  );
}
