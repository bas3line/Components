import Demo, { shot } from "@/demos/scan-island";
import { Frame } from "../Frame";

export const metadata = { title: "scan-island" };

export default function Page() {
  return (
    <Frame shot={shot}>
      <Demo />
    </Frame>
  );
}
