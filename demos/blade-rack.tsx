import { BladeRack } from "@/components/blade-rack/BladeRack";
import type { Shot } from "./types";

export const shot: Shot = {};

export default function Demo() {
  return (
    <div className="bg-bg px-5 py-8 sm:px-10">
      <BladeRack />
    </div>
  );
}
