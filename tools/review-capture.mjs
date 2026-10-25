#!/usr/bin/env node
// review-capture: turn a running site (local or a Preview URL) into review evidence
// a person can check on a phone: screenshots per device, an MP4 walkthrough,
// and a list of console errors and failed requests.
//
// Usage:
//   node review-capture.mjs --url https://my-preview.example.workers.dev \
//     --pages /,/about,/contact --out review-out [--steps steps.mjs]
//
// --steps (optional) points at a module whose default export is
//   async (page, { shot }) => { ... }
// Use it to click through a real flow; call `await shot("name")` at each moment
// worth seeing. Without it, the walkthrough just visits each page and scrolls.
//
// Cloudflare Access: set CF_ACCESS_CLIENT_ID and CF_ACCESS_CLIENT_SECRET (an Access
// service token) and every request carries them, so protected Previews work.
//
// Needs Playwright (pre-installed in Claude cloud sessions) and ffmpeg for MP4.
// Without ffmpeg it leaves the .webm, which iPhone Safari may not play.

import { createRequire } from "node:module";
import { execFileSync } from "node:child_process";
import { mkdirSync, readdirSync, renameSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";

// require() (unlike import) honours NODE_PATH, so a globally installed Playwright
// works without adding it to every project's package.json.
const { chromium, devices } = createRequire(import.meta.url)("playwright");

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, all) => {
    if (a.startsWith("--")) acc.push([a.slice(2), all[i + 1]?.startsWith("--") ? "true" : all[i + 1]]);
    return acc;
  }, []),
);
if (!args.url) {
  console.error("Usage: node review-capture.mjs --url <base url> [--pages /,/a] [--out dir] [--steps file.mjs]");
  process.exit(2);
}

const base = args.url.replace(/\/$/, "");
const pages = (args.pages || "/").split(",").map((p) => p.trim()).filter(Boolean);
const out = resolve(args.out || "review-out");
const steps = args.steps ? (await import(pathToFileURL(resolve(args.steps)).href)).default : null;

// The three screens Austin and Emily actually review on: phone, iPad, laptop.
const viewports = [
  { name: "phone", ...devices["iPhone 13"] },
  { name: "ipad", ...devices["iPad (gen 7)"] },
  { name: "desktop", viewport: { width: 1280, height: 800 }, deviceScaleFactor: 1 },
];

const headers = {};
if (process.env.CF_ACCESS_CLIENT_ID && process.env.CF_ACCESS_CLIENT_SECRET) {
  headers["CF-Access-Client-Id"] = process.env.CF_ACCESS_CLIENT_ID;
  headers["CF-Access-Client-Secret"] = process.env.CF_ACCESS_CLIENT_SECRET;
}

rmSync(out, { recursive: true, force: true });
mkdirSync(join(out, "screenshots"), { recursive: true });
const problems = [];
const browser = await chromium.launch();

// Watch for the failures a screenshot can't show.
function watch(page, label) {
  page.on("console", (m) => m.type() === "error" && problems.push(`${label} console error: ${m.text()}`));
  page.on("pageerror", (e) => problems.push(`${label} page error: ${e.message}`));
  page.on("response", (r) => r.status() >= 400 && problems.push(`${label} HTTP ${r.status()}: ${r.url()}`));
}

const slug = (p) => (p === "/" ? "home" : p.replace(/^\/|\/$/g, "").replace(/[^a-z0-9]+/gi, "-"));

// 1. Screenshots: every page at every viewport, full page, plus a horizontal-scroll check.
for (const vp of viewports) {
  const { name, ...opts } = vp;
  const ctx = await browser.newContext({ ...opts, extraHTTPHeaders: headers });
  const page = await ctx.newPage();
  watch(page, name);
  for (const p of pages) {
    await page.goto(base + p, { waitUntil: "networkidle" });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 1) problems.push(`${name} ${p}: page scrolls sideways by ${overflow}px`);
    // "-top" is the first screen a visitor sees, readable on a phone; "-full" is the whole page.
    await page.screenshot({ path: join(out, "screenshots", `${slug(p)}-${name}-top.jpg`), type: "jpeg", quality: 80 });
    await page.screenshot({ path: join(out, "screenshots", `${slug(p)}-${name}-full.jpg`), fullPage: true, type: "jpeg", quality: 75 });
  }
  await ctx.close();
}

// 2. Walkthrough video on the phone viewport, the one most reviews happen on.
const videoDir = join(out, "video-raw");
const { name: _n, ...phone } = viewports[0];
const vctx = await browser.newContext({
  ...phone,
  extraHTTPHeaders: headers,
  recordVideo: { dir: videoDir, size: phone.viewport },
});
const vpage = await vctx.newPage();
watch(vpage, "walkthrough");
let n = 0;
const shot = (label) => vpage.screenshot({ path: join(out, "screenshots", `step-${String(++n).padStart(2, "0")}-${label}.png`) });
if (steps) {
  await vpage.goto(base + pages[0], { waitUntil: "networkidle" });
  await steps(vpage, { shot, base });
} else {
  for (const p of pages) {
    await vpage.goto(base + p, { waitUntil: "networkidle" });
    await vpage.waitForTimeout(800);
    // Scroll slowly so the video shows the whole page, not just the top.
    const height = await vpage.evaluate(() => document.documentElement.scrollHeight);
    for (let y = 0; y < height; y += 400) {
      await vpage.mouse.wheel(0, 400);
      await vpage.waitForTimeout(350);
    }
  }
}
await vctx.close();
await browser.close();

// 3. Convert to MP4 (H.264, faststart) so it plays inline on iPhone and iPad.
const raw = readdirSync(videoDir).find((f) => f.endsWith(".webm"));
let video = null;
if (raw) {
  try {
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-i", join(videoDir, raw),
      "-c:v", "libx264", "-pix_fmt", "yuv420p", "-movflags", "+faststart", "-crf", "28",
      join(out, "walkthrough.mp4")]);
    video = "walkthrough.mp4";
    rmSync(videoDir, { recursive: true, force: true });
  } catch {
    renameSync(join(videoDir, raw), join(out, "walkthrough.webm"));
    rmSync(videoDir, { recursive: true, force: true });
    video = "walkthrough.webm";
    problems.push("ffmpeg unavailable: video left as .webm, which may not play on iPhone");
  }
}

const summary = {
  url: base,
  pages,
  checkedAt: new Date().toISOString(),
  screenshots: readdirSync(join(out, "screenshots")).sort(),
  video,
  problems: [...new Set(problems)],
};
writeFileSync(join(out, "summary.json"), JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ ...summary, screenshots: summary.screenshots.length }, null, 2));
process.exit(existsSync(join(out, "summary.json")) ? 0 : 1);
