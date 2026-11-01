import Demo, { shot } from "@/demos/server-island";
import { Frame } from "../Frame";

export const metadata = { title: "server-island" };

export default function Page() {
  return (
    <Frame shot={shot}>
      <Demo />
    </Frame>
  );
}
