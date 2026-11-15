import type { PhysicsConfig } from '../../data/gameData';
import type { MoveBounds } from '../physics/court';
import type { ReachStage, StrokeId } from '../physics/types';

export type ActorState = 'idle' | 'run' | 'ready' | 'backswing' | 'swing' | 'recovery' | 'serve_ready' | 'toss' | 'split';

export interface Actor {
  x: number;
  z: number;
  vx: number;
  vz: number;
  targetX: number;
  targetZ: number;
  maxSpeed: number;
  state: ActorState;
  stateTime: number;
  stroke: StrokeId;
  reach: ReachStage;
  /** World-x side of the racket for the current/last swing (+1 / -1). */
  swingDir: 1 | -1;
}

export function createActor(x: number, z: number, maxSpeed: number): Actor {
  return { x, z, vx: 0, vz: 0, targetX: x, targetZ: z, maxSpeed, state: 'idle', stateTime: 0, stroke: 'fh_mid', reach: 'slight', swingDir: 1 };
}

export function setState(a: Actor, s: ActorState, now: number): void {
  if (a.state !== s) {
    a.state = s;
    a.stateTime = now;
  }
}

/** Arrive-style steering with acceleration / deceleration limits. */
export function moveActor(a: Actor, dt: number, cfg: PhysicsConfig, bounds: MoveBounds): void {
  const dx = a.targetX - a.x;
  const dz = a.targetZ - a.z;
  const dist = Math.hypot(dx, dz);
  let dvx = 0;
  let dvz = 0;
  if (dist > 0.005) {
    const brake = Math.sqrt(2 * cfg.playerDecel * dist);
    const speed = Math.min(a.maxSpeed, brake);
    dvx = (dx / dist) * speed;
    dvz = (dz / dist) * speed;
  }
  const ex = dvx - a.vx;
  const ez = dvz - a.vz;
  const e = Math.hypot(ex, ez);
  const speeding = dvx * a.vx + dvz * a.vz > 0 && Math.hypot(dvx, dvz) >= Math.hypot(a.vx, a.vz);
  const limit = (speeding ? cfg.playerAccel : cfg.playerDecel) * dt;
  if (e <= limit) {
    a.vx = dvx;
    a.vz = dvz;
  } else {
    a.vx += (ex / e) * limit;
    a.vz += (ez / e) * limit;
  }
  a.x += a.vx * dt;
  a.z += a.vz * dt;
  if (a.x < bounds.minX) { a.x = bounds.minX; a.vx = 0; }
  if (a.x > bounds.maxX) { a.x = bounds.maxX; a.vx = 0; }
  if (a.z < bounds.minZ) { a.z = bounds.minZ; a.vz = 0; }
  if (a.z > bounds.maxZ) { a.z = bounds.maxZ; a.vz = 0; }
  if (dist < 0.02 && Math.hypot(a.vx, a.vz) < 0.05) {
    a.vx = 0;
    a.vz = 0;
  }
}

/** Rough time to reach a point from rest-ish state, used for feasibility scoring. */
export function timeToReach(a: Actor, x: number, z: number, cfg: PhysicsConfig): number {
  const d = Math.hypot(x - a.x, z - a.z);
  const tAccel = a.maxSpeed / cfg.playerAccel;
  const dAccel = 0.5 * cfg.playerAccel * tAccel * tAccel;
  if (d <= dAccel) return Math.sqrt((2 * d) / cfg.playerAccel);
  return tAccel + (d - dAccel) / a.maxSpeed;
}
