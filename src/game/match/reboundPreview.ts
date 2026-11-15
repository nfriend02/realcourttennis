import type { PhysicsConfig } from '../../data/gameData';
import type { Prediction } from '../physics/ballFlight';
import type { StrokeHeight } from '../physics/types';
import { heightBandOf } from './positioning';

export interface ReboundPreview {
  /** First bounce on the court. */
  landX: number;
  landZ: number;
  landT: number;
  /** Highest point after the first bounce, before the second. */
  apexX: number;
  apexY: number;
  apexZ: number;
  apexT: number;
  band: StrokeHeight;
  /** Subsampled path from bounce to apex (inclusive), for Rebound Arc (cue 1). */
  arc: { x: number; y: number; z: number }[];
}

const ARC_CAP = 12;

/**
 * Predicted rebound after the first bounce: apex height → High / Middle / Low band,
 * plus a short arc for cue 1. Returns null when the first bounce is unknown.
 */
export function reboundPreview(pred: Prediction, cfg: PhysicsConfig, maxDots = ARC_CAP): ReboundPreview | null {
  const fb = pred.firstBounce;
  if (!fb) return null;
  const s = pred.samples;
  let apexI = -1;
  let apexY = -1;
  let startI = -1;
  for (let i = 0; i < pred.count; i++) {
    const p = s[i];
    if (p.bounces >= 2) {
      if (p.t >= fb.t) break;
      continue;
    }
    if (p.bounces < 1 || p.t + 1e-6 < fb.t) continue;
    if (startI < 0) startI = i;
    if (p.y >= apexY) {
      apexY = p.y;
      apexI = i;
    }
  }
  if (apexI < 0 || startI < 0) {
    return {
      landX: fb.x,
      landZ: fb.z,
      landT: fb.t,
      apexX: fb.x,
      apexY: cfg.heightBands.low[0],
      apexZ: fb.z,
      apexT: fb.t,
      band: 'low',
      arc: [{ x: fb.x, y: 0.05, z: fb.z }],
    };
  }
  const ap = s[apexI];
  const span = Math.max(1, apexI - startI);
  const step = Math.max(1, Math.ceil(span / Math.max(1, maxDots - 1)));
  const arc: { x: number; y: number; z: number }[] = [];
  for (let i = startI; i <= apexI; i += step) {
    const p = s[i];
    arc.push({ x: p.x, y: p.y, z: p.z });
  }
  if (arc[arc.length - 1] !== undefined) {
    const last = arc[arc.length - 1];
    if (last.x !== ap.x || last.y !== ap.y || last.z !== ap.z) arc.push({ x: ap.x, y: ap.y, z: ap.z });
  }
  return {
    landX: fb.x,
    landZ: fb.z,
    landT: fb.t,
    apexX: ap.x,
    apexY: ap.y,
    apexZ: ap.z,
    apexT: ap.t,
    band: heightBandOf(ap.y, cfg),
    arc,
  };
}
