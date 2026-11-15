import type { PhysicsConfig } from '../../data/gameData';

export type CourtSide = 'player' | 'npc';

export function netHeight(x: number, cfg: PhysicsConfig): number {
  const c = cfg.court;
  const t = Math.min(Math.abs(x) / c.netPostX, 1);
  return c.netCenterHeight + (c.netPostHeight - c.netCenterHeight) * t;
}

export function sideOfZ(z: number): CourtSide {
  return z < 0 ? 'player' : 'npc';
}

/** True if a bounce at (x, z) is inside the singles court of the given side. Lines count as in. */
export function inCourt(x: number, z: number, side: CourtSide, cfg: PhysicsConfig): boolean {
  const c = cfg.court;
  const r = cfg.ballRadiusM;
  if (Math.abs(x) > c.halfWidth + r) return false;
  return side === 'npc' ? z >= 0 && z <= c.halfLength + r : z <= 0 && z >= -c.halfLength - r;
}

/** Service box on `side`; `boxSign` is the world-x sign of the box (+1 right half, -1 left half). */
export function inServiceBox(x: number, z: number, side: CourtSide, boxSign: 1 | -1, cfg: PhysicsConfig): boolean {
  const c = cfg.court;
  const r = cfg.ballRadiusM;
  const xOk = boxSign > 0 ? x >= -r && x <= c.halfWidth + r : x <= r && x >= -c.halfWidth - r;
  const zOk = side === 'npc' ? z >= 0 && z <= c.serviceLine + r : z <= 0 && z >= -c.serviceLine - r;
  return xOk && zOk;
}

export interface MoveBounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export function movementBounds(side: CourtSide, cfg: PhysicsConfig): MoveBounds {
  const c = cfg.court;
  const m = cfg.movementMarginM;
  const back = c.halfLength + m;
  return side === 'player'
    ? { minX: -c.halfWidth - m, maxX: c.halfWidth + m, minZ: -back, maxZ: cfg.netApproachLimitZ }
    : { minX: -c.halfWidth - m, maxX: c.halfWidth + m, minZ: -cfg.netApproachLimitZ, maxZ: back };
}

export function clampToBounds(x: number, z: number, b: MoveBounds): { x: number; z: number } {
  return { x: Math.min(Math.max(x, b.minX), b.maxX), z: Math.min(Math.max(z, b.minZ), b.maxZ) };
}
