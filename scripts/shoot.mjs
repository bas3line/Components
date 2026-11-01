// Photographs every demo for the README, at 2x: .github/readme/<slug>.png.
//
// Start the site first (npm run dev, or npm run build && npm start), then:
//   npm run shots                     every demo
//   npm run shots -- server-island    just the ones named
//
// BASE_URL points at another server (http://localhost:3000 by default), WIDTH
// sets the window width (1440), and OUT another folder for the pictures.
// The first time, fetch the browser with: npx playwright install chromium

import { mkdirSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const root = fileURLToPath(new URL("..", import.meta.url));
const base = process.env.BASE_URL ?? "http://localhost:3000";
const width = Number(process.env.WIDTH ?? 1440);
const out = process.env.OUT ?? join(root, ".github", "readme");

// Every folder under app/preview is a demo.
const all = readdirSync(join(root, "app", "preview"), { withFileTypes: true })
  .filter((d) => d.isDirectory())
  .map((d) => d.name)
  .sort();
const named = process.argv.slice(2);
const unknown = named.filter((s) => !all.includes(s));
if (unknown.length) {
  console.error(`No demo called ${unknown.join(", ")}. There are: ${all.join(", ")}`);
  process.exit(1);
}

mkdirSync(out, { recursive: true });
const browser = await chromium.launch();

for (const slug of named.length ? named : all) {
  // Reduced motion by default, so every component shows its finished frame. A fixed
  // time zone and locale, so a picture never depends on where it was taken (the dot
  // map guesses your nearest pin from your zone).
  const page = await browser.newPage({
    viewport: { width, height: 900 },
    deviceScaleFactor: 2,
    reducedMotion: "reduce",
    timezoneId: "Europe/Berlin",
    locale: "en-US",
  });
  const url = `${base}/preview/${slug}`;
  const res = await page.goto(url, { waitUntil: "networkidle" });
  if (!res?.ok()) throw new Error(`${url} answered ${res?.status()}`);

  const box = page.locator("[data-shot]");
  // A demo that sets shot.wait wants its motion: replay it and wait.
  const wait = Number((await box.getAttribute("data-wait")) ?? Number.NaN);
  const moving = Number.isFinite(wait);
  if (moving) {
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.reload({ waitUntil: "networkidle" });
    await page.waitForTimeout(wait);
  }
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(250);

  const path = join(out, `${slug}.png`);
  await box.screenshot({ path, animations: moving ? "allow" : "disabled" });
  console.log(path);
  await page.close();
}

await browser.close();
