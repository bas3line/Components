import Demo, { shot } from "@/demos/rack-modules";
import { Frame } from "../Frame";

export const metadata = { title: "rack-modules" };

export default function Page() {
  return (
    <Frame shot={shot}>
      <Demo />
    </Frame>
  );
}
