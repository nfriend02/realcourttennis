import type { PhysicsConfig, SpinType } from '../../data/gameData';
import { netHeight } from './court';
import type { BallSample, ContactSample, Vec3 } from './types';

export interface BallState {
  p: Vec3;
  v: Vec3;
  spin: SpinType;
  /** Gravity multiplier; spin multiplier until the first bounce, then 1.0. */
  gMul: number;
  /**
   * Flight time scale k: the whole flight takes k times longer on the same path.
   * Velocities are divided by k and gravity by k², so bounces and the trajectory shape are unchanged.
   */
  slow: number;
  bounces: number;
  netHit: boolean;
  rolling: boolean;
}

export type FlightEventType = 'bounce' | 'net';

export interface FlightEvent {
  type: FlightEventType;
  x: number;
  y: number;
  z: number;
  /** Time offset inside the step, seconds. */
  dt: number;
  bounces: number;
}

export function createBall(p: Vec3, v: Vec3, spin: SpinType, cfg: PhysicsConfig): BallState {
  return {
    p: { x: p.x, y: p.y, z: p.z },
    v: { x: v.x, y: v.y, z: v.z },
    spin,
    gMul: cfg.spin[spin].gravityMul,
    slow: 1,
    bounces: 0,
    netHit: false,
    rolling: false,
  };
}

/** Rescales a ball (with slow = 1) so its whole flight takes k times longer on the same path. */
export function applySlow(b: BallState, k: number): void {
  const r = k / b.slow;
  b.v.x /= r;
  b.v.y /= r;
  b.v.z /= r;
  b.slow = k;
}

export function cloneBall(b: BallState): BallState {
  return { ...b, p: { ...b.p }, v: { ...b.v } };
}

function advance(b: BallState, t: number, g: number): void {
  b.p.x += b.v.x * t;
  b.p.z += b.v.z * t;
  if (!b.rolling) {
    b.p.y += b.v.y * t - 0.5 * g * t * t;
    b.v.y -= g * t;
  }
}

/**
 * Advances the ball analytically by `dt`, resolving net contact and bounces inside the step.
 * Returns the number of events written to `out` (max 4).
 */
export function stepBall(b: BallState, dt: number, cfg: PhysicsConfig, out?: FlightEvent[]): number {
  const r = cfg.ballRadiusM;
  let remaining = dt;
  let count = 0;
  for (let guard = 0; guard < 4 && remaining > 1e-9; guard++) {
    const g = (cfg.gravity * b.gMul) / (b.slow * b.slow);

    if (b.rolling) {
      advance(b, remaining, g);
      const decay = Math.max(0, 1 - (3 * remaining) / b.slow);
      b.v.x *= decay;
      b.v.z *= decay;
      break;
    }

    // Time to ground contact within this step.
    let tGround = Infinity;
    const a = -0.5 * g;
    const bq = b.v.y;
    const cq = b.p.y - r;
    const disc = bq * bq - 4 * a * cq;
    if (disc >= 0) {
      const sq = Math.sqrt(disc);
      const t1 = (-bq + sq) / (2 * a);
      const t2 = (-bq - sq) / (2 * a);
      const tc = Math.max(t1, t2);
      if (tc > 1e-7 && tc <= remaining) tGround = tc;
    }

    // Time to net plane crossing within this step.
    let tNet = Infinity;
    if (!b.netHit && b.v.z !== 0) {
      const tn = -b.p.z / b.v.z;
      if (tn > 1e-7 && tn <= remaining && tn < tGround) tNet = tn;
    }

    if (tNet < Infinity) {
      advance(b, tNet, g);
      const nh = netHeight(b.p.x, cfg);
      remaining -= tNet;
      if (b.p.y < nh + r) {
        b.netHit = true;
        const dir = Math.sign(b.v.z) || 1;
        b.p.z = -dir * (r + 0.01);
        b.v.z = -b.v.z * 0.12;
        b.v.x *= 0.3;
        b.v.y = Math.min(b.v.y, 0) * 0.3;
        if (out && count < out.length) out[count] = { type: 'net', x: b.p.x, y: b.p.y, z: 0, dt: dt - remaining, bounces: b.bounces };
        count++;
      } else {
        // Nudge past the plane to avoid re-detecting the same crossing.
        b.p.z += Math.sign(b.v.z) * 1e-6;
      }
      continue;
    }

    if (tGround < Infinity) {
      advance(b, tGround, g);
      remaining -= tGround;
      b.p.y = r;
      const s = cfg.spin[b.bounces === 0 ? b.spin : 'flat'];
      b.v.y = -b.v.y * s.restitution;
      b.v.x *= s.friction;
      b.v.z *= s.friction;
      b.bounces++;
      b.gMul = 1;
      if (out && count < out.length) out[count] = { type: 'bounce', x: b.p.x, y: r, z: b.p.z, dt: dt - remaining, bounces: b.bounces };
      count++;
      if (b.v.y < 0.6 / b.slow) {
        b.v.y = 0;
        b.rolling = true;
      }
      continue;
    }

    advance(b, remaining, g);
    remaining = 0;
  }
  return count;
}

export interface Prediction {
  samples: BallSample[];
  count: number;
  firstBounce: { x: number; z: number; t: number } | null;
  secondBounce: { x: number; z: number; t: number } | null;
  netHit: boolean;
}

export const PREDICTION_CAPACITY = 2400;

export function createPrediction(): Prediction {
  const samples: BallSample[] = new Array(PREDICTION_CAPACITY);
  for (let i = 0; i < PREDICTION_CAPACITY; i++) samples[i] = { t: 0, x: 0, y: 0, z: 0, vz: 0, bounces: 0 };
  return { samples, count: 0, firstBounce: null, secondBounce: null, netHit: false };
}

const scratchEvents: FlightEvent[] = [
  { type: 'bounce', x: 0, y: 0, z: 0, dt: 0, bounces: 0 },
  { type: 'bounce', x: 0, y: 0, z: 0, dt: 0, bounces: 0 },
  { type: 'bounce', x: 0, y: 0, z: 0, dt: 0, bounces: 0 },
  { type: 'bounce', x: 0, y: 0, z: 0, dt: 0, bounces: 0 },
];

/**
 * Fills `pred` by stepping a copy of the ball at the simulation tick, so predictions match real flight exactly.
 * Sample times are absolute (startTime + k * dt).
 */
export function predict(ball: BallState, startTime: number, cfg: PhysicsConfig, pred: Prediction): Prediction {
  const dt = 1 / cfg.simTickHz;
  const b = cloneBall(ball);
  pred.count = 0;
  pred.firstBounce = null;
  pred.secondBounce = null;
  pred.netHit = false;
  const write = (t: number) => {
    const s = pred.samples[pred.count++];
    s.t = t;
    s.x = b.p.x;
    s.y = b.p.y;
    s.z = b.p.z;
    s.vz = b.v.z;
    s.bounces = b.bounces;
  };
  write(startTime);
  let t = startTime;
  while (pred.count < PREDICTION_CAPACITY) {
    const n = stepBall(b, dt, cfg, scratchEvents);
    for (let i = 0; i < n && i < scratchEvents.length; i++) {
      const e = scratchEvents[i];
      const et = t + e.dt;
      if (e.type === 'net') pred.netHit = true;
      else if (e.bounces === 1) pred.firstBounce = { x: e.x, z: e.z, t: et };
      else if (e.bounces === 2) pred.secondBounce = { x: e.x, z: e.z, t: et };
    }
    t += dt;
    write(t);
    if (b.bounces >= 3 || b.rolling || Math.abs(b.p.z) > 30 || Math.abs(b.p.x) > 20) break;
  }
  return pred;
}

/**
 * First crossing of the plane z = planeZ in the direction of travel (dir = -1 toward the player, +1 toward the NPC),
 * before the second bounce. Linear interpolation between samples.
 */
export function findPlaneCrossing(pred: Prediction, planeZ: number, dir: 1 | -1, fromTime: number): ContactSample | null {
  const s = pred.samples;
  for (let i = 1; i < pred.count; i++) {
    const a = s[i - 1];
    const b = s[i];
    if (b.t < fromTime) continue;
    if (a.bounces >= 2) return null;
    const crossed = dir < 0 ? a.z > planeZ && b.z <= planeZ : a.z < planeZ && b.z >= planeZ;
    if (!crossed) continue;
    const k = (planeZ - a.z) / (b.z - a.z || 1e-9);
    return {
      t: a.t + (b.t - a.t) * k,
      x: a.x + (b.x - a.x) * k,
      y: a.y + (b.y - a.y) * k,
      z: planeZ,
      bounced: b.bounces >= 1,
    };
  }
  return null;
}

export function sampleAt(pred: Prediction, time: number): BallSample | null {
  const s = pred.samples;
  if (pred.count === 0) return null;
  for (let i = 1; i < pred.count; i++) {
    if (s[i].t >= time) return s[i];
  }
  return s[pred.count - 1];
}
