/**
 * Desktop control check: drags the left pad with the mouse and holds D / W while waiting to serve,
 * capturing screenshots before and after each input.
 *
 * Usage: npm run dev (port 3000) then `npx tsx tools/e2e-controls.ts`
 * Output: docs/reports/controls/*.png
 */
import { mkdirSync } from 'node:fs';
import { chromium } from 'playwright-core';

const URL = process.env.RCT_URL ?? 'http://localhost:3000/';
const OUT = 'docs/reports/controls';
const exe = process.env.RCT_BROWSER ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';

async function run(): Promise<void> {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ executablePath: exe, headless: true, args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1 });
  await ctx.addInitScript('globalThis.__name = (f) => f;');
  const page = await ctx.newPage();
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(URL);
  await page.waitForTimeout(1200);
  await page.click('button.skip');
  await page.waitForTimeout(400);
  await page.click('.title-wrap button.primary');
  await page.waitForTimeout(600);
  if (await page.locator('.auth-card').count()) {
    await page.fill('.guest-box input', `QAC${Date.now() % 10000}`);
    await page.click('.guest-box button.primary');
    await page.waitForTimeout(900);
  }
  await page.locator('.segmented.mode button').nth(1).click();
  await page.click('.setup-foot button.primary');
  await page.waitForSelector('.match.playing', { timeout: 30000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${OUT}/0-start.png` });

  const pad = await page.locator('.pad').boundingBox();
  if (!pad) throw new Error('pad not found');
  const cx = pad.x + pad.width / 2;
  const cy = pad.y + pad.height / 2;
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  await page.mouse.move(cx + pad.width * 0.45, cy, { steps: 4 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: `${OUT}/1-pad-right.png` });
  await page.mouse.up();
  await page.waitForTimeout(600);

  await page.keyboard.down('KeyA');
  await page.waitForTimeout(1500);
  await page.keyboard.up('KeyA');
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${OUT}/2-key-a.png` });

  // Middle buttons: a press just inside the top edge (and a small wiggle) must stay on the middle button.
  for (const id of ['bh_mid', 'fh_mid']) {
    const r = await page.locator(`.stroke-btn[data-stroke="${id}"]`).boundingBox();
    if (!r) throw new Error(`${id} not found`);
    await page.mouse.move(r.x + r.width / 2, r.y + 3);
    await page.mouse.down();
    await page.mouse.move(r.x + r.width / 2 + 2, r.y + 1, { steps: 3 });
    const pressed = await page.locator('.stroke-btn.pressed').getAttribute('data-stroke');
    await page.mouse.up();
    if (pressed !== id) errors.push(`edge press on ${id} selected ${pressed}`);
    await page.waitForTimeout(2500);
  }

  errors.push(...(await checkInputTargets(page, 'desktop')));

  // Mobile portrait (touch): same input restriction.
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  await mctx.addInitScript('globalThis.__name = (f) => f;');
  const mpage = await mctx.newPage();
  mpage.on('pageerror', (e) => errors.push(e.message));
  await mpage.goto(URL);
  await mpage.waitForTimeout(1200);
  await mpage.tap('button.skip');
  await mpage.waitForTimeout(400);
  await mpage.tap('.title-wrap button.primary');
  await mpage.waitForTimeout(600);
  if (await mpage.locator('.auth-card').count()) {
    await mpage.fill('.guest-box input', `QAM${Date.now() % 10000}`);
    await mpage.tap('.guest-box button.primary');
    await mpage.waitForTimeout(900);
  }
  await mpage.locator('.segmented.mode button').nth(1).tap();
  await mpage.tap('.setup-foot button.primary');
  await mpage.waitForSelector('.match.playing', { timeout: 30000 });
  await mpage.waitForTimeout(800);
  errors.push(...(await checkInputTargets(mpage, 'mobile')));

  console.log(errors.length ? `errors: ${errors.join(' | ')}` : 'controls OK');
  await browser.close();
}

/** Only the pad, stroke buttons, sound and home take clicks / touches on the gameplay screen. */
async function checkInputTargets(page: import('playwright-core').Page, tag: string): Promise<string[]> {
  return page.evaluate((tag) => {
    const errs: string[] = [];
    const allowed = '.pad, .cluster, .sys-btn.sound, .sys-btn.home, .sys-btn.lang';
    const at = (x: number, y: number) => document.elementFromPoint(x, y);
    const center = (sel: string) => {
      const r = document.querySelector(sel)!.getBoundingClientRect();
      return [r.left + r.width / 2, r.top + r.height / 2] as const;
    };
    for (const sel of ['.pad', '.stroke-btn[data-stroke="fh_mid"]', '.sys-btn.sound', '.sys-btn.home', '.sys-btn.lang']) {
      if (!document.querySelector(sel)) {
        errors(`${sel} missing`);
        continue;
      }
      const el = at(...center(sel));
      if (!el || !el.closest(allowed)) errors(`${sel} not clickable`);
    }
    const blocked: [string, number, number][] = [
      ['view center', innerWidth / 2, innerHeight * 0.3],
      ['scoreboard', ...center('.scoreboard')],
      ['top right', innerWidth - 20, 30],
    ];
    for (const [name, x, y] of blocked) {
      const el = at(x, y);
      if (el && el.closest(allowed)) continue;
      if (el && el.closest('.match')) errors(`${name} hit ${el.className}`);
      const ev = new MouseEvent('click', { bubbles: true, cancelable: true, clientX: x, clientY: y });
      (el ?? document.body).dispatchEvent(ev);
      if (!ev.defaultPrevented) errors(`${name} click not blocked`);
    }
    function errors(m: string) {
      errs.push(`${tag}: ${m}`);
    }
    return errs;
  }, tag);
}

void run();
