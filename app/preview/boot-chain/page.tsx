import Demo, { shot } from "@/demos/boot-chain";
import { Frame } from "../Frame";

export const metadata = { title: "boot-chain" };

export default function Page() {
  return (
    <Frame shot={shot}>
      <Demo />
    </Frame>
  );
}
