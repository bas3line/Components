import type { FormField, RaceWindow } from "./WindowRace";

/* The default race: one command against a console wizard. Every value is an
 * example: a documentation-range address, made-up names, redacted personal
 * details. Pass `windows` to tell your own. */

const FIELDS: FormField[] = [
  { label: "Project name", value: "my-app" },
  { label: "Billing email", value: "o▒▒▒▒@▒▒▒▒▒▒.▒▒▒" },
  { label: "Organisation", value: "▒▒▒▒▒▒ Labs" },
  { label: "Region", value: "eu-central · zone b" },
  { label: "Instance type", value: "general · 2 vCPU · 4 GB" },
  { label: "Network", value: "default · new subnet" },
  { label: "Firewall rules", value: "allow tcp/443 from any" },
  { label: "Quota increase (upload)", value: "quota-request.pdf", upload: "uploading", tag: "pending" },
  { label: "Load balancer" },
  { label: "DNS records" },
  { label: "Monitoring" },
];

// The wizard gets as far as the quota form and no further.
const STALL = FIELDS.findIndex((f) => f.tag);

export const DEFAULT_START = "two deploys · both from nothing";

export const DEFAULT_WINDOWS: [RaceWindow, RaceWindow] = [
  {
    kind: "transcript",
    title: "~/app — zsh",
    heading: "New deploy",
    note: "no config file",
    lines: [
      { kind: "command", text: "deploy ./app" },
      { kind: "info", text: "project created", value: "quiet-river-2048", note: "named for you; rename it any time" },
      { kind: "info", text: "Node 22 · 1 vCPU · 512 MB · **nearest region**", note: "read from package.json" },
      { kind: "wait", text: "building…", done: "build finished · 214 kB" },
      { kind: "wait", text: "uploading", bar: true, done: "live at 203.0.113.7", note: "about 30s after you pressed enter" },
      { kind: "rule", text: "then check it" },
      { kind: "command", text: "curl -sI 203.0.113.7/health" },
      { kind: "ok", text: "HTTP/2 200 · healthy" },
      { kind: "command", text: "deploy env set DB_PASSWORD" },
      { kind: "secret", text: "value:", note: "encrypted at rest, never echoed back" },
      { kind: "wait", text: "rolling out", bar: true, ms: 1300, done: "release 2 live · zero downtime" },
    ],
    done: "ops@quiet-river:~$",
    foot: { before: "› no config, no console", after: "› live in about 30s, nothing filled in", aside: "0 fields" },
    caption: {
      name: "one command",
      mark: "~30s",
      text: "From enter to a live address. The defaults are the whole config.",
    },
  },
  {
    kind: "form",
    title: "console.example/projects/new",
    heading: "Create a project",
    note: "all fields required",
    fields: FIELDS,
    stallAt: STALL,
    notice: "Stopped for a quota approval. It can take up to three business days.",
    foot: { after: "waiting on approval" },
    caption: {
      name: "a console wizard",
      lead: "stuck at",
      mark: `${STALL} of ${FIELDS.length}`,
      text: "Name, billing, region and network go in. Then a quota form, and days of waiting for someone to approve it.",
    },
  },
];
