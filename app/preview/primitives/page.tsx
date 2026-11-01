import Demo, { shot } from "@/demos/primitives";
import { Frame } from "../Frame";

export const metadata = { title: "primitives" };

export default function Page() {
  return (
    <Frame shot={shot}>
      <Demo />
    </Frame>
  );
}
