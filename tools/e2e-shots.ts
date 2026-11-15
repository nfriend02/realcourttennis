/**
 * Smoke test with the locally installed Chrome/Edge: walks Intro → Title → Login(guest) → Setup → Match,
 * captures screenshots per layout and fails on console errors.
 * Usage: npm run dev (port 3000) then `npx tsx tools/e2e-shots.ts`
 */
import { mkdirSync } from 'node:fs';
import { chromium, type Page } from 'playwright-core';

const URL = process.env.RCT_URL ?? 'http://localhost:3000/';
const OUT = 'docs/reports/shots';
const exe = process.env.RCT_BROWSER ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';

const layouts = [
  { name: 'desktop', viewport: { width: 1600, height: 900 }, touch: false },
  { name: 'mobile-landscape', viewport: { width: 844, height: 390 }, touch: true },
  { name: 'mobile-portrait', viewport: { width: 390, height: 844 }, touch: true },
];

async function run(): Promise<void> {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const errors: string[] = [];
  for (const l of layouts) {
    const ctx = await browser.newContext({ viewport: l.viewport, hasTouch: l.touch, isMobile: l.touch, deviceScaleFactor: 1 });
    const page = await ctx.newPage();
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(`[${l.name}] ${m.text()}`);
    });
    page.on('pageerror', (e) => errors.push(`[${l.name}] pageerror ${e.message}`));
    await page.goto(URL);
    await page.waitForTimeout(1500);
    await shot(page, l.name, '01-intro');
    await page.click('button.skip');
    await page.waitForTimeout(500);
    await shot(page, l.name, '02-title');
    await page.click('.title-wrap button.primary');
    await page.waitForTimeout(600);
    if (await page.locator('.auth-card').count()) {
      await shot(page, l.name, '03-login');
      await page.fill('.guest-box input', `QA${l.name.slice(0, 3)}${Date.now() % 10000}`);
      await page.click('.guest-box button.primary');
      await page.waitForTimeout(800);
    }
    await shot(page, l.name, '04-setup');
    await page.click('.setup-foot button.primary');
    await page.waitForTimeout(1800);
    await shot(page, l.name, '05-match-intro');
    await page.click('.match-overlay button.skip');
    await page.waitForTimeout(1200);
    await shot(page, l.name, '06-serve');
    // serve: hold FH-High ~0.6 s then release
    const btn = page.locator('[data-stroke="fh_high"]');
    const box = await btn.boundingBox();
    if (box) {
      await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
      await page.mouse.down();
      await page.waitForTimeout(560);
      await page.mouse.up();
    }
    await page.waitForTimeout(700);
    await shot(page, l.name, '07-rally');
    await page.waitForTimeout(900);
    await shot(page, l.name, '08-rally2');
    await ctx.close();
  }
  await browser.close();
  if (errors.length) {
    console.error(errors.join('\n'));
    process.exit(1);
  }
  console.log('e2e OK');
}

async function shot(page: Page, layout: string, name: string): Promise<void> {
  await page.screenshot({ path: `${OUT}/${layout}-${name}.png` });
}

void run();
