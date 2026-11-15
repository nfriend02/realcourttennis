/**
 * Full-match playtest with the local Chrome: for every character (each with a different court theme)
 * plays one Free-mode match end to end with the dev autoplay bot (`?autoplay`), from Intro to the
 * Score screen. Captures periodic screenshots, console errors and frame-time statistics.
 *
 * Usage: npm run dev (port 3000) then `npm run e2e:play`
 * Output: docs/reports/playtest/*.png + docs/reports/playtest/summary.json
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { chromium, type Page } from 'playwright-core';

const URL = (process.env.RCT_URL ?? 'http://localhost:3000/') + '?autoplay';
const OUT = 'docs/reports/playtest';
const exe = process.env.RCT_BROWSER ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const THEMES = ['day', 'sunset', 'indoor', 'night'];
const MATCH_TIMEOUT_MS = 240_000;

interface RunResult {
  run: string;
  layout: string;
  character: number;
  theme: string;
  reachedScore: boolean;
  durationSec: number;
  avgFps: number;
  p95FrameMs: number;
  maxFrameMs: number;
  longFrames: number;
  errors: string[];
  final?: string;
  /** Share of follow-camera frames with the ball outside the screen. */
  ballOffscreenPct?: number;
}

const allRuns = [
  { character: 0, theme: 0, layout: 'desktop', viewport: { width: 1600, height: 900 }, touch: false },
  { character: 1, theme: 1, layout: 'desktop', viewport: { width: 1600, height: 900 }, touch: false },
  { character: 2, theme: 3, layout: 'desktop', viewport: { width: 1600, height: 900 }, touch: false },
  { character: 1, theme: 2, layout: 'mobile-portrait', viewport: { width: 390, height: 844 }, touch: true },
];
// RCT_RUNS=0,3 plays only the listed runs (indices into allRuns).
const pick = process.env.RCT_RUNS?.split(',').map(Number);
const runs = pick ? allRuns.filter((_, i) => pick.includes(i)) : allRuns;

async function run(): Promise<void> {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  const results: RunResult[] = [];
  for (const r of runs) {
    const name = `${r.layout}-c${r.character + 1}-${THEMES[r.theme]}`;
    const ctx = await browser.newContext({ viewport: r.viewport, hasTouch: r.touch, isMobile: r.touch, deviceScaleFactor: 1 });
    // tsx (esbuild keepNames) wraps functions passed to page.evaluate with a __name helper.
    await ctx.addInitScript('globalThis.__name = (f) => f;');
    const page = await ctx.newPage();
    const errors: string[] = [];
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    page.on('pageerror', (e) => errors.push(`pageerror ${e.message}`));
    const res: RunResult = { run: name, layout: r.layout, character: r.character, theme: THEMES[r.theme], reachedScore: false, durationSec: 0, avgFps: 0, p95FrameMs: 0, maxFrameMs: 0, longFrames: 0, errors };
    try {
      await page.goto(URL);
      await page.waitForTimeout(1200);
      await page.click('button.skip');
      await page.waitForTimeout(400);
      await page.click('.title-wrap button.primary');
      await page.waitForTimeout(600);
      if (await page.locator('.auth-card').count()) {
        await page.fill('.guest-box input', `QA${r.character}${Date.now() % 10000}`);
        await page.click('.guest-box button.primary');
        await page.waitForTimeout(900);
      }
      await page.locator('.char-card').nth(r.character).click();
      await page.locator('.segmented.mode button').nth(1).click();
      await page.locator('.theme-tile').nth(r.theme).click();
      await page.waitForTimeout(300);
      await shot(page, name, '00-setup');
      await page.click('.setup-foot button.primary');
      // Match intro (walk_in motion, VS card) — let it play without skipping.
      await page.waitForTimeout(1500);
      await shot(page, name, '01-intro');
      await page.evaluate(() => {
        const w = window as unknown as { __frames: number[] };
        w.__frames = [];
        let last = performance.now();
        const tick = (now: number) => {
          w.__frames.push(now - last);
          last = now;
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      });
      const t0 = Date.now();
      let k = 2;
      while (Date.now() - t0 < MATCH_TIMEOUT_MS) {
        await page.waitForTimeout(2500);
        if (await page.locator('.score-card').count()) break;
        const viewScore = page.locator('.ready-card button.primary');
        if (await viewScore.count()) {
          await shot(page, name, '89-end');
          const bv = await page.evaluate(() => {
            const v = (window as unknown as { __rctView?: { ballFrames: number; ballOffFrames: number } }).__rctView;
            return v ? { frames: v.ballFrames, off: v.ballOffFrames } : null;
          });
          if (bv) res.ballOffscreenPct = bv.frames ? Math.round((bv.off / bv.frames) * 1000) / 10 : 0;
          await viewScore.first().click();
          continue;
        }
        if (k < 40) await shot(page, name, `${String(k++).padStart(2, '0')}-play`);
      }
      res.durationSec = Math.round((Date.now() - t0) / 1000);
      const frames = await page.evaluate(() => (window as unknown as { __frames: number[] }).__frames.slice(5));
      const sorted = [...frames].sort((a, b) => a - b);
      const sum = frames.reduce((a, b) => a + b, 0);
      res.avgFps = frames.length ? Math.round((frames.length / sum) * 1000) : 0;
      res.p95FrameMs = Math.round(sorted[Math.floor(sorted.length * 0.95)] ?? 0);
      res.maxFrameMs = Math.round(sorted[sorted.length - 1] ?? 0);
      res.longFrames = frames.filter((f) => f > 100).length;
      res.reachedScore = (await page.locator('.score-card').count()) > 0;
      if (res.reachedScore) {
        await page.waitForTimeout(1500);
        await shot(page, name, '90-score');
        res.final = (await page.locator('.final-points').textContent())?.replace(/\s+/g, '') ?? '';
      } else await shot(page, name, '99-timeout');
    } catch (e) {
      errors.push(`script ${(e as Error).message.split('\n')[0]}`);
      await shot(page, name, '99-error').catch(() => undefined);
    }
    results.push(res);
    console.log(`${name}: score=${res.reachedScore} ${res.final ?? ''} ${res.durationSec}s fps=${res.avgFps} p95=${res.p95FrameMs}ms max=${res.maxFrameMs}ms long=${res.longFrames} ballOff=${res.ballOffscreenPct ?? '-'}% errors=${errors.length}`);
    await ctx.close();
  }
  await browser.close();
  writeFileSync(`${OUT}/summary.json`, `${JSON.stringify(results, null, 2)}\n`);
  const bad = results.filter((r) => !r.reachedScore || r.errors.length);
  if (bad.length) {
    for (const b of bad) console.error(`✗ ${b.run}: ${b.reachedScore ? '' : 'did not reach score; '}${b.errors.join(' | ')}`);
    process.exit(1);
  }
  console.log('playtest OK');
}

async function shot(page: Page, run: string, name: string): Promise<void> {
  await page.screenshot({ path: `${OUT}/${run}-${name}.png` });
}

void run();
