import Demo, { shot } from "@/demos/blade-rack";
import { Frame } from "../Frame";

export const metadata = { title: "blade-rack" };

export default function Page() {
  return (
    <Frame shot={shot}>
      <Demo />
    </Frame>
  );
}
