import Demo, { shot } from "@/demos/typed-terminal";
import { Frame } from "../Frame";

export const metadata = { title: "typed-terminal" };

export default function Page() {
  return (
    <Frame shot={shot}>
      <Demo />
    </Frame>
  );
}
