/**
 * Motion audit: measures where the action really happens in every AI clip and proposes per-clip
 * segment / marker overrides, so the atlas never cuts a swing short or loops on a visible seam.
 *
 *   npm run motion:audit                    analyze all sets, print the table
 *   npm run motion:audit -- char_01/front   one set
 *   npm run motion:audit -- --write         also store the proposals in motion.config.json "overrides"
 *   npm run motion:audit -- --profile       print per-clip motion-energy sparklines (tuning aid)
 *
 * Writes docs/reports/motion_audit.md and contact sheets to raw_assets/_preview/motion_audit/.
 *
 * Signals (keyed silhouette, 24 fps, quarter resolution):
 *   energy  = pixels that changed vs. the previous frame / standing area (≈ limb + racket speed)
 *   contact = strongest energy peak near the scripted contact time (the racket is fastest at contact)
 *   backswing = the calmest frame shortly before contact (pause at the top of the take-back)
 *   loop seam = the window whose last frame best matches its first frame
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { plainMarkdown } from '../docs/plainMarkdown';
import { join } from 'node:path';
import { CONFIG, CONFIG_PATH, type ClipSpec, ff, ffGray, findClips, keyChain, RAW, ROOT, videoSize } from './motionLib';

/** Hand-reviewed values (from the --grid sheets); they win over the automatic proposals. */
const REVIEW_PATH = join(ROOT, 'tools', 'motion', 'motion.review.json');
type Review = Partial<ClipSpec> & { note?: string; range?: [number, number] };
const REVIEW: Record<string, Review> = existsSync(REVIEW_PATH)
  ? (JSON.parse(readFileSync(REVIEW_PATH, 'utf8')) as { clips: Record<string, Partial<ClipSpec>> }).clips
  : {};

const FPS = 24;
const SCALE = 4;
const AUDIT = join(ROOT, 'raw_assets', '_preview', 'motion_audit');
const REPORT = join(ROOT, 'docs', 'reports', 'motion_audit.md');

type Kind = 'swing' | 'serve' | 'loop' | 'split' | 'reaction';
const KIND: Record<string, Kind> = {
  fh_high: 'swing', fh_mid: 'swing', fh_low: 'swing', bh_high: 'swing', bh_mid: 'swing', bh_low: 'swing',
  reach_fh: 'swing', reach_bh: 'swing', smash: 'swing', serve: 'serve',
  idle: 'loop', serve_ready: 'loop', run_left: 'loop', run_right: 'loop', run_forward: 'loop', run_back: 'loop',
  split: 'split', victory: 'reaction', defeat: 'reaction', point_win: 'reaction', point_lose: 'reaction', walk_in: 'reaction',
};

/** Game-side timing the atlas must cover (seconds of clip time around the markers). */
const NEED = {
  takeBackLead: 0.55,
  coiledLead: 0.3,
  preToss: 0.2,
  postContact: 0.85,
  postSmash: 0.8,
  postServe: 0.95,
  crossfadeSeam: 0.05,
  crossfadeSeamMax: 0.2,
  loopSeamMax: 0.15,
  loopMinFallback: 0.5,
  crossfadeRun: 0.2,
  crossfadeIdle: 0.35,
  driftLimit: 0.05,
  loopMin: { idle: 1.2, serve_ready: 1.5, run: 1.0 },
  loopMax: { idle: 2.6, serve_ready: 3.0, run: 1.8 },
  loopLengthBonus: 0.0015,
  reactionMax: { victory: 3.4, defeat: 3.4, point_win: 2.0, point_lose: 2.0, walk_in: 4.0 },
  splitHalf: 0.4,
};

interface Track {
  n: number;
  w: number;
  h: number;
  dur: number;
  masks: Uint8Array[];
  area: Float64Array;
  cx: Float64Array;
  top: Float64Array;
  bottom: Float64Array;
  energy: Float64Array;
  standArea: number;
  standHeight: number;
}

function track(file: string): Track {
  const { w: W, h: H, dur } = videoSize(file);
  const w = Math.round(W / SCALE / 2) * 2;
  const h = Math.round(H / SCALE / 2) * 2;
  const buf = ffGray(file, 0, dur, `fps=${FPS},${keyChain(file)},alphaextract,erosion,scale=${w}:${h}:flags=area`);
  const size = w * h;
  const n = Math.floor(buf.length / size);
  const masks: Uint8Array[] = [];
  const area = new Float64Array(n);
  const cx = new Float64Array(n);
  const top = new Float64Array(n);
  const bottom = new Float64Array(n);
  for (let f = 0; f < n; f++) {
    const m = new Uint8Array(size);
    let a = 0;
    let sx = 0;
    let t = h;
    let b = -1;
    for (let y = 0; y < h; y++) {
      let row = 0;
      for (let x = 0; x < w; x++) {
        if (buf[f * size + y * w + x] >= 128) {
          m[y * w + x] = 1;
          a++;
          sx += x;
          row++;
        }
      }
      if (row >= 2) {
        if (y < t) t = y;
        b = y;
      }
    }
    masks.push(m);
    area[f] = a;
    cx[f] = a ? sx / a : w / 2;
    top[f] = t;
    bottom[f] = b;
  }
  // Feet line: lowest rows, horizontal center of the bottom 12% of the silhouette.
  for (let f = 0; f < n; f++) {
    const m = masks[f];
    const y0 = Math.max(0, Math.round(bottom[f] - (bottom[f] - top[f]) * 0.12));
    let s = 0;
    let c = 0;
    for (let y = y0; y <= bottom[f]; y++) for (let x = 0; x < w; x++) if (m[y * w + x]) (s += x), c++;
    if (c) cx[f] = s / c;
  }
  const sortedA = [...area].sort((p, q) => p - q);
  const standArea = Math.max(1, sortedA[Math.floor(n / 2)]);
  const heights = [...bottom].map((b, i) => b - top[i]).sort((p, q) => p - q);
  const standHeight = Math.max(1, heights[Math.floor(n / 2)]);
  const energy = new Float64Array(n);
  for (let f = 1; f < n; f++) energy[f] = diff(masks[f], masks[f - 1]) / standArea;
  if (n > 1) energy[0] = energy[1];
  return { n, w, h, dur, masks, area, cx, top, bottom, energy: smooth(energy, 1), standArea, standHeight };
}

function diff(a: Uint8Array, b: Uint8Array): number {
  let d = 0;
  for (let i = 0; i < a.length; i++) d += a[i] ^ b[i];
  return d;
}

function smooth(v: Float64Array, r: number): Float64Array {
  const o = new Float64Array(v.length);
  for (let i = 0; i < v.length; i++) {
    let s = 0;
    let c = 0;
    for (let k = -r; k <= r; k++) {
      const j = i + k;
      if (j >= 0 && j < v.length) (s += v[j]), c++;
    }
    o[i] = s / c;
  }
  return o;
}

const t2f = (t: number) => Math.round(t * FPS);
const f2t = (f: number) => +(f / FPS).toFixed(2);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function argmax(v: Float64Array, a: number, b: number): number {
  let best = a;
  for (let i = a; i <= b; i++) if (v[i] > v[best]) best = i;
  return best;
}
/** First / last frame whose energy stays above `thr` for a few frames. */
function activeWindow(e: Float64Array, thr: number): [number, number] | null {
  const n = e.length;
  let a = -1;
  for (let i = 0; i + 2 < n; i++) if (e[i] > thr && e[i + 1] > thr && e[i + 2] > thr) {
    a = i;
    break;
  }
  if (a < 0) return null;
  let b = n - 1;
  for (let i = n - 1; i >= 2; i--) if (e[i] > thr && e[i - 1] > thr && e[i - 2] > thr) {
    b = i;
    break;
  }
  return [a, b];
}

function percentile(v: Float64Array, p: number): number {
  const s = [...v].sort((x, y) => x - y);
  return s[Math.min(s.length - 1, Math.floor(p * s.length))];
}

interface Proposal {
  spec: Partial<ClipSpec>;
  notes: string[];
  warn: string[];
}

function analyzeClip(id: string, base: ClipSpec, t: Track, reviewed?: Review): Proposal {
  const kind = KIND[id] ?? 'reaction';
  const e = t.energy;
  const last = t.n - 1;
  const peak = percentile(e, 0.98);
  const quiet = percentile(e, 0.2);
  const notes: string[] = [];
  const warn: string[] = [];
  const spec: Partial<ClipSpec> = {};
  notes.push(`energy quiet ${quiet.toFixed(3)} / peak ${peak.toFixed(3)}`);
  if (peak < 0.04) warn.push('almost no motion detected');

  if (kind === 'swing' || kind === 'serve') {
    // Markers come from the hand review (energy peaks are unreliable: the take-back often moves
    // more silhouette than the swing itself). The energy guess is only reported.
    const m = { ...(base.markers ?? {}), ...(reviewed?.markers ?? {}) };
    const contact = m.contact ?? 2.0;
    const guess = f2t(argmax(e, clamp(t2f(contact - 0.6), 2, last - 2), clamp(t2f(contact + 0.6), 2, last - 2)));
    notes.push(`energy peak ${guess} s`);
    if (kind === 'serve') {
      const toss = m.toss ?? contact - 1.3;
      spec.markers = { toss, contact };
      spec.start = +Math.max(0, toss - NEED.preToss).toFixed(2);
      spec.end = +Math.min(t.dur - 0.05, contact + NEED.postServe).toFixed(2);
    } else {
      const backswing = m.backswing ?? contact - 0.4;
      spec.markers = { backswing, contact };
      // Coiled-start clips (backhands, slice) begin at the key pose; forehands get a take-back lead-in.
      const lead = backswing < 1.0 ? Math.min(backswing - 0.1, NEED.coiledLead) : NEED.takeBackLead;
      spec.start = +Math.max(0, backswing - lead).toFixed(2);
      spec.end = +Math.min(t.dur - 0.05, contact + (id === 'smash' ? NEED.postSmash : NEED.postContact)).toFixed(2);
      if (contact - backswing < 0.15) warn.push(`backswing→contact only ${(contact - backswing).toFixed(2)} s`);
    }
    if (t.dur - contact < NEED.postContact) warn.push('clip ends before the follow-through completes');
    const dc = contact - (base.markers?.contact ?? contact);
    if (Math.abs(dc) >= 0.1) notes.push(`contact ${dc > 0 ? '+' : ''}${dc.toFixed(2)} s vs. default`);
  } else if (kind === 'loop') {
    const run = id.startsWith('run_');
    const minL = run ? NEED.loopMin.run : NEED.loopMin[id as 'idle' | 'serve_ready'];
    const maxL = run ? NEED.loopMax.run : NEED.loopMax[id as 'idle' | 'serve_ready'];
    // Prefer the steady part: skip the first 0.5 s (start-frame lock) for runs.
    const from = reviewed?.range ? t2f(reviewed.range[0]) : t2f(run ? 0.6 : 0.3);
    const to = reviewed?.range ? Math.min(last - 2, t2f(reviewed.range[1])) : last - 2;
    // Longest window whose end matches its start (seam ≤ loopSeamMax) — a crossfade can hide a small
    // seam, but bridging a large one (e.g. the clip turns from profile to back view) ghosts the body.
    let best = { a: from, b: Math.min(to, from + t2f(minL)), score: Infinity, ok: false };
    const minRun = run ? t2f(NEED.loopMinFallback) : t2f(minL);
    for (let a = from; a < to; a++) {
      for (let b = a + minRun; b <= Math.min(to, a + t2f(maxL)); b++) {
        const seam = diff(t.masks[a], t.masks[b]) / t.standArea;
        // Runs must stay busy for the whole window (no settling into a stance).
        let busy = 0;
        if (run) for (let k = a; k <= b; k++) busy += e[k] < peak * 0.18 ? 1 : 0;
        const ok = seam <= NEED.loopSeamMax && b - a >= t2f(minL);
        const score = ok ? -(b - a) * NEED.loopLengthBonus + seam * 0.2 + busy * 0.02 : seam + busy * 0.02;
        if ((ok && !best.ok) || (ok === best.ok && score < best.score)) best = { a, b, score, ok };
      }
    }
    if (!best.ok && base.loop === 'loop') {
      // No repeating cycle in the clip: play a steady stretch forward/backward (no seam at all).
      // Steady = smallest silhouette-area swing, so the window never contains a turn.
      const L = Math.min(t2f(minL), to - from);
      let pick = { a: from, score: Infinity };
      for (let a = from; a + L <= to; a++) {
        let mn = Infinity;
        let mx = 0;
        let busy = 0;
        for (let k = a; k <= a + L; k++) {
          mn = Math.min(mn, t.area[k]);
          mx = Math.max(mx, t.area[k]);
          if (run && e[k] < peak * 0.18) busy++;
        }
        const score = mx / Math.max(1, mn) + busy * 0.05;
        if (score < pick.score) pick = { a, score };
      }
      best = { a: pick.a, b: pick.a + L, score: pick.score, ok: false };
      spec.loop = 'pingpong';
      notes.push('no repeating cycle → pingpong');
    }
    spec.start = f2t(best.a);
    spec.end = f2t(best.b);
    const seam = diff(t.masks[best.a], t.masks[best.b]) / t.standArea;
    notes.push(`loop ${spec.start}–${spec.end} s, seam ${(seam * 100).toFixed(1)} %`);
    if (best.ok && base.loop === 'loop' && seam > NEED.crossfadeSeam && seam <= NEED.crossfadeSeamMax) {
      spec.crossfade = run ? NEED.crossfadeRun : NEED.crossfadeIdle;
      notes.push(`crossfade ${spec.crossfade} s`);
    }
    // Horizontal drift of the feet across the window.
    let mn = Infinity;
    let mx = -Infinity;
    for (let k = best.a; k <= best.b; k++) (mn = Math.min(mn, t.cx[k])), (mx = Math.max(mx, t.cx[k]));
    const drift = (mx - mn) / t.standHeight;
    notes.push(`feet drift ${(drift * 100).toFixed(0)} % of height`);
    if (drift > NEED.driftLimit) spec.stabilize = true;
  } else if (kind === 'split') {
    const c = argmax(e, t2f(0.8), last - 2);
    spec.start = +Math.max(0, f2t(c) - NEED.splitHalf).toFixed(2);
    spec.end = +Math.min(t.dur - 0.05, f2t(c) + NEED.splitHalf).toFixed(2);
    notes.push(`hop peak ${f2t(c)} s`);
  } else {
    const thr = quiet + (peak - quiet) * 0.12;
    const win = activeWindow(e, thr);
    const maxL = NEED.reactionMax[id as keyof typeof NEED.reactionMax] ?? 3.4;
    if (!win) {
      warn.push('no active window');
    } else {
      const a = Math.max(0, win[0] - 2);
      let b = Math.min(last, win[1] + t2f(0.3));
      if (f2t(b - a) > maxL) b = a + t2f(maxL);
      spec.start = f2t(a);
      spec.end = +Math.min(t.dur - 0.05, f2t(b)).toFixed(2);
      notes.push(`active ${f2t(win[0])}–${f2t(win[1])} s`);
    }
  }
  return { spec, notes, warn };
}

function sparkline(e: Float64Array): string {
  const bars = '▁▂▃▄▅▆▇█';
  const mx = Math.max(1e-6, ...e);
  let s = '';
  for (let i = 0; i < e.length; i += 2) s += bars[Math.min(7, Math.floor((e[i] / mx) * 8))];
  return s;
}

/** 10 frames across the proposed segment, backswing / contact frames boxed. */
function sheet(file: string, spec: ClipSpec, out: string): void {
  const n = 10;
  const dur = spec.end - spec.start;
  const marks = Object.values(spec.markers ?? {});
  const times = Array.from({ length: n }, (_, i) => spec.start + (dur * i) / (n - 1));
  const sel = times.map((tt) => `lt(abs(t-${(tt - spec.start).toFixed(3)}),0.021)`).join('+');
  const box = marks.length
    ? `,drawbox=enable='${marks.map((m) => `lt(abs(t-${(m - spec.start).toFixed(3)}),0.06)`).join('+')}':x=0:y=0:w=iw:h=ih:color=red:t=6`
    : '';
  ff(['-ss', String(spec.start), '-t', String(dur + 0.05), '-i', file, '-vf', `fps=24,select='${sel}'${box},scale=-2:180,tile=${n}x1`, '-frames:v', '1', '-q:v', '4', out]);
}

/**
 * Review grid for one set: one row per clip, one column per 0.1 s (labels are tenths of a second),
 * all cropped to the set's union silhouette so racket positions are readable.
 */
function grid(set: string, rows: [string, string][], tracks: Map<string, Track>, windows: Record<string, [number, number]>, out: string): void {
  if (!rows.length) return;
  let x1 = Infinity;
  let y1 = Infinity;
  let x2 = -Infinity;
  let y2 = -Infinity;
  let W = 640;
  for (const [id] of rows) {
    const t = tracks.get(id)!;
    W = t.w * SCALE;
    for (let f = 0; f < t.n; f++) {
      const m = t.masks[f];
      for (let y = 0; y < t.h; y++) for (let x = 0; x < t.w; x++) if (m[y * t.w + x]) {
        if (x < x1) x1 = x;
        if (x > x2) x2 = x;
        if (y < y1) y1 = y;
        if (y > y2) y2 = y;
      }
    }
  }
  const cx = Math.max(0, (x1 - 1) * SCALE);
  const cy = Math.max(0, (y1 - 1) * SCALE);
  const cw = Math.min(W - cx, (x2 - x1 + 3) * SCALE);
  const H = tracks.get(rows[0][0])!.h * SCALE;
  const ch = Math.min(H - cy, (y2 - y1 + 3) * SCALE);
  const cols = 10;
  const strips: string[] = [];
  for (const [id, file] of rows) {
    const [from, to] = windows[id];
    const tileRows = Math.ceil((Math.round((to - from) * 10) + 1) / cols);
    const strip = join(AUDIT, `_strip_${id}.png`);
    const label = `drawtext=fontfile='C\\:/Windows/Fonts/arial.ttf':text='%{eif\\:(t+${from})*10+0.5\\:d}':x=3:y=3:fontsize=18:fontcolor=white:box=1:boxcolor=black@0.7`;
    const name = `drawtext=fontfile='C\\:/Windows/Fonts/arialbd.ttf':text='${id}':x=6:y=h-26:fontsize=20:fontcolor=yellow:box=1:boxcolor=black@0.8`;
    ff(['-ss', String(from), '-t', String(to - from + 0.05), '-i', file, '-vf', `fps=10,crop=${cw}:${ch}:${cx}:${cy},scale=-2:150,${label},tile=${cols}x${tileRows}:padding=2:color=white,${name}`, '-frames:v', '1', strip]);
    strips.push(strip);
  }
  const inputs = strips.flatMap((s) => ['-i', s]);
  if (strips.length === 1) ff([...inputs, '-q:v', '3', out]);
  else ff([...inputs, '-filter_complex', `${strips.map((_, i) => `[${i}:v]`).join('')}vstack=inputs=${strips.length}`, '-q:v', '3', out]);
  console.log(`  grid ${set} → ${out}`);
}

function main(): void {
  const args = process.argv.slice(2);
  const write = args.includes('--write');
  const profile = args.includes('--profile');
  const grids = args.includes('--grid');
  const only = args.filter((a) => !a.startsWith('--')).map((a) => a.toLowerCase());
  mkdirSync(AUDIT, { recursive: true });
  const overrides: Record<string, Partial<ClipSpec>> = { ...CONFIG.overrides };
  const lines: string[] = ['# Motion Audit', '', 'Generated by `npm run motion:audit`. Proposed segments / markers per clip (seconds of source video).', ''];
  for (const charId of readdirSync(RAW)) {
    const cid = charId.toLowerCase();
    if (charId.startsWith('_') || !statSync(join(RAW, charId)).isDirectory()) continue;
    for (const view of readdirSync(join(RAW, charId))) {
      if (!CONFIG.views[view]) continue;
      if (only.length && !only.includes(cid) && !only.includes(`${cid}/${view}`)) continue;
      const clips = findClips(join(RAW, charId, view));
      if (!clips.size) continue;
      console.log(`▶ ${cid}/${view}`);
      lines.push(`## ${cid} / ${view}`, '', '| Clip | Segment | Markers | Notes | Warnings |', '|---|---|---|---|---|');
      const tracks = new Map<string, Track>();
      for (const [id, file] of clips) tracks.set(id, track(file));
      if (grids) {
        const pick = (ids: string[]) => ids.filter((i) => clips.has(i)).map((i) => [i, clips.get(i)!] as [string, string]);
        const fhW: [number, number] = [1.0, 2.9];
        const bhW: [number, number] = [0.1, 2.0];
        const win = { fh_high: fhW, fh_mid: fhW, fh_low: fhW, reach_fh: fhW, smash: fhW, bh_high: bhW, bh_mid: bhW, bh_low: bhW, reach_bh: bhW, serve: [0.6, 3.5] as [number, number] };
        const g = (name: string, ids: string[]) => grid(`${cid}/${view} ${name}`, pick(ids), tracks, win, join(AUDIT, `grid_${cid}_${view}_${name}.jpg`));
        g('fh', ['fh_high', 'fh_mid', 'fh_low']);
        g('fh2', ['reach_fh', 'smash']);
        g('bh', ['bh_high', 'bh_mid', 'bh_low']);
        g('bh2', ['reach_bh']);
        g('serve', ['serve']);
        continue;
      }
      for (const [id, file] of clips) {
        const base = CONFIG.clips[id];
        const t = tracks.get(id)!;
        const reviewed = REVIEW[`${cid}/${view}/${id}`];
        const p = analyzeClip(id, base, t, reviewed);
        if (reviewed?.exclude) {
          p.spec.exclude = true;
          p.warn.push(`excluded: ${reviewed.note ?? 'does not match spec'}`);
        } else if (reviewed) p.notes.push('reviewed');
        const merged: ClipSpec = { ...base, ...p.spec, markers: { ...(base.markers ?? {}), ...(p.spec.markers ?? {}) } };
        if (profile) console.log(`  ${id.padEnd(12)} ${sparkline(t.energy)}`);
        const mk = Object.entries(merged.markers ?? {}).map(([k, v]) => `${k} ${v}`).join(', ');
        console.log(`  ${id.padEnd(12)} ${merged.start.toFixed(2)}–${merged.end.toFixed(2)}  ${mk.padEnd(30)} ${p.warn.length ? '⚠ ' + p.warn.join('; ') : ''}`);
        lines.push(`| ${id} | ${merged.start}–${merged.end} | ${mk || '—'} | ${p.notes.join('; ')} | ${p.warn.join('; ') || '—'} |`);
        overrides[`${cid}/${view}/${id}`] = p.spec;
        try {
          sheet(file, merged, join(AUDIT, `${cid}_${view}_${id}.jpg`));
        } catch (err) {
          console.warn(`  sheet ${id}: ${(err as Error).message.split('\n')[0]}`);
        }
      }
      const loops = ['run_left', 'run_right', 'run_forward', 'run_back'].filter((i) => clips.has(i));
      const loopWin: Record<string, [number, number]> = {};
      for (const i of loops) {
        const o = overrides[`${cid}/${view}/${i}`] ?? {};
        const b = CONFIG.clips[i];
        loopWin[i] = [o.start ?? b.start, o.end ?? b.end];
      }
      try {
        grid(`${cid}/${view} loops`, loops.map((i) => [i, clips.get(i)!] as [string, string]), tracks, loopWin, join(AUDIT, `grid_${cid}_${view}_loops.jpg`));
      } catch (err) {
        console.warn(`  loop grid: ${(err as Error).message.split('\n')[0]}`);
      }
      lines.push('');
    }
  }
  writeFileSync(REPORT, `${plainMarkdown(lines.join('\n'))}\n`);
  console.log(`report → ${REPORT}`);
  if (write) {
    const cfg = { ...CONFIG, overrides };
    writeFileSync(CONFIG_PATH, `${JSON.stringify(cfg, null, 2)}\n`);
    console.log(`overrides → ${CONFIG_PATH}`);
  }
}

main();
