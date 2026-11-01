import Demo, { shot } from "@/demos/dot-map";
import { Frame } from "../Frame";

export const metadata = { title: "dot-map" };

export default function Page() {
  return (
    <Frame shot={shot}>
      <Demo />
    </Frame>
  );
}
