/**
 * Asset inbox pipeline: original Flow downloads → web-ready files the game loads.
 *
 *   raw_assets/images_src/images/{folder}/{name}.jpg|png   → public/assets/images/{folder}/{name}.webp
 *   raw_assets/images_src/icons/{name}.jpg|png              → public/assets/icons/{name}.png (square crop)
 *   raw_assets/images_src/video/{folder}/{name}.mp4         → public/assets/video/{folder}/{name}.mp4 (H.264, faststart)
 *   raw_assets/images_src/motion/{char_0N}/{view}/*.mp4     → npm run motion (sprite atlases)
 *   raw_assets/images_src/references/*                      → not shipped (Flow reference images only)
 *
 * Usage:
 *   npm run images                 convert new or changed files, then rebuild changed motion sets
 *   npm run images -- --force      reconvert everything
 *   npm run images -- --dry        list what would be converted
 *   npm run images -- --no-motion  skip the motion step
 *   npm run images -- --missing    also list every expected file that is not in the inbox yet
 *
 * A trailing `_{N}s` in a video name (e.g. `stage_01_intro_4s`) trims the clip to N seconds.
 * Expected names come from `09_Flow Prompt Full Set for each object.md`; unknown names are converted but flagged.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, parse, relative, sep } from 'node:path';
import ffmpegPath from 'ffmpeg-static';

interface ImageRule {
  quality?: number;
  maxWidth?: number;
  /** Key out the background green (sprite sheets generated on a chroma backdrop). */
  chromaKey?: boolean;
}

interface Config {
  image: { quality: number; maxWidth: number; folders: Record<string, ImageRule> };
  icon: { size: number; extraSizes?: number[] };
  key: { similarity: number; blend: number; despillMix: number };
  video: { crf: number; preset: string; maxWidth: number; audioKbps: number };
}

type Kind = 'image' | 'icon' | 'video';

interface Job {
  kind: Kind;
  src: string;
  dest: string;
  rel: string;
  folder: string;
}

const ROOT = process.cwd();
const SRC = join(ROOT, 'raw_assets', 'images_src');
const OUT = join(ROOT, 'public', 'assets');
const MOTION_SRC = join(SRC, 'motion');
const MOTION_OUT = join(OUT, 'motion');
const DOC_09 = join(ROOT, '09_Flow Prompt Full Set for each object.md');
const MOTION_SCRIPT = join(ROOT, 'tools', 'motion', 'build-motion.ts');
const TSX_CLI = join(ROOT, 'node_modules', 'tsx', 'dist', 'cli.mjs');
const CONFIG = JSON.parse(readFileSync(join(ROOT, 'tools', 'assets', 'assets.config.json'), 'utf8')) as Config;
const IMAGE_EXT = ['.jpg', '.jpeg', '.png', '.webp'];
const VIDEO_EXT = ['.mp4', '.mov', '.webm', '.mkv'];
const SKIP_TOP = new Set(['motion', 'references']);

if (!ffmpegPath || !existsSync(ffmpegPath)) {
  console.error('ffmpeg binary not found. Run: npm install (ffmpeg-static).');
  process.exit(1);
}
const FFMPEG: string = ffmpegPath;

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const DRY = args.includes('--dry');
const NO_MOTION = args.includes('--no-motion');
const LIST_MISSING = args.includes('--missing');

const posix = (p: string) => p.split(sep).join('/');
const keyOf = (relPath: string) => {
  const p = parse(relPath);
  return posix(join(p.dir, p.name)).toLowerCase();
};

function walk(dir: string, acc: string[] = []): string[] {
  if (!existsSync(dir)) return acc;
  for (const name of readdirSync(dir)) {
    if (name.startsWith('.')) continue;
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      if (!name.startsWith('_')) walk(full, acc);
    } else acc.push(full);
  }
  return acc;
}

/** Inbox paths listed in the 09 prompt document, keyed without extension. */
function expectedKeys(): Map<string, string> {
  const keys = new Map<string, string>();
  if (!existsSync(DOC_09)) return keys;
  const re = /raw_assets\/images_src\/((?:[\w\-.]|\\_|\/)+\.\w+)/g;
  for (const m of readFileSync(DOC_09, 'utf8').matchAll(re)) {
    const rel = m[1].replace(/\\_/g, '_');
    keys.set(keyOf(rel), rel);
  }
  return keys;
}

function planJob(src: string): Job | string {
  const rel = posix(relative(SRC, src));
  const top = rel.split('/')[0];
  const ext = parse(src).ext.toLowerCase();
  const folder = posix(dirname(rel));
  const destBase = join(OUT, dirname(rel), parse(src).name);
  if (top === 'images') {
    if (!IMAGE_EXT.includes(ext)) return `${rel}: not an image (jpg / png / webp expected in images/)`;
    return { kind: 'image', src, dest: `${destBase}.webp`, rel, folder };
  }
  if (top === 'icons') {
    if (!IMAGE_EXT.includes(ext)) return `${rel}: not an image (jpg / png expected in icons/)`;
    return { kind: 'icon', src, dest: `${destBase}.png`, rel, folder };
  }
  if (top === 'video') {
    if (!VIDEO_EXT.includes(ext)) return `${rel}: not a video (mp4 expected in video/)`;
    return { kind: 'video', src, dest: `${destBase}.mp4`, rel, folder };
  }
  return `${rel}: unknown top folder "${top}" (use images/, icons/, video/, motion/, references/)`;
}

function upToDate(job: Job): boolean {
  return !FORCE && existsSync(job.dest) && statSync(job.dest).mtimeMs >= statSync(job.src).mtimeMs;
}

function ff(ffArgs: string[]): void {
  const r = spawnSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-y', ...ffArgs], { encoding: 'utf8' });
  if (r.status !== 0) throw new Error((r.stderr ?? '').trim().split('\n').slice(-6).join('\n'));
}

/** Chroma key using the image's own corner color (generators drift from pure #00FF00). */
function chromaChain(src: string): string {
  const r = spawnSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-i', src, '-vf', 'crop=iw*0.02:ih*0.02:iw*0.005:ih*0.005,scale=1:1:flags=area', '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
  const px = r.stdout as Buffer;
  const color = r.status === 0 && px.length >= 3 ? `0x${px.subarray(0, 3).toString('hex')}` : '0x00FF00';
  const k = CONFIG.key;
  return `chromakey=${color}:${k.similarity}:${k.blend},despill=type=green:mix=${k.despillMix},format=rgba`;
}

function convert(job: Job): void {
  mkdirSync(dirname(job.dest), { recursive: true });
  if (job.kind === 'image') {
    const rule = CONFIG.image.folders[job.folder] ?? {};
    const maxW = rule.maxWidth ?? CONFIG.image.maxWidth;
    const quality = rule.quality ?? CONFIG.image.quality;
    const key = rule.chromaKey ? `${chromaChain(job.src)},` : '';
    ff(['-i', job.src, '-vf', `${key}scale='min(${maxW},iw)':-2:flags=lanczos`, '-frames:v', '1', '-c:v', 'libwebp', '-quality', String(quality), '-compression_level', '6', job.dest]);
  } else if (job.kind === 'icon') {
    const square = (s: number, out: string) =>
      ff(['-i', job.src, '-vf', `scale=${s}:${s}:force_original_aspect_ratio=increase:flags=lanczos,crop=${s}:${s}`, '-frames:v', '1', out]);
    square(CONFIG.icon.size, job.dest);
    const base = parse(job.dest).name.replace(/_\d+$/, '');
    for (const s of CONFIG.icon.extraSizes ?? []) square(s, join(dirname(job.dest), `${base}_${s}.png`));
  } else {
    const v = CONFIG.video;
    const seconds = /_(\d+(?:\.\d+)?)s$/.exec(parse(job.src).name)?.[1];
    ff([
      '-i', job.src,
      ...(seconds ? ['-t', seconds] : []),
      '-vf', `scale='min(${v.maxWidth},iw)':-2:flags=lanczos,format=yuv420p`,
      '-c:v', 'libx264', '-preset', v.preset, '-crf', String(v.crf),
      '-c:a', 'aac', '-b:a', `${v.audioKbps}k`,
      '-movflags', '+faststart',
      job.dest,
    ]);
  }
}

const kb = (file: string) => `${Math.round(statSync(file).size / 1024)} KB`;

/** Characters whose motion clips are newer than their built manifests. */
function changedMotionSets(): string[] {
  if (!existsSync(MOTION_SRC)) return [];
  const changed: string[] = [];
  for (const charId of readdirSync(MOTION_SRC)) {
    const charDir = join(MOTION_SRC, charId);
    if (charId.startsWith('_') || !statSync(charDir).isDirectory()) continue;
    let dirty = false;
    for (const view of readdirSync(charDir)) {
      const viewDir = join(charDir, view);
      if (!statSync(viewDir).isDirectory()) continue;
      const clips = readdirSync(viewDir).filter((f) => !f.startsWith('_') && VIDEO_EXT.includes(parse(f).ext.toLowerCase()));
      if (!clips.length) continue;
      const manifest = join(MOTION_OUT, charId.toLowerCase(), view, 'manifest.json');
      const built = existsSync(manifest) ? statSync(manifest).mtimeMs : 0;
      if (FORCE || clips.some((f) => statSync(join(viewDir, f)).mtimeMs > built)) dirty = true;
    }
    if (dirty) changed.push(charId);
  }
  return changed;
}

function main(): void {
  if (!existsSync(SRC)) {
    console.log(`No ${SRC}. Create it and drop the Flow downloads there (see 09 doc for file names).`);
    return;
  }
  const expected = expectedKeys();
  const seen = new Set<string>();
  const warnings: string[] = [];
  let done = 0;
  let skipped = 0;
  let failed = 0;

  for (const src of walk(SRC)) {
    const rel = posix(relative(SRC, src));
    seen.add(keyOf(rel));
    if (SKIP_TOP.has(rel.split('/')[0]) || parse(src).name.startsWith('_')) continue;
    const job = planJob(src);
    if (typeof job === 'string') {
      warnings.push(job);
      continue;
    }
    if (expected.size && !expected.has(keyOf(rel))) warnings.push(`${rel}: name not in the 09 doc (converted anyway; the game may not load it)`);
    if (upToDate(job)) {
      skipped++;
      continue;
    }
    const destRel = posix(relative(ROOT, job.dest));
    if (DRY) {
      console.log(`  would convert ${rel} → ${destRel}`);
      continue;
    }
    try {
      convert(job);
      done++;
      console.log(`  ✓ ${rel} → ${destRel} (${kb(job.dest)})`);
    } catch (e) {
      failed++;
      console.error(`  ✗ ${rel}: ${(e as Error).message}`);
    }
  }

  for (const w of warnings) console.warn(`  ! ${w}`);

  const missing = [...expected.entries()].filter(([k]) => !seen.has(k)).map(([, rel]) => rel);
  const groups = new Map<string, { have: number; total: number }>();
  for (const [k, rel] of expected) {
    const g = rel.split('/')[0];
    const cur = groups.get(g) ?? { have: 0, total: 0 };
    cur.total++;
    if (seen.has(k)) cur.have++;
    groups.set(g, cur);
  }
  console.log(`\nconverted ${done}, up-to-date ${skipped}, failed ${failed}${DRY ? ' (dry run)' : ''}`);
  if (groups.size) console.log(`inbox coverage: ${[...groups].map(([g, c]) => `${g} ${c.have}/${c.total}`).join(' · ')}`);
  if (LIST_MISSING) for (const m of missing) console.log(`  - missing raw_assets/images_src/${m}`);

  if (!NO_MOTION && !DRY) {
    const sets = changedMotionSets();
    for (const charId of sets) {
      console.log(`\nmotion: rebuilding ${charId}`);
      const r = spawnSync(process.execPath, [TSX_CLI, MOTION_SCRIPT, charId], { stdio: 'inherit' });
      if (r.status !== 0) failed++;
    }
    if (!sets.length) console.log('motion: no changed clip sets');
  }
  if (failed) process.exitCode = 1;
}

main();
