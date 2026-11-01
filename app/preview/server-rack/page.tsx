import Demo, { shot } from "@/demos/server-rack";
import { Frame } from "../Frame";

export const metadata = { title: "server-rack" };

export default function Page() {
  return (
    <Frame shot={shot}>
      <Demo />
    </Frame>
  );
}
