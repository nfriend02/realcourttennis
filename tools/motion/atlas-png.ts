/**
 * Decodes motion atlases to PNG on a white background for visual review.
 * Usage: npx tsx tools/motion/atlas-png.ts char_02/back/run_left [char_03/back/bh_mid ...]
 * Output: raw_assets/_preview/check/{char}_{view}_{clip}.png
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { ff, OUT, ROOT } from './motionLib';

const dir = join(ROOT, 'raw_assets', '_preview', 'check');
mkdirSync(dir, { recursive: true });
for (const id of process.argv.slice(2)) {
  const [c, v, clip] = id.split('/');
  const out = join(dir, `${c}_${v}_${clip}.png`);
  ff(['-i', join(OUT, c, v, `${clip}.webp`), '-filter_complex', 'color=white,format=rgb24[bg];[bg][0:v]scale2ref[bg2][fg];[bg2][fg]overlay=shortest=1', '-frames:v', '1', '-update', '1', out]);
  console.log(out);
}
