import type { PhysicsConfig } from '../../data/gameData';
import type { Prediction } from '../physics/ballFlight';
import { clampToBounds, type MoveBounds } from '../physics/court';
import { type Hand, type StrokeHeight, type StrokeId, makeStroke, sideForScreen } from '../physics/types';
import { type Actor, timeToReach } from './actor';

export interface Intent {
  ix: number;
  iy: number;
}

export interface ContactPlan {
  t: number;
  x: number;
  y: number;
  z: number;
  bounced: boolean;
  /** World-x side of the racket (+1 = ball on the player's right). */
  sideScreen: 1 | -1;
  targetX: number;
  targetZ: number;
  stroke: StrokeId;
}

export function applyDeadZone(v: number, dz: number): number {
  const a = Math.abs(v);
  if (a <= dz) return 0;
  return (Math.sign(v) * (a - dz)) / (1 - dz);
}

/** Preferred contact depth from the forward/backward intent (piecewise linear). */
export function preferredDepth(iy: number, cfg: PhysicsConfig): number {
  const y = applyDeadZone(iy, cfg.intentDeadZone);
  if (y >= 0) return cfg.defaultDepthZ + (cfg.depthNetZ - cfg.defaultDepthZ) * y;
  return cfg.defaultDepthZ + (cfg.depthBackZ - cfg.defaultDepthZ) * -y;
}

export function heightBandOf(h: number, cfg: PhysicsConfig): StrokeHeight {
  if (h >= cfg.heightBands.high[0]) return 'high';
  if (h >= cfg.heightBands.middle[0]) return 'middle';
  return 'low';
}

const VOLLEY_DEPTH_LIMIT = -6.4;

/**
 * Picks the contact sample closest to the preferred depth (07 §8.5.2), weighting height near 1.0 m
 * and penalising samples the actor cannot reach in time.
 */
export function planContact(
  pred: Prediction,
  actor: Actor,
  intent: Intent,
  hand: Hand,
  now: number,
  stickySide: 1 | -1 | 0,
  cfg: PhysicsConfig,
  bounds: MoveBounds,
): ContactPlan | null {
  const zPref = preferredDepth(intent.iy, cfg);
  const allowVolley = zPref > VOLLEY_DEPTH_LIMIT;
  const s = pred.samples;
  let best = -1;
  let bestScore = Infinity;
  let bestSide: 1 | -1 = 1;
  for (let i = 0; i < pred.count; i++) {
    const p = s[i];
    if (p.t < now + 0.05) continue;
    if (p.bounces >= 2) break;
    if (p.z >= 0 || p.vz >= 0) continue;
    if (p.bounces === 0 && !allowVolley) continue;
    if (p.y < cfg.contactHeightMin || p.y > cfg.contactHeightMax) continue;
    const side = sideFor(p.x, actor.x, stickySide, hand);
    const tx = p.x - side * cfg.preferredReachM;
    const tz = p.z - cfg.contactAheadM;
    const c = clampToBounds(tx, tz, bounds);
    const avail = p.t - now - cfg.readyLeadSec;
    const need = timeToReach(actor, c.x, c.z, cfg);
    const late = Math.max(0, need - avail);
    const clampErr = Math.hypot(c.x - tx, c.z - tz);
    const score = Math.abs(p.z - zPref) + 3 * Math.abs(p.y - cfg.contactPreferredHeight) + late * 25 + clampErr * 10;
    if (score < bestScore) {
      bestScore = score;
      best = i;
      bestSide = side;
    }
  }
  if (best < 0) return null;
  const p = s[best];
  const c = clampToBounds(p.x - bestSide * cfg.preferredReachM, p.z - cfg.contactAheadM, bounds);
  return {
    t: p.t,
    x: p.x,
    y: p.y,
    z: p.z,
    bounced: p.bounces > 0,
    sideScreen: bestSide,
    targetX: c.x,
    targetZ: c.z,
    stroke: makeStroke(sideForScreen(bestSide, hand), heightBandOf(p.y, cfg)),
  };
}

function sideFor(ballX: number, actorX: number, sticky: 1 | -1 | 0, hand: Hand): 1 | -1 {
  if (sticky !== 0) return sticky;
  const d = ballX - actorX;
  if (Math.abs(d) < 0.25) return hand === 'right' ? 1 : -1;
  return d > 0 ? 1 : -1;
}