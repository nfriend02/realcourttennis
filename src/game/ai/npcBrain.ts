import type { AiLevelDef, HitQualityConfig, PhysicsConfig, RulesConfig, SpinType } from '../../data/gameData';
import type { IRandom } from '../core/random';
import type { Prediction } from '../physics/ballFlight';
import { clampToBounds, inCourt, type MoveBounds } from '../physics/court';
import { type ShotPlan, solveLaunch, solveNetShot } from '../physics/shotPlanner';
import type { Vec3 } from '../physics/types';

export interface NpcContactPlan {
  t: number;
  x: number;
  y: number;
  z: number;
  smash: boolean;
  targetX: number;
  targetZ: number;
  sideScreen: 1 | -1;
}

export interface NpcShot extends ShotPlan {
  error: 'none' | 'net' | 'long' | 'wide';
  smash: boolean;
}

export interface NpcContext {
  physics: PhysicsConfig;
  rules: RulesConfig;
  quality: HitQualityConfig;
  level: AiLevelDef;
  ballSpeedMul: number;
  returnMul: number;
}

/** Contact candidate on the NPC side (+z) after the first bounce; LV_5 may also smash high balls before the bounce. */
export function planNpcContact(pred: Prediction, npcX: number, npcZ: number, now: number, ctx: NpcContext, bounds: MoveBounds): NpcContactPlan | null {
  const cfg = ctx.physics;
  const m = ctx.rules.match;
  if (pred.netHit) return null;
  const fb = pred.firstBounce;
  if (!fb || !inCourt(fb.x, fb.z, 'npc', cfg)) return null;
  const s = pred.samples;
  let best = -1;
  let bestScore = Infinity;
  let bestSmash = false;
  for (let i = 0; i < pred.count; i++) {
    const p = s[i];
    if (p.t < now) continue;
    if (p.bounces >= 2) break;
    if (p.z <= 0.5 || p.vz <= 0) continue;
    let smash = false;
    if (p.bounces === 0) {
      if (!(ctx.level.smash && p.y > m.npcSmashHeightM && p.y < 2.9 && p.z > 4)) continue;
      smash = true;
    } else if (p.y < m.npcContactHeightMin || p.y > m.npcContactHeightMax) continue;
    const side: 1 | -1 = p.x >= npcX ? 1 : -1;
    const c = clampToBounds(p.x - side * cfg.preferredReachM, p.z + cfg.contactAheadM, bounds);
    const avail = p.t - now - ctx.level.reactionDelaySec;
    const need = Math.hypot(c.x - npcX, c.z - npcZ) / ctx.level.speed;
    const late = Math.max(0, need - avail);
    const score = Math.abs(p.z - m.npcHomeZ) * 0.4 + 2 * Math.abs(p.y - 1.1) + late * 20 - (smash ? 2 : 0);
    if (score < bestScore) {
      bestScore = score;
      best = i;
      bestSmash = smash;
    }
  }
  if (best < 0) return null;
  const p = s[best];
  const side: 1 | -1 = p.x >= npcX ? 1 : -1;
  const c = clampToBounds(p.x - side * cfg.preferredReachM, p.z + cfg.contactAheadM, bounds);
  return { t: p.t, x: p.x, y: p.y, z: p.z, smash: bestSmash, targetX: c.x, targetZ: c.z, sideScreen: side };
}

export function npcReturnChance(playerTier: number, ctx: NpcContext): number {
  const tier = ctx.quality.tiers[Math.max(0, Math.min(ctx.quality.tiers.length - 1, playerTier))];
  return ctx.level.returnChance * tier.npcReturnMul * ctx.returnMul;
}

function spinApex(spin: SpinType, ctx: NpcContext): number {
  const z = ctx.quality.zones;
  return spin === 'topspin' ? z.A.apexMul : spin === 'slice' ? z.C.apexMul : z.B.apexMul;
}

function styleTarget(ctx: NpcContext, from: Vec3, playerX: number, rng: IRandom): { x: number; z: number } {
  const hw = ctx.physics.court.halfWidth;
  const away = playerX >= 0 ? -1 : 1;
  switch (ctx.level.targetStyle) {
    case 'center':
      return { x: 0, z: -8.5 };
    case 'safe_deep':
      return { x: rng.range(-1.2, 1.2), z: -10.0 };
    case 'cross':
      return { x: (from.x >= 0 ? -1 : 1) * 2.6, z: -9.5 };
    case 'corners':
    case 'corners_smash': {
      // Pull the player wide, then stab the open corner (reverse-cross when they are already wide).
      const wide = Math.abs(playerX) > 1.2;
      const deep = rng.next() < (wide ? 0.85 : 0.7);
      const margin = wide ? 0.55 : 0.9;
      return { x: away * (hw - margin), z: deep ? -10.3 : -7.2 };
    }
    default:
      return { x: away * (hw - 0.9), z: rng.next() < 0.7 ? -10.3 : -7.6 };
  }
}

/** Successful return: style target + scatter, clamped 0.3 m inside the player court. */
export function planNpcReturn(from: Vec3, smash: boolean, playerX: number, ctx: NpcContext, rng: IRandom): NpcShot {
  const cfg = ctx.physics;
  const m = ctx.rules.match;
  const c = cfg.court;
  const t = styleTarget(ctx, from, playerX, rng);
  const radius = (1 - ctx.level.hitAccuracy) * m.npcScatterBaseM;
  const ang = rng.range(0, Math.PI * 2);
  const rr = radius * Math.sqrt(rng.next());
  const lim = m.npcCourtClampM;
  const tx = Math.min(Math.max(t.x + Math.cos(ang) * rr, -c.halfWidth + lim), c.halfWidth - lim);
  const tz = Math.min(Math.max(t.z + Math.sin(ang) * rr, -c.halfLength + lim), -2.0);
  let spin: SpinType = smash ? 'flat' : (rng.pick(ctx.level.spinWeights) as SpinType);
  const corners = ctx.level.targetStyle === 'corners' || ctx.level.targetStyle === 'corners_smash';
  if (!smash && corners && Math.abs(playerX) > 1.2 && Math.sign(tx) !== Math.sign(playerX || 1) && rng.next() < 0.55) {
    spin = 'slice';
  }
  const vh = m.npcBaseShotSpeed * ctx.ballSpeedMul * (smash ? m.npcSmashSpeedMul : 1);
  const velocity = solveLaunch(from, tx, tz, vh, spin, smash ? 0.9 : spinApex(spin, ctx), true, cfg);
  return { velocity, spin, target: { x: tx, z: tz }, error: 'none', smash };
}

/** Rally-length comeback: longer rallies slightly lower NPC return chance (mobile mini-game pacing). */
export function npcComebackMul(rallyHits: number, rules: RulesConfig): number {
  const c = rules.comeback;
  if (!c || rallyHits < c.rallyStart) return 1;
  const drops = (rallyHits - c.rallyStart + 1) * c.returnChanceDropPerHit;
  return Math.max(c.returnChanceFloorMul, 1 - drops);
}

/** Failed return roll: Net 40% / Long 30% / Wide 30%. */
export function planNpcError(from: Vec3, ctx: NpcContext, rng: IRandom): NpcShot {
  const cfg = ctx.physics;
  const m = ctx.rules.match;
  const c = cfg.court;
  const kind = rng.pick(m.npcErrorWeights) as 'net' | 'long' | 'wide';
  const vh = m.npcBaseShotSpeed * ctx.ballSpeedMul * 0.9;
  if (kind === 'net') {
    const aim = rng.range(-2.5, 2.5);
    return { velocity: solveNetShot(from, aim, vh, cfg), spin: 'flat', target: { x: aim, z: 0 }, error: 'net', smash: false };
  }
  if (kind === 'long') {
    const tx = rng.range(-2.5, 2.5);
    const tz = -(c.halfLength + rng.range(0.6, 2.2));
    return { velocity: solveLaunch(from, tx, tz, vh, 'flat', 1, true, cfg), spin: 'flat', target: { x: tx, z: tz }, error: 'long', smash: false };
  }
  const sx = rng.next() < 0.5 ? -1 : 1;
  const tx = sx * (c.halfWidth + rng.range(0.5, 1.6));
  const tz = -rng.range(6, 10);
  return { velocity: solveLaunch(from, tx, tz, vh, 'flat', 1, true, cfg), spin: 'flat', target: { x: tx, z: tz }, error: 'wide', smash: false };
}

/** NPC serve: always in, cross-court into the player's service box. */
export function planNpcServe(from: Vec3, boxSign: 1 | -1, ctx: NpcContext, rng: IRandom): ShotPlan {
  const cfg = ctx.physics;
  const c = cfg.court;
  const center = boxSign * (c.halfWidth / 2);
  const tx = Math.min(Math.max(center + rng.range(-1.1, 1.1), boxSign > 0 ? 0.35 : -c.halfWidth + 0.35), boxSign > 0 ? c.halfWidth - 0.35 : -0.35);
  const tz = -rng.range(4.4, c.serviceLine - 0.4);
  const vh = ctx.rules.match.npcServeSpeed * ctx.ballSpeedMul;
  return { velocity: solveLaunch(from, tx, tz, vh, 'flat', 1, true, cfg), spin: 'flat', target: { x: tx, z: tz } };
}
