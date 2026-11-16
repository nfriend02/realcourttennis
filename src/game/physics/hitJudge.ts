import type { HitQualityConfig, PhysicsConfig } from '../../data/gameData';
import type { IRandom } from '../core/random';
import {
  type ContactSample,
  type Hand,
  type HitJudgment,
  type ReachStage,
  type ShotResult,
  type ShotZone,
  type StrokeId,
  sideDir,
  strokeHeight,
  strokeSide,
} from './types';

export interface JudgeContext {
  physics: PhysicsConfig;
  quality: HitQualityConfig;
  hand: Hand;
  /** Character reach stat multiplier (Reach / 85). */
  reachMul: number;
  /** Timing window multiplier (Control stat and admin tuning). */
  windowMul: number;
  /** Extra multiplier applied only to the Perfect tier window (character passive). */
  perfectWindowMul?: number;
}

export interface SwingInput {
  stroke: StrokeId;
  impactTime: number;
  playerX: number;
}

const ZONE_GRID: readonly ShotZone[][] = [
  ['A1', 'A2', 'A3'],
  ['B1', 'B2', 'B3'],
  ['C1', 'C2', 'C3'],
];

/** Classifies the outer 25% fault ring. y is checked before x. */
export function classifyFace(x: number, y: number): ShotResult {
  if (y > 0.5) return 'long';
  if (y < -0.5) return 'net';
  if (x < -0.5) return 'left';
  if (x > 0.5) return 'right';
  return 'in';
}

/** Inner 3x3 zone inside the |x|,|y| <= 0.5 core. */
export function zoneOf(x: number, y: number): ShotZone {
  if (Math.abs(x) > 0.5 || Math.abs(y) > 0.5) return 'none';
  const u = x / 0.5;
  const v = y / 0.5;
  const col = u < -1 / 3 ? 0 : u > 1 / 3 ? 2 : 1;
  const row = v > 1 / 3 ? 0 : v < -1 / 3 ? 2 : 1;
  return ZONE_GRID[row][col];
}

export function nearestFault(x: number, y: number): ShotResult {
  if (Math.abs(y) >= Math.abs(x)) return y >= 0 ? 'long' : 'net';
  return x < 0 ? 'left' : 'right';
}

export function reachStageFor(distFromShoulder: number): ReachStage {
  if (distFromShoulder < 0.3) return 'bent';
  if (distFromShoulder < 0.6) return 'slight';
  return 'extended';
}

export function timingTier(absDt: number, ctx: JudgeContext): number {
  const tiers = ctx.quality.tiers;
  const perfectMul = ctx.perfectWindowMul ?? 1;
  for (let i = 0; i < tiers.length; i++) {
    const tierMul = i === 0 ? perfectMul : 1;
    if (absDt <= tiers[i].timingMaxSec * ctx.windowMul * tierMul) return i;
  }
  return -1;
}

export function offsetTier(d: number, ctx: JudgeContext): number {
  const tiers = ctx.quality.tiers;
  for (let i = 0; i < tiers.length; i++) {
    if (d < tiers[i].offsetMax) return i;
  }
  return tiers.length - 1;
}

/** Lateral residual (meters, world-x sign) when the ball is outside the reachable band of the stroke side. */
export function lateralResidual(ballX: number, stroke: StrokeId, playerX: number, ctx: JudgeContext): { residual: number; distFromShoulder: number } {
  const p = ctx.physics;
  const dir = sideDir(strokeSide(stroke), ctx.hand);
  const sideOffset = (ballX - playerX) * dir;
  const distFromShoulder = sideOffset - p.shoulderOffsetM;
  const reachMax = p.reachMaxBaseM * ctx.reachMul;
  let residual = 0;
  if (distFromShoulder < -p.closeAllowanceM) residual = distFromShoulder - 0.2;
  else if (distFromShoulder > reachMax) residual = distFromShoulder - reachMax;
  return { residual: residual * dir, distFromShoulder };
}

function whiff(dt: number): HitJudgment {
  return { quality: 'miss', tier: -1, timingDeltaSec: dt, x: 0, y: 0, zone: 'none', result: 'whiff', spin: 'flat' };
}

/**
 * Racket face model (07 §8.7): timing error becomes horizontal face offset, height error vertical offset.
 * Quality = worse of timing tier and offset tier. Outer 25% ring = fault, inner 3x3 = shot zone.
 */
export function judgeHit(swing: SwingInput, contact: ContactSample, ctx: JudgeContext, rng: IRandom): HitJudgment {
  const p = ctx.physics;
  const dt = swing.impactTime - contact.t;
  const absDt = Math.abs(dt);
  if (absDt > p.missWindowSec * ctx.windowMul) return whiff(dt);

  const band = p.heightBands[strokeHeight(swing.stroke)];
  const center = (band[0] + band[1]) / 2;
  const full = band[1] - band[0];
  const y = (contact.y - center) / full;
  if (Math.abs(y) > 1) return whiff(dt);

  const dir = sideDir(strokeSide(swing.stroke), ctx.hand);
  const { residual } = lateralResidual(contact.x, swing.stroke, swing.playerX, ctx);
  const x = dir * (dt / (p.timingFullScaleSec * ctx.windowMul)) + residual / p.faceHalfWidthM;
  if (Math.abs(x) > 1) return whiff(dt);

  const tTier = timingTier(absDt, ctx);
  const oTier = offsetTier(Math.sqrt(x * x + y * y), ctx);
  const tier = Math.max(tTier < 0 ? ctx.quality.tiers.length - 1 : tTier, oTier);
  const weakIndex = ctx.quality.tiers.length - 1;
  const id = ctx.quality.tiers[tier].quality;
  const quality = tier === weakIndex ? (dt < 0 ? 'early' : 'late') : (id as 'perfect' | 'great' | 'good');

  let result = classifyFace(x, y);
  if (result === 'in' && rng.next() >= ctx.quality.tiers[tier].inChance) result = nearestFault(x, y);
  const zone = zoneOf(x, y);
  const row = zone === 'none' ? (y > 0 ? 'A' : y < 0 ? 'C' : 'B') : (zone[0] as 'A' | 'B' | 'C');
  return { quality, tier, timingDeltaSec: dt, x, y, zone, result, spin: ctx.quality.zones[row].spin };
}

/** Serve judgment uses timing only (07 §8.2.3). */
export function judgeServe(dt: number, hand: Hand, ctx: JudgeContext): HitJudgment {
  const p = ctx.physics;
  if (Math.abs(dt) > p.missWindowSec * ctx.windowMul) return whiff(dt);
  const x = sideDir('forehand', hand) * (dt / (p.timingFullScaleSec * ctx.windowMul));
  const tTier = timingTier(Math.abs(dt), ctx);
  const oTier = offsetTier(Math.abs(x), ctx);
  const weakIndex = ctx.quality.tiers.length - 1;
  const tier = Math.max(tTier < 0 ? weakIndex : tTier, oTier);
  if (tier === weakIndex) {
    return { quality: dt < 0 ? 'early' : 'late', tier, timingDeltaSec: dt, x, y: 0, zone: 'none', result: dt < 0 ? 'long' : 'net', spin: 'flat' };
  }
  const quality = ctx.quality.tiers[tier].quality as 'perfect' | 'great' | 'good';
  return { quality, tier, timingDeltaSec: dt, x, y: 0, zone: zoneOf(x, 0), result: 'in', spin: 'flat' };
}
