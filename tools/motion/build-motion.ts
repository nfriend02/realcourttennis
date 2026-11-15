/**
 * Motion pipeline: AI-generated 4 s green-screen clips → chroma-keyed sprite atlases for the game.
 *
 *   raw_assets/images_src/motion/{char_0N}/{back|front}/{clipId}.mp4
 *     → public/assets/motion/{char_0N}/{view}/{clipId}.webp + manifest.json
 *
 * Usage:
 *   npm run motion                 build every set found
 *   npm run motion -- char_01      build one character (or char_01/front for one view)
 *   npm run motion -- --preview    timestamped contact sheets (raw_assets/_preview/motion) to tune markers
 *
 * Per-clip segments / markers come from motion.config.json "clips", refined per character by
 * "overrides" (written by `npm run motion:audit -- --write`). Refinements applied here:
 *   - exclude:   the clip is not packed (game falls back to a related clip)
 *   - crossfade: loop clips blend their tail into their head so the wrap has no visible pop
 *   - stabilize: per-frame horizontal foot offsets (manifest `dx`) so in-place cycles do not slide
 *
 * All clips of one set share a single crop (union of every frame's silhouette), so feet and body
 * center stay aligned when the game switches clips. Scale comes from the idle clip's standing height.
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { type ClipSpec, CONFIG, even, ff, ffGray, findClips, keyChain, type LoopMode, OUT, RAW, ROOT, specFor, videoSize } from './motionLib';

interface Box {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

const PREVIEW = join(ROOT, 'raw_assets', '_preview', 'motion');
const CHARACTERS = JSON.parse(readFileSync(join(ROOT, 'src', 'data', 'characters.json'), 'utf8')) as { id: string; heightM: number }[];
const FONT = 'C:/Windows/Fonts/arial.ttf';

/** Union bounding box of the keyed silhouette over [start, end] (source pixels, after scaling to ref size). */
function detectBox(file: string, start: number, end: number, ref: { w: number; h: number }): Box | null {
  const s = CONFIG.detect.downscale;
  const w = even(ref.w / s);
  const h = even(ref.h / s);
  const buf = ffGray(file, start, end - start, `scale=${ref.w}:${ref.h},fps=${CONFIG.detect.fps},${keyChain(file)},alphaextract,erosion,scale=${w}:${h}:flags=area`);
  const size = w * h;
  const minRun = CONFIG.detect.minPixels;
  let box: Box | null = null;
  for (let f = 0; f + size <= buf.length; f += size) {
    let x1 = w;
    let x2 = -1;
    let y1 = h;
    let y2 = -1;
    for (let y = 0; y < h; y++) {
      let count = 0;
      let rx1 = w;
      let rx2 = -1;
      const row = f + y * w;
      for (let x = 0; x < w; x++) {
        if (buf[row + x] >= CONFIG.detect.alphaLimit) {
          count++;
          if (x < rx1) rx1 = x;
          rx2 = x;
        }
      }
      if (count < minRun) continue;
      if (y < y1) y1 = y;
      y2 = y;
      if (rx1 < x1) x1 = rx1;
      if (rx2 > x2) x2 = rx2;
    }
    if (x2 < 0) continue;
    const b = { x1: x1 * s, y1: y1 * s, x2: (x2 + 1) * s, y2: (y2 + 1) * s };
    box = box ? { x1: Math.min(box.x1, b.x1), y1: Math.min(box.y1, b.y1), x2: Math.max(box.x2, b.x2), y2: Math.max(box.y2, b.y2) } : b;
  }
  return box;
}

/**
 * Horizontal feet center per output frame (source pixels): center of the lowest 12 % of the silhouette.
 * Frames are produced by the same fps / crossfade graph as the atlas, so indices match.
 */
function feetCenters(file: string, s: ClipSpec, ref: { w: number; h: number }): number[] {
  const k = CONFIG.detect.downscale;
  const w = even(ref.w / k);
  const h = even(ref.h / k);
  const buf = ffGray(file, s.start, s.end - s.start, `scale=${ref.w}:${ref.h},fps=${s.fps},${keyChain(file)},alphaextract,erosion,scale=${w}:${h}:flags=area`);
  const size = w * h;
  const out: number[] = [];
  for (let f = 0; f + size <= buf.length; f += size) {
    let top = h;
    let bottom = -1;
    for (let y = 0; y < h; y++) {
      let c = 0;
      for (let x = 0; x < w; x++) if (buf[f + y * w + x] >= 128) c++;
      if (c >= 2) {
        if (y < top) top = y;
        bottom = y;
      }
    }
    if (bottom < 0) {
      out.push(out.length ? out[out.length - 1] : ref.w / 2);
      continue;
    }
    const y0 = Math.max(0, Math.round(bottom - (bottom - top) * 0.12));
    let sx = 0;
    let n = 0;
    for (let y = y0; y <= bottom; y++) for (let x = 0; x < w; x++) if (buf[f + y * w + x] >= 128) (sx += x), n++;
    out.push(n ? (sx / n + 0.5) * k : ref.w / 2);
  }
  return applyCrossfade(out, s, (a, b, t) => a * (1 - t) + b * t);
}

/** Frames dropped / blended by the loop crossfade, applied to any per-frame series. */
function applyCrossfade<T>(frames: T[], s: ClipSpec, mix: (a: T, b: T, t: number) => T): T[] {
  const d = crossfadeFrames(s);
  if (!d || frames.length <= d * 2) return frames;
  const L = frames.length;
  const body = frames.slice(d, L - d);
  const blend = Array.from({ length: d }, (_, i) => mix(frames[L - d + i], frames[i], i / d));
  return [...body, ...blend];
}

const crossfadeFrames = (s: ClipSpec): number => (s.loop === 'loop' && s.crossfade ? Math.max(1, Math.round(s.crossfade * s.fps)) : 0);

function buildSet(charId: string, view: string): void {
  const dir = join(RAW, charId, view);
  const all = findClips(dir);
  if (!all.size) return;
  const viewCfg = CONFIG.views[view];
  if (!viewCfg) {
    console.warn(`  skip view "${view}" (expected back | front)`);
    return;
  }
  const character = CHARACTERS.find((c) => c.id.toLowerCase() === charId.toLowerCase());
  if (!character) throw new Error(`Unknown character ${charId}`);
  const clips = new Map([...all].filter(([id]) => !specFor(charId, view, id).exclude));
  for (const id of all.keys()) if (!clips.has(id)) console.log(`  – ${id}: excluded (motion.config overrides)`);
  console.log(`▶ ${charId}/${view}: ${[...clips.keys()].join(', ')}`);

  const first = clips.get('idle') ?? [...clips.values()][0];
  const ref = videoSize(first);

  // 1) Union crop for the whole set + standing reference from idle.
  let union: Box | null = null;
  for (const [id, file] of clips) {
    const s = specFor(charId, view, id);
    const b = detectBox(file, s.start, s.end, ref);
    if (!b) {
      console.warn(`  ${id}: no silhouette detected (check green background / key settings)`);
      continue;
    }
    union = union ? { x1: Math.min(union.x1, b.x1), y1: Math.min(union.y1, b.y1), x2: Math.max(union.x2, b.x2), y2: Math.max(union.y2, b.y2) } : b;
  }
  const idleSpec = specFor(charId, view, clips.has('idle') ? 'idle' : [...clips.keys()][0]);
  const stand = detectBox(first, idleSpec.start, idleSpec.start + 0.25, ref);
  if (!union || !stand) throw new Error(`${charId}/${view}: silhouette detection failed`);

  const pad = Math.round((union.y2 - union.y1) * CONFIG.detect.padRatio);
  const cx1 = Math.max(0, union.x1 - pad);
  const cy1 = Math.max(0, union.y1 - pad);
  const cx2 = Math.min(ref.w, union.x2 + pad);
  const cy2 = Math.min(ref.h, union.y2 + Math.round(pad / 3));
  const cw = even(cx2 - cx1);
  const chh = even(cy2 - cy1);
  const pxPerMeter = (stand.y2 - stand.y1) / character.heightM;
  const cellH = viewCfg.cellHeight;
  const cellW = even((cellH * cw) / chh);
  const anchorPx = (stand.x1 + stand.x2) / 2;

  const outDir = join(OUT, charId.toLowerCase(), view);
  mkdirSync(outDir, { recursive: true });
  const manifest = {
    version: 2,
    charId: charId.toLowerCase(),
    view,
    cellW,
    cellH,
    frameWidthM: +(cw / pxPerMeter).toFixed(4),
    frameHeightM: +(chh / pxPerMeter).toFixed(4),
    anchorX: +((anchorPx - cx1) / cw).toFixed(4),
    footY: +((stand.y2 - cy1) / chh).toFixed(4),
    clips: {} as Record<string, { file: string; cols: number; rows: number; frames: number; fps: number; loop: LoopMode; markers: Record<string, number>; dx?: number[] }>,
  };

  // 2) One atlas per clip.
  for (const [id, file] of clips) {
    const s = specFor(charId, view, id);
    const chain = [`scale=${ref.w}:${ref.h}`, `fps=${s.fps}`, keyChain(file), `crop=${cw}:${chh}:${cx1}:${cy1}`, `scale=${cellW}:${cellH}:flags=lanczos`, 'format=rgba'].join(',');
    const L = s.end - s.start;
    const d = crossfadeFrames(s);
    const D = d / s.fps;
    // Crossfade: [D, L-D] followed by tail→head blend, so the last frame flows into the first.
    const graph = d
      ? `[0:v]${chain},split=3[a][b][c];[a]trim=start=${D}:end=${L - D},setpts=PTS-STARTPTS[body];[b]trim=start=${L - D}:end=${L},setpts=PTS-STARTPTS[tail];[c]trim=start=0:end=${D},setpts=PTS-STARTPTS[head];[tail][head]blend=all_expr='A*(1-T/${D})+B*(T/${D})'[mix];[body][mix]concat=n=2:v=1:a=0`
      : `[0:v]${chain}`;
    const log = ff(['-ss', String(s.start), '-t', String(L), '-i', file, '-filter_complex', graph, '-an', '-f', 'null', '-']);
    const counts = [...log.matchAll(/frame=\s*(\d+)/g)];
    const frames = counts.length ? Number(counts[counts.length - 1][1]) : Math.round(L * s.fps);
    const cols = Math.max(1, Math.min(frames, Math.floor(CONFIG.maxTexture / cellW), Math.ceil(Math.sqrt((frames * cellH) / cellW))));
    const rows = Math.ceil(frames / cols);
    if (rows * cellH > CONFIG.maxTexture) {
      console.warn(`  ${id}: ${frames} frames exceed ${CONFIG.maxTexture}px atlas — lower fps or shorten the segment`);
      continue;
    }
    const outFile = join(outDir, `${id}.webp`);
    ff(['-ss', String(s.start), '-t', String(L), '-i', file, '-filter_complex', `${graph},tile=${cols}x${rows}:color=0x00000000`, '-frames:v', '1', '-an', '-c:v', 'libwebp', '-quality', String(CONFIG.quality), '-compression_level', '6', outFile]);
    const markers: Record<string, number> = {};
    for (const [k, v] of Object.entries(s.markers ?? {})) markers[k] = +(v - s.start).toFixed(3);
    const entry: (typeof manifest.clips)[string] = { file: `${id}.webp`, cols, rows, frames, fps: s.fps, loop: s.loop, markers };
    if (s.stabilize) {
      const feet = feetCenters(file, s, ref);
      const sm = feet.map((_, i) => (feet[Math.max(0, i - 1)] + feet[i] + feet[Math.min(feet.length - 1, i + 1)]) / 3);
      entry.dx = Array.from({ length: frames }, (_, i) => +(((sm[Math.min(i, sm.length - 1)] ?? anchorPx) - anchorPx) / pxPerMeter).toFixed(3));
    }
    manifest.clips[id] = entry;
    console.log(`  ✓ ${id}: ${frames} frames, ${cols}x${rows} @ ${cellW}x${cellH}${d ? `, crossfade ${d}f` : ''}${s.stabilize ? ', stabilized' : ''}`);
  }
  writeFileSync(join(outDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  console.log(`  → ${join('public', 'assets', 'motion', charId.toLowerCase(), view, 'manifest.json')}`);
}

function preview(charId: string, view: string): void {
  const dir = join(RAW, charId, view);
  mkdirSync(PREVIEW, { recursive: true });
  for (const [id, file] of findClips(dir)) {
    const text = existsSync(FONT) ? `,drawtext=fontfile='C\\:/Windows/Fonts/arial.ttf':text='%{pts\\:flt}':x=6:y=6:fontsize=22:fontcolor=white:box=1:boxcolor=black@0.6` : '';
    const out = join(PREVIEW, `${charId}_${view}_${id}.jpg`);
    ff(['-i', file, '-vf', `fps=6,scale=-2:260${text},tile=6x4`, '-frames:v', '1', '-q:v', '3', out]);
    console.log(`  preview ${out}`);
  }
}

function main(): void {
  const args = process.argv.slice(2);
  const doPreview = args.includes('--preview');
  const only = args.filter((a) => !a.startsWith('--')).map((a) => a.toLowerCase());
  if (!existsSync(RAW)) {
    console.log(`No ${RAW} — put clips at raw_assets/images_src/motion/{char_0N}/{back|front}/{clipId}.mp4`);
    return;
  }
  let sets = 0;
  for (const charId of readdirSync(RAW)) {
    const cid = charId.toLowerCase();
    if (charId.startsWith('_') || (only.length && !only.some((o) => o === cid || o.startsWith(`${cid}/`)))) continue;
    const charDir = join(RAW, charId);
    if (!statSync(charDir).isDirectory()) continue;
    for (const view of readdirSync(charDir)) {
      if (!CONFIG.views[view] || !statSync(join(charDir, view)).isDirectory()) continue;
      if (only.length && !only.includes(cid) && !only.includes(`${cid}/${view}`)) continue;
      if (doPreview) preview(charId, view);
      else buildSet(charId, view);
      sets++;
    }
  }
  console.log(sets ? 'motion OK' : 'No clip sets found.');
}

main();
