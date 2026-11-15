import type { HitQualityConfig, PhysicsConfig, SpinType } from '../../data/gameData';
import type { IRandom } from '../core/random';
import { netHeight } from './court';
import type { HitJudgment, Vec3 } from './types';

export interface ShotPlan {
  velocity: Vec3;
  spin: SpinType;
  target: { x: number; z: number };
}

/**
 * Solves the launch velocity that lands at (tx, tz) with horizontal speed `vh`.
 * The apex is capped at `maxApexM`; if `clearNet` is set, flight time then grows by 5% steps until the ball
 * clears the net by the configured margin (net clearance wins over the cap).
 */
export function solveLaunch(
  from: Vec3,
  tx: number,
  tz: number,
  vh: number,
  spin: SpinType,
  apexMul: number,
  clearNet: boolean,
  cfg: PhysicsConfig,
): Vec3 {
  const dx = tx - from.x;
  const dz = tz - from.z;
  const dist = Math.max(0.5, Math.hypot(dx, dz));
  const g = cfg.gravity * cfg.spin[spin].gravityMul;
  const r = cfg.ballRadiusM;
  let tau = (dist / Math.max(1, vh)) * apexMul;
  // Keep the apex at or below maxApexM so the arc stays inside the telephoto camera view.
  const apexRoom = cfg.maxApexM - from.y;
  if (apexRoom > 0) {
    const vyMax = Math.sqrt(2 * g * apexRoom);
    const tauCap = (vyMax + Math.sqrt(Math.max(0, vyMax * vyMax - 2 * g * (r - from.y)))) / g;
    tau = Math.min(tau, tauCap);
  }
  const v = { x: 0, y: 0, z: 0 };
  for (let i = 0; i < 14; i++) {
    v.x = dx / tau;
    v.z = dz / tau;
    v.y = (r - from.y + 0.5 * g * tau * tau) / tau;
    const crossesNet = (from.z < 0) !== (tz < 0);
    if (!clearNet || !crossesNet) return v;
    const tn = -from.z / v.z;
    const yn = from.y + v.y * tn - 0.5 * g * tn * tn;
    const xn = from.x + v.x * tn;
    if (yn >= netHeight(xn, cfg) + cfg.netClearanceM + r) return v;
    tau *= 1.05;
  }
  return v;
}

/** Launch that meets the net plane below the tape, so the ball is stopped by the net. */
export function solveNetShot(from: Vec3, aimX: number, vh: number, cfg: PhysicsConfig): Vec3 {
  const dirZ = from.z < 0 ? 1 : -1;
  const tz = dirZ * 6;
  const dx = aimX - from.x;
  const dz = tz - from.z;
  const dist = Math.max(0.5, Math.hypot(dx, dz));
  const vx = (dx / dist) * vh;
  const vz = (dz / dist) * vh;
  const tn = -from.z / vz;
  const xn = from.x + vx * tn;
  const desired = Math.max(cfg.ballRadiusM * 2, netHeight(xn, cfg) - 0.15);
  const g = cfg.gravity;
  const vy = (desired - from.y + 0.5 * g * tn * tn) / tn;
  return { x: vx, y: vy, z: vz };
}

export interface PlayerShotInput {
  judgment: HitJudgment;
  from: Vec3;
  powerStat: number;
  controlStat: number;
  chargeMul: number;
  speedMul: number;
}

function clamp(v: number, lo: number, hi: number): number {
  return Math.min(Math.max(v, lo), hi);
}

/** Target-solved player shot toward the NPC court (+z). */
export function planPlayerShot(input: PlayerShotInput, cfg: PhysicsConfig, hq: HitQualityConfig, rng: IRandom): ShotPlan {
  const j = input.judgment;
  const c = cfg.court;
  const tierDef = hq.tiers[Math.max(0, j.tier)];
  const spin = j.spin;
  const u = clamp(j.x / 0.5, -2, 2);
  const v = clamp(j.y / 0.5, -2, 2);
  const lateral = c.halfWidth - cfg.inCourtMarginM;
  let tx = clamp(u, -1, 1) * lateral;
  let tz = cfg.depthTargetMin + (cfg.depthTargetMax - cfg.depthTargetMin) * ((clamp(v, -1, 1) + 1) / 2);
  const vh = cfg.baseShotSpeed[spin] * tierDef.speedMul * input.chargeMul * Math.sqrt(input.powerStat / 85) * input.speedMul;

  if (j.result === 'net') {
    return { velocity: solveNetShot(input.from, tx, vh, cfg), spin: 'flat', target: { x: tx, z: 0 } };
  }
  if (j.result === 'long') {
    tz = c.halfLength + 0.5 + 2.0 * clamp((Math.abs(j.y) - 0.5) / 0.5, 0, 1);
  } else if (j.result === 'left' || j.result === 'right') {
    const s = j.result === 'left' ? -1 : 1;
    tx = s * (c.halfWidth + 0.3 + 1.7 * clamp((Math.abs(j.x) - 0.5) / 0.5, 0, 1));
  } else {
    const scatter = tierDef.scatterM * (1 - (input.controlStat - 85) * 0.01);
    tx = clamp(tx + rng.range(-scatter, scatter), -c.halfWidth + 0.2, c.halfWidth - 0.2);
    tz = clamp(tz + rng.range(-scatter, scatter), 1.0, c.halfLength - 0.2);
  }
  const row = j.zone === 'none' ? 'B' : (j.zone[0] as 'A' | 'B' | 'C');
  const apexMul = hq.zones[row].apexMul;
  return { velocity: solveLaunch(input.from, tx, tz, vh, spin, apexMul, j.result === 'in', cfg), spin, target: { x: tx, z: tz } };
}

/** Player serve into the diagonal service box on the NPC side. */
export function planPlayerServe(
  j: HitJudgment,
  from: Vec3,
  boxSign: 1 | -1,
  powerStat: number,
  speedMul: number,
  cfg: PhysicsConfig,
  hq: HitQualityConfig,
): ShotPlan {
  const c = cfg.court;
  const tierDef = hq.tiers[Math.max(0, j.tier)];
  const vh = cfg.serveSpeed * tierDef.speedMul * Math.sqrt(powerStat / 85) * speedMul;
  const boxCenter = boxSign * (c.halfWidth / 2);
  const tx = clamp(boxCenter + clamp(j.x / 0.5, -1, 1) * 1.6, boxSign > 0 ? 0.25 : -c.halfWidth + 0.25, boxSign > 0 ? c.halfWidth - 0.25 : -0.25);
  if (j.result === 'net') return { velocity: solveNetShot(from, tx, vh, cfg), spin: 'flat', target: { x: tx, z: 0 } };
  if (j.result === 'long') {
    const tz = c.serviceLine + 1.2;
    return { velocity: solveLaunch(from, tx, tz, vh, 'flat', 1, true, cfg), spin: 'flat', target: { x: tx, z: tz } };
  }
  const depth = [5.6, 5.0, 4.4][Math.min(2, Math.max(0, j.tier))];
  return { velocity: solveLaunch(from, tx, depth, vh, 'flat', 1, true, cfg), spin: 'flat', target: { x: tx, z: depth } };
}
