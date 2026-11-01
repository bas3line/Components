import { WindowRace } from "@/components/window-race/WindowRace";
import type { Shot } from "./types";

export const shot: Shot = {};

export default function Demo() {
  return (
    <div className="bg-bg px-4 py-6 sm:px-8 sm:py-8">
      <WindowRace />
    </div>
  );
}
