/**
 * Shared helpers for the motion tools (build-motion, analyze-motion): config, ffmpeg wrappers, chroma key chain.
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, parse } from 'node:path';
import ffmpegPath from 'ffmpeg-static';

export type LoopMode = 'loop' | 'pingpong' | 'once';

export interface ClipSpec {
  start: number;
  end: number;
  fps: number;
  loop: LoopMode;
  markers?: Record<string, number>;
  /** Re-center every frame horizontally on the feet (in-place cycles that drift in the source video). */
  stabilize?: boolean;
  /** Loop clips: seconds of tail blended into the head so the wrap has no pop. */
  crossfade?: number;
  /** Clip does not match its spec (wrong stroke side etc.) — not packed; the game falls back. */
  exclude?: boolean;
}

export interface Config {
  key: { color: string; auto?: boolean; similarity: number; blend: number; despillMix: number };
  mask?: { x: number; y: number; w: number; h: number }[];
  detect: { fps: number; alphaLimit: number; padRatio: number; downscale: number; minPixels: number };
  maxTexture: number;
  quality: number;
  views: Record<string, { cellHeight: number }>;
  clips: Record<string, ClipSpec>;
  overrides: Record<string, Partial<ClipSpec>>;
}

export const ROOT = process.cwd();
export const RAW = join(ROOT, 'raw_assets', 'images_src', 'motion');
export const OUT = join(ROOT, 'public', 'assets', 'motion');
export const CONFIG_PATH = join(ROOT, 'tools', 'motion', 'motion.config.json');
export const CONFIG = JSON.parse(readFileSync(CONFIG_PATH, 'utf8')) as Config;
export const VIDEO_EXT = ['.mp4', '.mov', '.webm', '.mkv'];

if (!ffmpegPath || !existsSync(ffmpegPath)) {
  console.error('ffmpeg binary not found. Run: npm install (ffmpeg-static).');
  process.exit(1);
}
export const FFMPEG: string = ffmpegPath;

export function ff(args: string[]): string {
  const r = spawnSync(FFMPEG, ['-hide_banner', '-y', ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`ffmpeg failed (${r.status}):\n${(r.stderr ?? '').split('\n').slice(-12).join('\n')}`);
  return r.stderr ?? '';
}

/** Raw single-channel frames from a filter chain. */
export function ffGray(file: string, start: number, dur: number, vf: string): Buffer {
  const r = spawnSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-ss', String(start), '-t', String(Math.max(0.05, dur)), '-i', file, '-vf', vf, '-an', '-f', 'rawvideo', '-pix_fmt', 'gray', '-'], { maxBuffer: 1024 * 1024 * 1024 });
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${r.stderr?.toString().slice(-400)}`);
  return r.stdout as Buffer;
}

export function videoSize(file: string): { w: number; h: number; dur: number } {
  const r = spawnSync(FFMPEG, ['-hide_banner', '-i', file], { encoding: 'utf8' });
  const s = r.stderr ?? '';
  const m = /Video:.*?(\d{2,5})x(\d{2,5})/.exec(s);
  const d = /Duration: (\d+):(\d+):([\d.]+)/.exec(s);
  if (!m) throw new Error(`Cannot read video size: ${file}`);
  return { w: Number(m[1]), h: Number(m[2]), dur: d ? Number(d[1]) * 3600 + Number(d[2]) * 60 + Number(d[3]) : 4 };
}

const keyColors = new Map<string, string>();

/** Background green actually used by a clip (generators drift from #00FF00), sampled from the top-left corner. */
export function keyColorOf(file: string): string {
  const cached = keyColors.get(file);
  if (cached) return cached;
  let color = CONFIG.key.color;
  if (CONFIG.key.auto) {
    const r = spawnSync(FFMPEG, ['-hide_banner', '-loglevel', 'error', '-ss', '0.5', '-i', file, '-vf', 'crop=iw*0.04:ih*0.04:iw*0.01:ih*0.01,scale=1:1:flags=area', '-frames:v', '1', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-']);
    const px = r.stdout as Buffer;
    if (r.status === 0 && px.length >= 3 && px[1] > px[0] && px[1] > px[2]) color = `0x${px.subarray(0, 3).toString('hex').toUpperCase()}`;
  }
  keyColors.set(file, color);
  return color;
}

/** Paints generator watermarks (normalized rects) with the key color so they key out and never widen the crop. */
const maskChain = (color: string) =>
  (CONFIG.mask ?? []).map((m) => `drawbox=x=iw*${m.x}:y=ih*${m.y}:w=iw*${m.w}:h=ih*${m.h}:color=${color}:t=fill,`).join('');

export const keyChain = (file: string): string => {
  const color = keyColorOf(file);
  return `${maskChain(color)}chromakey=${color}:${CONFIG.key.similarity}:${CONFIG.key.blend},despill=type=green:mix=${CONFIG.key.despillMix}`;
};

export const even = (v: number): number => Math.max(2, Math.round(v / 2) * 2);

export function specFor(charId: string, view: string, clipId: string, config: Config = CONFIG): ClipSpec {
  const base = config.clips[clipId];
  const o = config.overrides[`${charId.toLowerCase()}/${view}/${clipId}`] ?? {};
  return { ...base, ...o, markers: { ...(base.markers ?? {}), ...(o.markers ?? {}) } };
}

export function findClips(dir: string): Map<string, string> {
  const clips = new Map<string, string>();
  for (const f of readdirSync(dir)) {
    const p = parse(f);
    if (VIDEO_EXT.includes(p.ext.toLowerCase()) && CONFIG.clips[p.name]) clips.set(p.name, join(dir, f));
    else if (VIDEO_EXT.includes(p.ext.toLowerCase())) console.warn(`  skip ${f}: unknown clip id (see motion.config.json)`);
  }
  return clips;
}
