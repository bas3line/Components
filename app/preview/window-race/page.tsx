import Demo, { shot } from "@/demos/window-race";
import { Frame } from "../Frame";

export const metadata = { title: "window-race" };

export default function Page() {
  return (
    <Frame shot={shot}>
      <Demo />
    </Frame>
  );
}
