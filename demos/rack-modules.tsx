import type { ReactNode } from "react";
import {
  AddressFace,
  DeployFace,
  DrainFace,
  PickerFace,
  RackModule,
  TimelineFace,
  TokenFace,
} from "@/components/rack-modules/RackModule";
import type { Shot } from "./types";

export const shot: Shot = {};

type Card = { tag: string; title: string; body: string; spec: string[]; face: ReactNode; span: string };

// A bento, not a row of equal boxes: 4/2, 2/4, 3/3 on a six-column grid; the
// wide two take the full width on a tablet; one column on a phone.
const CARDS: Card[] = [
  {
    tag: "token",
    title: "One token, not four settings",
    body: "Host, port, user and key file fold into a single generated token. Paste it once; everything else is looked up.",
    spec: ["config: one token", "rotation: on demand", "scope: per project"],
    face: <TokenFace />,
    span: "md:col-span-2 xl:col-span-4",
  },
  {
    tag: "deploy",
    title: "Pushed, built, running",
    body: "A signed push starts the build. Thirty steps later the address is live in your panel.",
    spec: ["build: about 40 s", "rollback: one click"],
    face: <DeployFace />,
    span: "xl:col-span-2",
  },
  {
    tag: "image",
    title: "Any base image",
    body: "Pick a system, press rebuild, and the disk comes back fresh, with ssh or RDP.",
    spec: ["images: 8", "login: ssh or RDP"],
    face: <PickerFace />,
    span: "xl:col-span-2",
  },
  {
    tag: "snapshots",
    title: "Snapshots that prune themselves",
    body: "Hourly for a week, daily for as long as you say, weekly after that, then gone. The strip shows what is kept today.",
    spec: ["hourly: 7 days", "daily: yours to set", "pruning: automatic"],
    face: <TimelineFace />,
    span: "md:col-span-2 xl:col-span-4",
  },
  {
    tag: "logs",
    title: "Debug logs that keep nothing",
    body: "Tail them live while you work. Nothing is written to disk, and nothing leaves the machine.",
    spec: ["retention: 0 days", "export: off", "tail: live"],
    face: <DrainFace />,
    span: "xl:col-span-3",
  },
  {
    tag: "ipv4",
    title: "An address of its own",
    body: "One IPv4 from the block, held for this machine as long as it lives, on a full-rate port.",
    spec: ["ipv4: reserved", "ipv6: a /64", "port: 1 Gbps"],
    face: <AddressFace />,
    span: "xl:col-span-3",
  },
];

export default function Demo() {
  return (
    <div className="bg-bg p-5">
      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-5 xl:grid-cols-6">
        {CARDS.map((c, i) => (
          <li key={c.tag} className={c.span}>
            <RackModule unit={i + 1} tag={c.tag} title={c.title} body={c.body} spec={c.spec} face={c.face} />
          </li>
        ))}
      </ul>
    </div>
  );
}
